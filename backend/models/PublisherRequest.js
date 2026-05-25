const mongoose = require("mongoose");

const publisherRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true },
  status: { type: String, default: "Đang chờ" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("PublisherRequest", publisherRequestSchema);
