const mongoose = require("mongoose");

const trashStorySchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed,
  deletedAt: { type: Date, default: Date.now }
});

const trashChapterSchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed,
  deletedAt: { type: Date, default: Date.now }
});

const trashCommentSchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed,
  deletedAt: { type: Date, default: Date.now }
});

module.exports = {
  TrashStory: mongoose.model("TrashStory", trashStorySchema),
  TrashChapter: mongoose.model("TrashChapter", trashChapterSchema),
  TrashComment: mongoose.model("TrashComment", trashCommentSchema)
};
