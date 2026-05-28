const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Story = require("../models/Story");
const Chapter = require("../models/Chapter");
const { AdminLog, logAdminAction } = require("../models/AdminLog");
const { TrashChapter } = require("../models/Trash");

// --- CÁC API VỀ CHƯƠNG (CHAPTERS) ---

// API lấy danh sách toàn bộ chương của 1 bộ truyện cụ thể dựa vào ID truyện
router.get("/api/stories/:storyId/chapters", async (req, res) => {
  try {
    const { role, publisherId } = req.query;
    let query = { storyId: req.params.storyId };
    
    let hasPrivilege = false;
    if (role === "admin" || role === "owner") {
      hasPrivilege = true;
    } else if (role === "publisher" && publisherId) {
      const story = await Story.findById(req.params.storyId);
      if (story && story.publisherId && story.publisherId.toString() === publisherId) {
        hasPrivilege = true;
      }
    }

    if (!hasPrivilege) {
      query.$or = [
        { isApproved: true },
        { isApproved: { $exists: false } }
      ];
    }

    const chapters = await Chapter.find(query).sort({
      chapterNumber: 1, // Sắp xếp từ chương 1 trở đi
    });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API thêm chương mới vào 1 bộ truyện
router.post("/api/chapters", async (req, res) => {
  try {
    const { storyId, chapterNumber, title, content, imageLinks, imageLinks2, price, role, publisherId } = req.body;
    
    // Kiểm tra xem truyện có tồn tại không
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện!" });
    }

    if (role === "publisher") {
      if (!story.publisherId || story.publisherId.toString() !== publisherId) {
        return res.status(403).json({ message: "Bạn không có quyền thêm chương cho truyện của người khác!" });
      }
    } else if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Bạn không có quyền thêm chương!" });
    }

    const approved = (role === "admin" || role === "owner") ? true : false;

    const newChapter = new Chapter({
      storyId,
      chapterNumber,
      title,
      content,
      imageLinks: imageLinks || [],
      imageLinks2: imageLinks2 || [],
      price: price || 0,
      isApproved: approved
    });
    await newChapter.save();

    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(req.body.adminUsername, role, "CREATE_CHAPTER", `Đã thêm chương ${chapterNumber} truyện ID: ${storyId}`);
    }

    res
      .status(201)
      .json({ message: "Thêm chương mới thành công!", chapter: newChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API lấy thông tin chi tiết 1 chương
router.get("/api/chapters/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("storyId");
    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    const story = chapter.storyId;
    if (chapter.price > 0 || (story && story.isPremium)) {
      const username = req.query.username;
      if (!username) {
        return res.status(403).json({ message: "Vui lòng đăng nhập để đọc nội dung trả phí." });
      }
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(403).json({ message: "Người dùng không hợp lệ." });
      }

      // Check quyền admin hoặc đã mua
      const isAdmin = user.role === "admin" || user.role === "owner";
      // Ưu tiên check mua lẻ trước, fallback check mua nguyên bộ (unlockedStories) cho các user cũ
      const hasPurchased = user.unlockedChapters.includes(chapter._id) || user.unlockedStories.includes(story._id);
      
      const isPublisher = story.publisherId && story.publisherId.toString() === user._id.toString();

      // Tuy nhiên nếu chương có giá = 0 thì được đọc luôn
      if (chapter.price === 0 && !story.isPremium) {
         // Free chapter
      } else if (!isAdmin && !isPublisher && !hasPurchased) {
        return res.status(403).json({ 
          message: "Bạn cần mua chương truyện này để xem nội dung.", 
          price: chapter.price,
          chapterId: chapter._id
        });
      }
    }

    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API cập nhật thông tin chương
router.put("/api/chapters/:id", async (req, res) => {
  try {
    const { role, adminUsername, publisherId } = req.body;
    
    const chapter = await Chapter.findById(req.params.id).populate("storyId");
    if (!chapter) return res.status(404).json({ message: "Không tìm thấy chương này!" });

    if (role === "publisher") {
      if (!chapter.storyId || !chapter.storyId.publisherId || chapter.storyId.publisherId.toString() !== publisherId) {
        return res.status(403).json({ message: "Bạn không có quyền sửa chương của người khác!" });
      }
    } else if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Bạn không có quyền sửa chương!" });
    }

    let updateData = { ...req.body };
    
    // Nếu NXB tự sửa, chương trở về trạng thái Chưa duyệt
    if (role !== "admin" && role !== "owner") {
      updateData.isApproved = false;
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      updateData,
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }


    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "UPDATE_CHAPTER", `Đã sửa chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);
    }

    res.status(200).json({ message: "Cập nhật chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Duyệt chương (Dành cho Admin)
router.put("/api/chapters/:id/approve", async (req, res) => {
  try {
    const { adminUsername, role } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền duyệt chương!" });
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedChapter) return res.status(404).json({ message: "Không tìm thấy chương!" });

    // Kiểm tra xem tất cả các chương của truyện này đã được duyệt hết chưa
    const unapprovedCount = await Chapter.countDocuments({
      storyId: updatedChapter.storyId,
      isApproved: { $ne: true }
    });

    if (unapprovedCount === 0) {
      // Nếu không còn chương nào chưa duyệt, tự động duyệt luôn bộ truyện
      await Story.findByIdAndUpdate(updatedChapter.storyId, { isApproved: true });
    }

    // Ghi Log Admin
    await logAdminAction(adminUsername, role || "admin", "APPROVE_CHAPTER", `Đã duyệt chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);

    res.status(200).json({ message: "Đã duyệt chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Hủy duyệt chương (Dành cho Admin/Owner)
router.put("/api/chapters/:id/unapprove", async (req, res) => {
  try {
    const { adminUsername, role } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền hủy duyệt chương!" });
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { isApproved: false },
      { new: true }
    );
    if (!updatedChapter) return res.status(404).json({ message: "Không tìm thấy chương!" });

    // Ghi Log Admin
    await logAdminAction(adminUsername, role || "admin", "UNAPPROVE_CHAPTER", `Đã hủy duyệt chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);

    res.status(200).json({ message: "Đã hủy duyệt chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API xoá một chương cụ thể (Có chuyển vào Thùng rác)
router.delete("/api/chapters/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;
    const { role, adminUsername, reason, publisherId } = req.query;

    // Tìm chương trước khi xoá
    const chapterToTrash = await Chapter.findById(chapterId).populate("storyId");
    if (!chapterToTrash) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    if (role === "publisher") {
      if (!chapterToTrash.storyId || !chapterToTrash.storyId.publisherId || chapterToTrash.storyId.publisherId.toString() !== publisherId) {
        return res.status(403).json({ message: "Bạn không có quyền xoá chương của người khác!" });
      }
      // Publisher chỉ được gửi yêu cầu xoá
      chapterToTrash.deleteRequested = true;
      chapterToTrash.deleteReason = reason || "Không có lí do";
      await chapterToTrash.save();
      return res.status(200).json({ message: "Đã gửi yêu cầu xoá chương thành công. Vui lòng chờ admin duyệt!" });
    }

    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Bạn không có quyền xoá chương này!" });
    }

    // Admin/Owner thì xoá thật
    // Lưu vào Thùng rác
    const trashChap = new TrashChapter({
      originalId: chapterToTrash._id.toString(),
      data: chapterToTrash.toObject()
    });
    await trashChap.save();

    // Xoá thật khỏi Database chính
    await Chapter.findByIdAndDelete(chapterId);

    // Ghi Log Admin
    if (role === "admin" || role === "owner") {
      await logAdminAction(adminUsername, role, "DELETE_CHAPTER", `Đã duyệt xoá chương ID: ${chapterId} vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá chương thành công (Đã chuyển vào thùng rác)!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Từ chối yêu cầu xoá chương
router.put("/api/chapters/:id/reject-delete", async (req, res) => {
  try {
    const { adminUsername, role } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Chỉ Admin/Owner mới có quyền từ chối xoá chương!" });
    }

    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { deleteRequested: false, deleteReason: null },
      { new: true }
    );
    if (!updatedChapter) return res.status(404).json({ message: "Không tìm thấy chương!" });

    await logAdminAction(adminUsername, role || "admin", "REJECT_DELETE_CHAPTER", `Đã từ chối yêu cầu xoá chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);

    res.status(200).json({ message: "Đã từ chối yêu cầu xoá thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

module.exports = router;
