const mongoose = require("mongoose");

const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 },
  role: { type: String, default: "user" },
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
  followedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
  unlockedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
  unlockedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
  bookmarks: [{
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    chapterTitle: { type: String },
    date: { type: Date, default: Date.now }
  }]
});

module.exports = mongoose.model("User", userSchema);
