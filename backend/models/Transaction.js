const mongoose = require("mongoose");

const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  type: { type: String, default: "Mua truyện" },
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: "User" },
  transactionId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase() 
  },
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  price: { type: Number, required: true },
  status: { type: String, default: "Thành công" },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Transaction", transactionSchema);
