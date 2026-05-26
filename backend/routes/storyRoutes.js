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
    const { publisherId, role, title, genres, status, year, sort, page = 1, limit = 12 } = req.query;
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

    res.status(200).json({
      data: stories,
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
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }

    // Ghi Log Admin
    const { role, adminUsername } = req.body;
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "UPDATE_STORY", `Đã sửa truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);
    }

    res.status(200).json({ message: "Cập nhật truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4.5. API Duyệt truyện (Dành cho Admin)
router.put("/api/stories/:id/approve", async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedStory) return res.status(404).json({ message: "Không tìm thấy truyện!" });

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "APPROVE_STORY", `Đã duyệt truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);

    res.status(200).json({ message: "Đã duyệt truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 5. API xoá truyện và toàn bộ chapters thuộc về truyện đó (Có chuyển vào Thùng rác)
router.delete("/api/stories/:id", async (req, res) => {
  try {
    const storyId = req.params.id;
    
    // Tìm truyện trước khi xoá
    const storyToTrash = await Story.findById(storyId);
    if (!storyToTrash) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
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
    
    // Ghi Log Admin (Lấy query params adminUsername, role)
    const { role, adminUsername } = req.query;
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "DELETE_STORY", `Đã xóa truyện: "${storyToTrash.title}" (ID: ${storyId}) vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá truyện và toàn bộ chương thành công (Đã chuyển vào thùng rác)!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

module.exports = router;
