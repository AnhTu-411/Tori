const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Story = require("../models/Story");
const Chapter = require("../models/Chapter");
const Transaction = require("../models/Transaction");
const PublisherRequest = require("../models/PublisherRequest");
const Comment = require("../models/Comment");
const { AdminLog, logAdminAction } = require("../models/AdminLog");
const { TrashStory, TrashChapter, TrashComment, TrashUser } = require("../models/Trash");

// ==========================================
// KHOẢNG TÀI KHOẢN DÀNH CHO OWNER
// ==========================================

// 1. Lấy danh sách tất cả tài khoản
router.get("/api/owner/users", async (req, res) => {
  try {
    const { role } = req.query;
    if (role !== "owner") return res.status(403).json({ message: "Chỉ Owner mới có quyền truy cập!" });

    const users = await User.find().select("-password").sort({ createdAt: -1 });
    res.status(200).json(users);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 1.5. Thêm người dùng mới
router.post("/api/owner/users", async (req, res) => {
  try {
    const { ownerUsername, role, username, email, password, targetRole, coins } = req.body;
    if (role !== "owner") return res.status(403).json({ message: "Chỉ Owner mới có quyền truy cập!" });

    if (!username || !email || !password) {
      return res.status(400).json({ message: "Vui lòng điền đủ tên, email, và mật khẩu!" });
    }

    const existingUser = await User.findOne({ username });
    if (existingUser) return res.status(400).json({ message: "Tên đăng nhập đã tồn tại!" });

    const newUser = new User({
      username,
      email,
      password,
      role: targetRole || "user",
      coins: Number(coins) || 0
    });

    await newUser.save();
    await logAdminAction(ownerUsername, "admin", "CREATE_USER", `Đã tạo tài khoản mới: ${username} (Role: ${newUser.role})`);

    res.status(201).json({ message: "Tạo tài khoản thành công!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Sửa thông tin / Cấp quyền người dùng
router.put("/api/owner/users/:id", async (req, res) => {
  try {
    const { ownerUsername, role, targetRole, coins, newPassword } = req.body;
    if (role !== "owner") return res.status(403).json({ message: "Chỉ Owner mới có quyền truy cập!" });

    const userToUpdate = await User.findById(req.params.id);
    if (!userToUpdate) return res.status(404).json({ message: "Không tìm thấy user!" });

    let actionDetails = `Cập nhật User "${userToUpdate.username}": `;
    if (targetRole && targetRole !== userToUpdate.role) {
      if (userToUpdate.role === "owner" && targetRole !== "owner") {
          return res.status(403).json({ message: "Không thể tự hạ cấp hoặc hạ cấp Owner khác từ API này!" });
      }
      userToUpdate.role = targetRole;
      actionDetails += `Role -> ${targetRole}, `;
    }

    if (coins !== undefined && coins !== userToUpdate.coins) {
      userToUpdate.coins = coins;
      actionDetails += `Coins -> ${coins}, `;
    }

    if (newPassword && newPassword.trim() !== "") {
      userToUpdate.password = newPassword; // Trong thực tế nên băm mật khẩu
      actionDetails += `Reset Mật Khẩu, `;
    }

    await userToUpdate.save();

    // Ghi Log, Owner có thể ghi log dưới dạng admin/owner
    await logAdminAction(ownerUsername, "admin", "UPDATE_USER", actionDetails);

    res.status(200).json({ message: "Cập nhật tài khoản thành công!", user: userToUpdate });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Xoá tài khoản (chỉ owner làm được)
router.delete("/api/owner/users/:id", async (req, res) => {
  try {
    const { role, ownerUsername } = req.query;
    if (role !== "owner") return res.status(403).json({ message: "Chỉ Owner mới có quyền xoá tài khoản!" });

    const userToDelete = await User.findById(req.params.id);
    if (!userToDelete) return res.status(404).json({ message: "Không tìm thấy user!" });

    if (userToDelete.role === "owner") {
       return res.status(403).json({ message: "Không thể xoá tài khoản Owner!" });
    }

    // Lưu vào Thùng rác (TrashUser)
    const trashUser = new TrashUser({
      originalId: userToDelete._id.toString(),
      data: userToDelete.toObject()
    });
    await trashUser.save();

    await User.findByIdAndDelete(req.params.id);

    await logAdminAction(ownerUsername, "admin", "DELETE_USER", `Đã xóa tài khoản: ${userToDelete.username}`);

    res.status(200).json({ message: "Xoá tài khoản thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// ==========================================
// QUẢN LÝ GIAO DỊCH (ĐƠN HÀNG) CHO ADMIN/OWNER
// ==========================================

// 1. Lấy danh sách toàn bộ đơn hàng trên hệ thống
router.get("/api/admin/transactions", async (req, res) => {
  try {
    const { role } = req.query;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    const transactions = await Transaction.find()
      .populate("user", "username email")
      .populate("publisher", "username")
      .populate("story", "title coverImg")
      .populate({
        path: "chapters",
        populate: { path: "storyId", select: "title coverImg" }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Cập nhật trạng thái đơn hàng
router.put("/api/admin/transactions/:id", async (req, res) => {
  try {
    const { role, adminUsername, status } = req.body;
    if (role !== "admin" && role !== "owner") {
      return res.status(403).json({ message: "Không có quyền truy cập!" });
    }

    const tx = await Transaction.findById(req.params.id);
    if (!tx) return res.status(404).json({ message: "Không tìm thấy giao dịch!" });

    tx.status = status;
    await tx.save();

    await logAdminAction(adminUsername, "admin", "UPDATE_TRANSACTION", `Cập nhật trạng thái giao dịch ${tx.transactionId} thành "${status}"`);

    res.status(200).json({ message: "Cập nhật giao dịch thành công!", transaction: tx });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

module.exports = router;
