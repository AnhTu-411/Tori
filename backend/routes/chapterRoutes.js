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
    
    // Nếu không phải admin, và cũng không phải đang truy vấn với tư cách publisher (chính chủ), thì chỉ lấy chương đã duyệt hoặc chương cũ
    if (role !== "admin" && role !== "publisher") {
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
    const { storyId, chapterNumber, title, content, imageLinks, imageLinks2, price, role } = req.body;
    
    // Kiểm tra xem truyện có tồn tại không
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện!" });
    }

    const approved = role === "admin" ? true : false;

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
    if (role === "admin") {
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
      const isAdmin = user.role === "admin";
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
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    // Ghi Log Admin
    const { role, adminUsername } = req.body;
    if (role === "admin") {
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
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedChapter) return res.status(404).json({ message: "Không tìm thấy chương!" });

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "APPROVE_CHAPTER", `Đã duyệt chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);

    res.status(200).json({ message: "Đã duyệt chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API xoá một chương cụ thể (Có chuyển vào Thùng rác)
router.delete("/api/chapters/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;

    // Tìm chương trước khi xoá
    const chapterToTrash = await Chapter.findById(chapterId);
    if (!chapterToTrash) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    // Lưu vào Thùng rác
    const trashChap = new TrashChapter({
      originalId: chapterToTrash._id.toString(),
      data: chapterToTrash.toObject()
    });
    await trashChap.save();

    // Xoá thật khỏi Database chính
    await Chapter.findByIdAndDelete(chapterId);

    // Ghi Log Admin
    const { role, adminUsername } = req.query;
    if (role === "admin") {
      await logAdminAction(adminUsername, role, "DELETE_CHAPTER", `Đã xóa chương ID: ${chapterId} vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá chương thành công (Đã chuyển vào thùng rác)!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

module.exports = router;
