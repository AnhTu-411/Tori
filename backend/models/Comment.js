const mongoose = require("mongoose");

const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  content: { type: String, required: true },
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  createdAt: { type: Date, default: Date.now }
});

module.exports = mongoose.model("Comment", commentSchema);
