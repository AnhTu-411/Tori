const mongoose = require("mongoose");

const adminLogSchema = new mongoose.Schema({
  adminUsername: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const AdminLog = mongoose.model("AdminLog", adminLogSchema);

// Hàm helper hỗ trợ ghi Log
async function logAdminAction(username, role, action, details) {
  try {
    if (role === "admin") {
      const newLog = new AdminLog({
        adminUsername: username,
        action: action,
        details: details
      });
      await newLog.save();
    }
  } catch (error) {
    console.error("Lỗi khi ghi Admin Log:", error);
  }
}

module.exports = { AdminLog, logAdminAction };
