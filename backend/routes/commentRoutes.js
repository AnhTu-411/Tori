const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Story = require("../models/Story");
const Chapter = require("../models/Chapter");
const Comment = require("../models/Comment");
const { AdminLog, logAdminAction } = require("../models/AdminLog");
const { TrashComment } = require("../models/Trash");

// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---

// 1. Tạo bình luận mới
router.post("/api/comments", async (req, res) => {
  try {
    const { username, storyId, chapterId, content, parentCommentId } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const newComment = new Comment({
      user: user._id,
      story: storyId,
      chapter: chapterId,
      content: content.trim(),
      parentCommentId: parentCommentId || null
    });

    await newComment.save();
    
    // Trả về comment kèm theo thông tin user để frontend hiển thị luôn
    await newComment.populate("user", "username");

    res.status(201).json({ message: "Bình luận thành công!", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Lấy danh sách bình luận của 1 chương
router.get("/api/chapters/:chapterId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ chapter: req.params.chapterId })
      .populate("user", "username")
      .sort({ createdAt: 1 }); // Xếp từ cũ đến mới để dễ đan xen cha con
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Lấy danh sách bình luận của toàn bộ truyện
router.get("/api/stories/:storyId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ story: req.params.storyId })
      .populate("user", "username")
      .populate("chapter", "chapterNumber title")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4. API xoá bình luận (Chỉ User sở hữu hoặc Admin mới được xoá)
router.delete("/api/comments/:id", async (req, res) => {
  try {
    const { username, role } = req.query;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("user", "username");
    if (!comment) return res.status(404).json({ message: "Không tìm thấy bình luận" });

    const isOwner = comment.user.username === username;
    const isAdmin = role === "admin" || role === "owner";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền xoá bình luận này" });
    }

    // Lưu comment gốc vào Trash
    const trashComment = new TrashComment({
      originalId: comment._id.toString(),
      data: comment.toObject()
    });
    await trashComment.save();

    // Tìm và lưu toàn bộ comment con vào Trash
    const childComments = await Comment.find({ parentCommentId: commentId });
    for (const child of childComments) {
      const trashChild = new TrashComment({
        originalId: child._id.toString(),
        data: child.toObject()
      });
      await trashChild.save();
    }

    // Xóa comment gốc
    await Comment.findByIdAndDelete(commentId);
    
    // Xóa toàn bộ comment con (nếu có)
    await Comment.deleteMany({ parentCommentId: commentId });

    if (isAdmin && !isOwner) {
      await logAdminAction(username, "admin", "DELETE_COMMENT", `Đã xóa bình luận ID: ${commentId} của user: ${comment.user.username}`);
    }

    res.status(200).json({ message: "Đã xoá bình luận thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});



module.exports = router;
