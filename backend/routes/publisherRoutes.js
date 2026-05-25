const express = require("express");
const router = express.Router();
const User = require("../models/User");
const PublisherRequest = require("../models/PublisherRequest");
const { AdminLog, logAdminAction } = require("../models/AdminLog");

// --- CÁC API VỀ ĐƠN ĐĂNG KÝ VÀ QUẢN LÝ NHÀ XUẤT BẢN ---

// 0. Lấy danh sách tất cả các User đang là Nhà Xuất Bản
router.get("/api/publishers", async (req, res) => {
  try {
    const publishers = await User.find({ role: "publisher" }).select("-password");
    res.status(200).json(publishers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 0.1 Gỡ quyền Nhà Xuất Bản của 1 User
router.put("/api/publishers/:id/revoke", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy User" });
    
    if (user.role === "admin") {
      return res.status(400).json({ message: "Không thể gỡ quyền Admin" });
    }

    user.role = "user";
    await user.save();

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "REVOKE_PUBLISHER", `Đã gỡ quyền NXB của user: "${user.username}"`);

    res.status(200).json({ message: "Đã gỡ quyền Nhà Xuất Bản thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});


// 1. Tạo đơn đăng ký mới (Dành cho User)
router.post("/api/publisher-requests", async (req, res) => {
  try {
    const { username, reason } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra xem đã có đơn đang chờ chưa
    const existingRequest = await PublisherRequest.findOne({ user: user._id, status: "Đang chờ" });
    if (existingRequest) {
      return res.status(400).json({ message: "Bạn đã có một đơn đang chờ duyệt rồi!" });
    }

    if (user.role === "publisher" || user.role === "admin") {
      return res.status(400).json({ message: "Bạn đã có quyền cao hơn hoặc bằng Nhà Xuất Bản rồi!" });
    }

    const newRequest = new PublisherRequest({
      user: user._id,
      reason
    });
    await newRequest.save();

    res.status(201).json({ message: "Gửi đơn đăng ký thành công!", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Lấy danh sách toàn bộ đơn đăng ký (Dành cho Admin)
router.get("/api/publisher-requests", async (req, res) => {
  try {
    const requests = await PublisherRequest.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Duyệt / Từ chối đơn đăng ký (Dành cho Admin)
router.put("/api/publisher-requests/:id", async (req, res) => {
  try {
    const { status } = req.body; // "Đã duyệt" hoặc "Từ chối"
    const request = await PublisherRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Không tìm thấy đơn này" });

    // Nếu duyệt, thì nâng cấp user role lên publisher
    if (status === "Đã duyệt") {
      const user = await User.findById(request.user);
      if (user && user.role !== "admin") { // Không hạ cấp admin
        user.role = "publisher";
        await user.save();
      }
    }

    // Xóa đơn sau khi đã xử lý (chấp nhận hoặc từ chối)
    await PublisherRequest.findByIdAndDelete(req.params.id);

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "PROCESS_REQUEST", `Đã ${status} đơn xin làm NXB của User ID: ${request.user}`);

    res.status(200).json({ message: `Cập nhật trạng thái đơn thành ${status} và xoá thành công!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});



module.exports = router;
