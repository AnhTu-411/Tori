const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Story = require("../models/Story");
const Chapter = require("../models/Chapter");
const Transaction = require("../models/Transaction");
const { AdminLog, logAdminAction } = require("../models/AdminLog");
const { TrashStory, TrashChapter } = require("../models/Trash");

// --- CÁC API VỀ TRUYỆN (STORIES) ---

// 1. API lấy toàn bộ danh sách truyện (Dùng cho Trang chủ và Admin)
router.get("/api/stories", async (req, res) => {
  try {
    const { publisherId, role, title, genres, status, year, sort, approvalStatus, page = 1, limit = 12 } = req.query;
    let query = {};
    if (publisherId) {
      query.publisherId = publisherId;
    }
    
    if (title) {
      // Chuẩn hoá title trước khi search
      const normalizedTitle = title.trim().normalize('NFC');
      query.$or = [
        { title: { $regex: normalizedTitle, $options: "i" } },
        { author: { $regex: normalizedTitle, $options: "i" } }
      ];
    }
    
    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : genres.split(",");
      const regexArray = genreArray.map(g => {
        const normalizedG = g.trim().normalize('NFC');
        return new RegExp("^" + normalizedG.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + "$", "i");
      });
      query.genres = { $all: regexArray };
    }
    
    if (status && status !== "Tất cả" && status !== "") {
      query.status = status;
    }

    if (year && year !== "Tất cả" && year !== "") {
      // Tìm theo năm (sử dụng MongoDB aggregation operator $expr)
      query.$expr = {
        $eq: [
          { $year: { $ifNull: ["$publishedDate", "$createdAt"] } },
          parseInt(year)
        ]
      };
    }

    if (approvalStatus === 'approved') {
      query.isApproved = true;
    } else if (approvalStatus === 'unapproved') {
      query.isApproved = { $ne: true };
    } else if (approvalStatus === 'has_unapproved_chapters') {
      const unapprovedChapters = await Chapter.find({ isApproved: { $ne: true } }, 'storyId');
      const storyIds = unapprovedChapters.map(ch => ch.storyId);
      query._id = { $in: storyIds };
    } else if (approvalStatus === 'pending_delete') {
      query.deleteRequested = true;
    }

    // Nếu không phải admin/owner và không phải đang tìm truyện của chính mình, chỉ lấy truyện đã duyệt hoặc truyện cũ
    if (role !== "admin" && role !== "owner" && !publisherId) {
      // Vì $expr và $or có thể đụng độ, gộp vào $and
      const authFilter = {
        $or: [
          { isApproved: true },
          { isApproved: { $exists: false } }
        ]
      };
      
      if (query.$or || query.$expr) {
         if (!query.$and) query.$and = [];
         query.$and.push(authFilter);
         if (query.$or) {
            query.$and.push({ $or: query.$or });
            delete query.$or;
         }
         if (query.$expr) {
            query.$and.push({ $expr: query.$expr });
            delete query.$expr;
         }
      } else {
         query.$or = authFilter.$or;
      }
    }
    
    // Sort logic
    let sortObj = { createdAt: -1 };
    if (sort === 'az') sortObj = { title: 1 };
    else if (sort === 'za') sortObj = { title: -1 };
    
    const pageNum = parseInt(page) || 1;
    const limitNum = parseInt(limit) || 12;
    const skip = (pageNum - 1) * limitNum;

    const total = await Story.countDocuments(query);
    const stories = await Story.find(query).sort(sortObj).skip(skip).limit(limitNum);

    // Nếu là admin/owner, đếm số chương chưa duyệt cho mỗi truyện
    let storiesData = stories.map(s => s.toObject());
    if (role === "admin" || role === "owner") {
      for (let i = 0; i < storiesData.length; i++) {
        const pendingCount = await Chapter.countDocuments({
          storyId: storiesData[i]._id,
          isApproved: { $ne: true }
        });
        const deleteRequestCount = await Chapter.countDocuments({
          storyId: storiesData[i]._id,
          deleteRequested: true
        });
        storiesData[i].pendingChapters = pendingCount;
        storiesData[i].deleteRequestChapters = deleteRequestCount;
      }
    }

    res.status(200).json({
      data: storiesData,
      total: total,
      page: pageNum,
      totalPages: Math.ceil(total / limitNum),
      limit: limitNum
    });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. API thêm truyện mới (Dùng cho Admin/Publisher)
router.post("/api/stories", async (req, res) => {
  try {
    const { title, author, description, coverImg, status, isPremium, price, publisherId, role, genres, publishedDate } = req.body;
    
    if (role !== "admin" && role !== "owner" && role !== "publisher") {
      return res.status(403).json({ message: "Bạn không có quyền thêm truyện!" });
    }

    // Nếu admin/owner tạo truyện thì duyệt luôn, ngược lại là false
    const approved = (role === "admin" || role === "owner") ? true : false;

    const newStory = new Story({
      title,
      author,
      description,
      coverImg,
      status,
      genres: genres || [],
      publishedDate: publishedDate ? new Date(publishedDate) : null,
      isPremium: isPremium || false,
      price: price || 0,
      publisherId: publisherId || null,
      isApproved: approved
    });
    await newStory.save();
    
    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(req.body.adminUsername, role, "CREATE_STORY", `Đã thêm truyện mới: "${title}" (ID: ${newStory._id})`);
    }

    res
      .status(201)
      .json({ message: "Thêm truyện thành công!", story: newStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. API lấy thông tin chi tiết của 1 bộ truyện cụ thể dựa vào ID (Dùng cho Trang chi tiết)
router.get("/api/stories/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4. API cập nhật thông tin truyện
router.put("/api/stories/:id", async (req, res) => {
  try {
    const { role, adminUsername, publisherId } = req.body;

    const story = await Story.findById(req.params.id);
    if (!story) return res.status(404).json({ message: "Không tìm thấy truyện này!" });

    if (role === "publisher") {
      if (!story.publisherId || story.publisherId.toString() !== publisherId) {
        return res.status(403).json({ message: "Bạn không có quyền sửa truyện của người khác!" });
      }
    } else if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Bạn không có quyền sửa truyện!" });
    }

    let updateData = { ...req.body };

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }

    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "UPDATE_STORY", `Đã sửa truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);
    }

    res.status(200).json({ message: "Cập nhật truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4.5. API Duyệt truyện (Dành cho Admin/Owner) — Duyệt luôn toàn bộ chương
router.put("/api/stories/:id/approve", async (req, res) => {
  try {
    const { role, adminUsername } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền duyệt truyện!" });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedStory) return res.status(404).json({ message: "Không tìm thấy truyện!" });

    // Duyệt luôn toàn bộ chương thuộc truyện này
    const chapterResult = await Chapter.updateMany(
      { storyId: updatedStory._id, isApproved: { $ne: true } },
      { isApproved: true }
    );

    // Ghi Log Admin
    const chapCount = chapterResult.modifiedCount || 0;
    await logAdminAction(adminUsername, role || "admin", "APPROVE_STORY", `Đã duyệt truyện: "${updatedStory.title}" (ID: ${updatedStory._id}) kèm ${chapCount} chương`);

    res.status(200).json({ message: `Đã duyệt truyện và ${chapCount} chương thành công!`, story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Hủy duyệt truyện (Dành cho Admin/Owner)
router.put("/api/stories/:id/unapprove", async (req, res) => {
  try {
    const { role, adminUsername } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền hủy duyệt truyện!" });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!updatedStory) return res.status(404).json({ message: "Không tìm thấy truyện!" });

    // Ghi Log Admin
    await logAdminAction(adminUsername, role || "admin", "UNAPPROVE_STORY", `Đã hủy duyệt truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);

    res.status(200).json({ message: `Đã hủy duyệt truyện thành công!`, story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 5. API xoá truyện và toàn bộ chapters thuộc về truyện đó (Có chuyển vào Thùng rác)
router.delete("/api/stories/:id", async (req, res) => {
  try {
    const storyId = req.params.id;
    const { role, adminUsername, reason, publisherId } = req.query;
    
    // Tìm truyện trước khi xoá
    const storyToTrash = await Story.findById(storyId);
    if (!storyToTrash) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }

    if (role === "publisher") {
      if (!storyToTrash.publisherId || storyToTrash.publisherId.toString() !== publisherId) {
        return res.status(403).json({ message: "Bạn không có quyền xoá truyện của người khác!" });
      }
      // Publisher chỉ được gửi yêu cầu xoá
      storyToTrash.deleteRequested = true;
      storyToTrash.deleteReason = reason || "Không có lí do";
      await storyToTrash.save();
      return res.status(200).json({ message: "Đã gửi yêu cầu xoá truyện thành công. Vui lòng chờ admin duyệt!" });
    }

    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Bạn không có quyền xoá truyện này!" });
    }

    // Lưu truyện vào Trash
    const trashStory = new TrashStory({
      originalId: storyToTrash._id.toString(),
      data: storyToTrash.toObject()
    });
    await trashStory.save();

    // Tìm tất cả chapter thuộc truyện và lưu vào Trash
    const chaptersToTrash = await Chapter.find({ storyId: storyId });
    for (const chap of chaptersToTrash) {
      const trashChap = new TrashChapter({
        originalId: chap._id.toString(),
        data: chap.toObject()
      });
      await trashChap.save();
    }

    // Tiến hành xoá thật khỏi Database chính
    await Story.findByIdAndDelete(storyId);
    await Chapter.deleteMany({ storyId: storyId });
    
    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "DELETE_STORY", `Đã duyệt xóa truyện: "${storyToTrash.title}" (ID: ${storyId}) vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá truyện và toàn bộ chương thành công (Đã chuyển vào thùng rác)!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Từ chối yêu cầu xoá truyện
router.put("/api/stories/:id/reject-delete", async (req, res) => {
  try {
    const { role, adminUsername } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền từ chối xoá truyện!" });
    }

    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { deleteRequested: false, deleteReason: null },
      { new: true }
    );
    if (!updatedStory) return res.status(404).json({ message: "Không tìm thấy truyện!" });

    await logAdminAction(adminUsername, role || "admin", "REJECT_DELETE_STORY", `Đã từ chối yêu cầu xoá truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);

    res.status(200).json({ message: "Đã từ chối yêu cầu xoá thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

module.exports = router;
