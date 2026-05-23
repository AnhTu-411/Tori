// 1. GỌI CÁC THƯ VIỆN ĐÃ CÀI ĐẶT
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");

// 2. KHỞI TẠO SERVER
const app = express();
const PORT = 5000;

// 3. CẤU HÌNH MIDDLEWARE
app.use(cors());
app.use(express.json());

// 4. CHUỖI KẾT NỐI MONGODB
const MONGO_URI =
  "mongodb+srv://jackieson235_db_user:QktRphCodQ4fzjGO@cluster0.m8oi10t.mongodb.net/tori_database?retryWrites=true&w=majority&appName=Cluster0";

// 5. KẾT NỐI VỚI MONGODB
mongoose
  .connect(MONGO_URI)
  .then(() => {
    console.log(
      "🟢 BỘ NÃO ĐÃ HOẠT ĐỘNG: Kết nối thành công với MongoDB Atlas!",
    );
  })
  .catch((error) => {
    console.log("🔴 Cảnh báo! Kết nối MongoDB thất bại:", error);
  });

// ==========================================================================
// 6. KHUÔN ĐÚC DỮ LIỆU (SCHEMA & MODEL)
// ==========================================================================

// --- 6.1. KHUÔN ĐÚC NGƯỜI DÙNG (USER SCHEMA) ---
const userSchema = new mongoose.Schema({
  username: { type: String, required: true, unique: true },
  email: { type: String, required: true },
  password: { type: String, required: true },
  coins: { type: Number, default: 0 }, // Tiền tệ lưu trữ của user
  role: { type: String, default: "user" }, // Phân quyền: "user" hoặc "admin"

  // Tủ truyện yêu thích: Chứa danh sách ID của các bộ truyện
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],

  // Lịch sử mua truyện: Chứa danh sách ID của các chương đã mở khóa
  unlockedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],
});

const User = mongoose.model("User", userSchema);

// --- 6.2. KHUÔN ĐÚC TRUYỆN GỐC (STORY SCHEMA) ---
const storySchema = new mongoose.Schema({
  title: { type: String, required: true }, // Tên truyện
  author: { type: String, required: true }, // Tác giả
  description: { type: String }, // Mô tả/Tóm tắt truyện
  coverImg: { type: String }, // Đường dẫn ảnh bìa truyện
  status: { type: String, default: "Đang tiến hành" }, // Trạng thái truyện
  createdAt: { type: Date, default: Date.now }, // Ngày tạo bộ truyện
});

const Story = mongoose.model("Story", storySchema);

// --- 6.3. KHUÔN ĐÚC CHƯƠNG TRUYỆN (CHAPTER SCHEMA) ---
const chapterSchema = new mongoose.Schema({
  storyId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Story",
    required: true,
  }, // ID của bộ truyện gốc mà chương này thuộc về
  chapterNumber: { type: Number, required: true }, // Chương số mấy (1, 2, 3...)
  title: { type: String, required: true }, // Tiêu đề của chương đó
  content: { type: String, required: true }, // Nội dung chữ dài của chương truyện
  price: { type: Number, default: 0 }, // Giá coin để mở khóa chương này (0 = miễn phí)
  createdAt: { type: Date, default: Date.now },
});

const Chapter = mongoose.model("Chapter", chapterSchema);

// ==========================================================================
// 7. VIẾT API (CÁC ĐƯỜNG LINK GIAO TIẾP VỚI FRONTEND)
// ==========================================================================

// --- CÁC API VỀ TÀI KHOẢN (AUTH) ---
app.post("/api/register", async (req, res) => {
  try {
    const { username, email, password } = req.body;
    const existingUser = await User.findOne({ username });
    if (existingUser) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập đã tồn tại, vui lòng chọn tên khác!" });
    }
    const newUser = new User({ username, email, password, coins: 0 });
    await newUser.save();
    res.status(201).json({ message: "Đăng ký thành công!", user: newUser });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

app.post("/api/login", async (req, res) => {
  try {
    const { username, password } = req.body;
    const user = await User.findOne({ username });
    if (!user) {
      return res.status(400).json({ message: "Tên đăng nhập không tồn tại!" });
    }
    if (user.password !== password) {
      return res.status(400).json({ message: "Mật khẩu không chính xác!" });
    }
    res.status(200).json({ message: "Đăng nhập thành công!", user: user });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ TRUYỆN (STORIES) ---

// 1. API lấy toàn bộ danh sách truyện (Dùng cho Trang chủ)
app.get("/api/stories", async (req, res) => {
  try {
    const stories = await Story.find().sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. API thêm truyện mới (Dùng cho Thunder Client/Admin)
app.post("/api/stories", async (req, res) => {
  try {
    const { title, author, description, coverImg, status } = req.body;
    const newStory = new Story({
      title,
      author,
      description,
      coverImg,
      status,
    });
    await newStory.save();
    res
      .status(201)
      .json({ message: "Thêm truyện thành công!", story: newStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. API lấy thông tin chi tiết của 1 bộ truyện cụ thể dựa vào ID (Dùng cho Trang chi tiết)
app.get("/api/stories/:id", async (req, res) => {
  try {
    const story = await Story.findById(req.params.id);
    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }
    res.status(200).json(story);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ CHƯƠNG TRUYỆN (CHAPTERS) ---

// API lấy danh sách toàn bộ chương của 1 bộ truyện cụ thể dựa vào ID truyện
app.get("/api/stories/:storyId/chapters", async (req, res) => {
  try {
    const chapters = await Chapter.find({ storyId: req.params.storyId }).sort({
      chapterNumber: 1,
    }); // Sắp xếp từ chương nhỏ đến lớn
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API thêm một chương mới vào truyện
app.post("/api/chapters", async (req, res) => {
  try {
    const { storyId, chapterNumber, title, content, price } = req.body;
    const newChapter = new Chapter({
      storyId,
      chapterNumber,
      title,
      content,
      price,
    });
    await newChapter.save();
    res
      .status(201)
      .json({ message: "Thêm chương truyện thành công!", chapter: newChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- API TEST SERVER ---
app.get("/", (req, res) => {
  res.send("🎉 Chào mừng đến với Backend của Tori Lightnovel!");
});

// ==========================================================================
// 8. KHỞI ĐỘNG SERVER
// ==========================================================================
app.listen(PORT, () => {
  console.log(
    `🚀 Server Backend đang chạy ngon lành tại: http://localhost:${PORT}`,
  );
});
