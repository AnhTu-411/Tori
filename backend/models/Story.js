const mongoose = require("mongoose");

const storySchema = new mongoose.Schema({
  title: { type: String, required: true },
  author: { type: String, required: true },
  description: { type: String },
  coverImg: { type: String },
  status: { type: String, default: "Đang tiến hành" },
  isPremium: { type: Boolean, default: false },
  price: { type: Number, default: 0 },
  genres: [{ type: String }],
  publishedDate: { type: Date },
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
  isApproved: { type: Boolean, default: false },
  deleteRequested: { type: Boolean, default: false },
  deleteReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Story", storySchema);
