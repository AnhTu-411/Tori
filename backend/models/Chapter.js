const mongoose = require("mongoose");

const chapterSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  },
  chapterNumber: { type: Number, required: true },
  title: { type: String, required: true },
  content: { type: String, required: false },
  imageLinks: [{ type: String }],
  imageLinks2: [{ type: String }],
  price: { type: Number, default: 0 },
  isApproved: { type: Boolean, default: false },
  deleteRequested: { type: Boolean, default: false },
  deleteReason: { type: String, default: null },
  createdAt: { type: Date, default: Date.now },
});

module.exports = mongoose.model("Chapter", chapterSchema);
