// 1. GỌI CÁC THƯ VIỆN ĐÃ CÀI ĐẶT
const express = require("express");
const cors = require("cors");
const mongoose = require("mongoose");
const fs = require("fs");
const path = require("path");

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

  // Tủ truyện yêu thích (Đã thích)
  favorites: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],

  // Truyện đang theo dõi
  followedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],

  // Lịch sử mua truyện: Chứa danh sách ID của các bộ truyện đã mở khóa
  unlockedStories: [{ type: mongoose.Schema.Types.ObjectId, ref: "Story" }],
});

const User = mongoose.model("User", userSchema);

// --- 6.2. KHUÔN ĐÚC TRUYỆN GỐC (STORY SCHEMA) ---
const storySchema = new mongoose.Schema({
  title: { type: String, required: true }, // Tên truyện
  author: { type: String, required: true }, // Tác giả
  description: { type: String }, // Mô tả/Tóm tắt truyện
  coverImg: { type: String }, // Đường dẫn ảnh bìa truyện
  status: { type: String, default: "Đang tiến hành" }, // Trạng thái truyện
  isPremium: { type: Boolean, default: false }, // Truyện thu phí hay không
  price: { type: Number, default: 0 }, // Giá bán cả bộ truyện (nếu có)
  genres: [{ type: String }], // Thể loại (Lưu thành mảng vì 1 truyện có thể có nhiều thể loại)
  publishedDate: { type: Date }, // Ngày xuất bản
  publisherId: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }, // NXB/Người đăng
  isApproved: { type: Boolean, default: false }, // Đã được admin duyệt chưa
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
  content: { type: String, required: false }, // Nội dung chữ dài của chương truyện (có thể trống nếu là truyện tranh)
  imageLinks: [{ type: String }], // Danh sách các link ảnh (dành cho truyện tranh tải bằng link)
  imageLinks2: [{ type: String }], // Danh sách link ảnh Server 2 (Dự phòng)
  price: { type: Number, default: 0 }, // Giá coin để mở khóa chương này (0 = miễn phí)
  isApproved: { type: Boolean, default: false }, // Đã được admin duyệt chưa
  createdAt: { type: Date, default: Date.now },
});

const Chapter = mongoose.model("Chapter", chapterSchema);

// --- 6.4. KHUÔN ĐÚC LỊCH SỬ GIAO DỊCH (TRANSACTION SCHEMA) ---
const transactionSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true }, // Người mua
  publisher: { type: mongoose.Schema.Types.ObjectId, ref: "User" }, // Người nhận tiền
  transactionId: { 
    type: String, 
    required: true, 
    unique: true, 
    default: () => "TX-" + Math.random().toString(36).substr(2, 9).toUpperCase() 
  },
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
  price: { type: Number, required: true },
  status: { type: String, default: "Thành công" },
  createdAt: { type: Date, default: Date.now },
});

const Transaction = mongoose.model("Transaction", transactionSchema);

// --- 6.5. KHUÔN ĐÚC ĐƠN ĐĂNG KÝ NHÀ XUẤT BẢN (PUBLISHER REQUEST SCHEMA) ---
const publisherRequestSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  reason: { type: String, required: true }, // Lý do muốn làm NXB
  status: { type: String, default: "Đang chờ" }, // "Đang chờ", "Đã duyệt", "Từ chối"
  createdAt: { type: Date, default: Date.now },
});

const PublisherRequest = mongoose.model("PublisherRequest", publisherRequestSchema);

// --- 6.6. KHUÔN ĐÚC BÌNH LUẬN (COMMENT SCHEMA) ---
const commentSchema = new mongoose.Schema({
  user: { type: mongoose.Schema.Types.ObjectId, ref: "User", required: true },
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story", required: true },
  chapter: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter", required: true },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

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

// --- CÁC API VỀ TỦ SÁCH CÁ NHÂN (YÊU THÍCH & THEO DÕI) ---

// 1. Lấy danh sách truyện đã thích của User
app.get("/api/users/:username/favorites", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate("favorites");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Thêm/Xoá truyện khỏi danh sách đã thích (Toggle)
app.post("/api/users/:username/favorites", async (req, res) => {
  try {
    const { storyId } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const index = user.favorites.indexOf(storyId);
    if (index === -1) {
      user.favorites.push(storyId); // Thêm vào
    } else {
      user.favorites.splice(index, 1); // Xoá đi
    }
    await user.save();
    res.status(200).json({ message: "Cập nhật thành công", favorites: user.favorites });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Lấy danh sách truyện đang theo dõi của User
app.get("/api/users/:username/following", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate("followedStories");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user.followedStories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4. Thêm/Xoá truyện khỏi danh sách theo dõi (Toggle)
app.post("/api/users/:username/following", async (req, res) => {
  try {
    const { storyId } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const index = user.followedStories.indexOf(storyId);
    if (index === -1) {
      user.followedStories.push(storyId); // Thêm vào
    } else {
      user.followedStories.splice(index, 1); // Xoá đi
    }
    await user.save();
    res.status(200).json({ message: "Cập nhật thành công", followedStories: user.followedStories });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 5. Lấy danh sách lịch sử giao dịch (mua truyện)
app.get("/api/users/:username/transactions", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const transactions = await Transaction.find({ user: user._id })
      .populate("story", "title coverImg")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 6. Tạo giao dịch mới (Thanh toán nguyên bộ truyện)
app.post("/api/transactions", async (req, res) => {
  try {
    const { username, storyId, price } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra số dư
    if (user.coins < price) {
      return res.status(400).json({ message: "Bạn không đủ Coin để mua truyện này!" });
    }

    const storyToBuy = await Story.findById(storyId);
    if (!storyToBuy) return res.status(404).json({ message: "Không tìm thấy truyện!" });

    // Trừ tiền người mua
    user.coins -= price;
    
    // Cộng tiền NXB (nếu có)
    let publisherObjId = null;
    if (storyToBuy.publisherId) {
      const publisher = await User.findById(storyToBuy.publisherId);
      if (publisher) {
        publisher.coins += price;
        publisherObjId = publisher._id;
        await publisher.save();
      }
    }

    const newTx = new Transaction({
      user: user._id,
      publisher: publisherObjId,
      story: storyId,
      price: price
    });
    await newTx.save();

    // Thêm truyện vào danh sách đã mở khoá
    if (!user.unlockedStories.includes(storyId)) {
      user.unlockedStories.push(storyId);
    }
    
    await user.save();

    res.status(201).json({ message: "Giao dịch thành công", transaction: newTx, newCoins: user.coins });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 7. Lấy danh sách giao dịch cho NXB
app.get("/api/publishers/:username/transactions", async (req, res) => {
  try {
    const publisher = await User.findOne({ username: req.params.username });
    if (!publisher) return res.status(404).json({ message: "Không tìm thấy NXB" });

    const transactions = await Transaction.find({ publisher: publisher._id })
      .populate("story", "title coverImg")
      .populate("user", "username")
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ ĐƠN ĐĂNG KÝ NHÀ XUẤT BẢN ---

// 1. Tạo đơn đăng ký mới (Dành cho User)
app.post("/api/publisher-requests", async (req, res) => {
  try {
    const { username, reason } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra xem đã có đơn đang chờ chưa
    const existingRequest = await PublisherRequest.findOne({ user: user._id, status: "Đang chờ" });
    if (existingRequest) {
      return res.status(400).json({ message: "Bạn đã có một đơn đang chờ duyệt rồi!" });
    }

    if (user.role === "publisher" || user.role === "admin") {
      return res.status(400).json({ message: "Bạn đã có quyền cao hơn hoặc bằng Nhà Xuất Bản rồi!" });
    }

    const newRequest = new PublisherRequest({
      user: user._id,
      reason
    });
    await newRequest.save();

    res.status(201).json({ message: "Gửi đơn đăng ký thành công!", request: newRequest });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Lấy danh sách toàn bộ đơn đăng ký (Dành cho Admin)
app.get("/api/publisher-requests", async (req, res) => {
  try {
    const requests = await PublisherRequest.find()
      .populate("user", "username email")
      .sort({ createdAt: -1 });
    res.status(200).json(requests);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Duyệt / Từ chối đơn đăng ký (Dành cho Admin)
app.put("/api/publisher-requests/:id", async (req, res) => {
  try {
    const { status } = req.body; // "Đã duyệt" hoặc "Từ chối"
    const request = await PublisherRequest.findById(req.params.id);
    if (!request) return res.status(404).json({ message: "Không tìm thấy đơn này" });

    request.status = status;
    await request.save();

    // Nếu duyệt, thì nâng cấp user role lên publisher
    if (status === "Đã duyệt") {
      const user = await User.findById(request.user);
      if (user && user.role !== "admin") { // Không hạ cấp admin
        user.role = "publisher";
        await user.save();
      }
    }

    res.status(200).json({ message: `Cập nhật trạng thái đơn thành ${status} thành công!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ TRUYỆN (STORIES) ---

// 1. API lấy toàn bộ danh sách truyện (Dùng cho Trang chủ và Admin)
app.get("/api/stories", async (req, res) => {
  try {
    const { publisherId, role } = req.query;
    let query = {};
    if (publisherId) {
      query.publisherId = publisherId;
    }
    // Nếu không phải admin và không phải đang tìm truyện của chính mình, chỉ lấy truyện đã duyệt hoặc truyện cũ
    if (role !== "admin" && !publisherId) {
      query.$or = [
        { isApproved: true },
        { isApproved: { $exists: false } }
      ];
    }
    
    const stories = await Story.find(query).sort({ createdAt: -1 });
    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. API thêm truyện mới (Dùng cho Admin/Publisher)
app.post("/api/stories", async (req, res) => {
  try {
    const { title, author, description, coverImg, status, isPremium, price, publisherId, role } = req.body;
    
    // Nếu admin tạo truyện thì duyệt luôn, ngược lại là false
    const approved = role === "admin" ? true : false;

    const newStory = new Story({
      title,
      author,
      description,
      coverImg,
      status,
      isPremium: isPremium || false,
      price: price || 0,
      publisherId: publisherId || null,
      isApproved: approved
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

// 4. API cập nhật thông tin truyện
app.put("/api/stories/:id", async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }
    res.status(200).json({ message: "Cập nhật truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 4.5. API Duyệt truyện (Dành cho Admin)
app.put("/api/stories/:id/approve", async (req, res) => {
  try {
    const updatedStory = await Story.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedStory) return res.status(404).json({ message: "Không tìm thấy truyện!" });
    res.status(200).json({ message: "Đã duyệt truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 5. API xoá truyện và toàn bộ chapters thuộc về truyện đó
app.delete("/api/stories/:id", async (req, res) => {
  try {
    const storyId = req.params.id;
    const deletedStory = await Story.findByIdAndDelete(storyId);
    if (!deletedStory) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }
    // Xoá luôn các chapters thuộc truyện này
    await Chapter.deleteMany({ storyId: storyId });
    res.status(200).json({ message: "Đã xoá truyện và toàn bộ chương thành công!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---

// 1. Tạo bình luận mới
app.post("/api/comments", async (req, res) => {
  try {
    const { username, storyId, chapterId, content } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const newComment = new Comment({
      user: user._id,
      story: storyId,
      chapter: chapterId,
      content: content.trim()
    });

    await newComment.save();
    
    // Trả về comment kèm theo thông tin user để frontend hiển thị luôn
    await newComment.populate("user", "username");

    res.status(201).json({ message: "Bình luận thành công!", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Lấy danh sách bình luận của 1 chương
app.get("/api/chapters/:chapterId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ chapter: req.params.chapterId })
      .populate("user", "username")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Lấy danh sách bình luận của toàn bộ truyện
app.get("/api/stories/:storyId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ story: req.params.storyId })
      .populate("user", "username")
      .populate("chapter", "chapterNumber title")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---

// 1. Tạo bình luận mới
app.post("/api/comments", async (req, res) => {
  try {
    const { username, storyId, chapterId, content } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const newComment = new Comment({
      user: user._id,
      story: storyId,
      chapter: chapterId,
      content: content.trim()
    });

    await newComment.save();
    
    // Trả về comment kèm theo thông tin user để frontend hiển thị luôn
    await newComment.populate("user", "username");

    res.status(201).json({ message: "Bình luận thành công!", comment: newComment });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Lấy danh sách bình luận của 1 chương
app.get("/api/chapters/:chapterId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ chapter: req.params.chapterId })
      .populate("user", "username")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 3. Lấy danh sách bình luận của toàn bộ truyện
app.get("/api/stories/:storyId/comments", async (req, res) => {
  try {
    const comments = await Comment.find({ story: req.params.storyId })
      .populate("user", "username")
      .populate("chapter", "chapterNumber title")
      .sort({ createdAt: -1 }); // Mới nhất lên đầu
    res.status(200).json(comments);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ CHƯƠNG (CHAPTERS) ---

// API lấy danh sách toàn bộ chương của 1 bộ truyện cụ thể dựa vào ID truyện
app.get("/api/stories/:storyId/chapters", async (req, res) => {
  try {
    const { role, publisherId } = req.query;
    let query = { storyId: req.params.storyId };
    
    // Nếu không phải admin, và cũng không phải đang truy vấn với tư cách publisher (chính chủ), thì chỉ lấy chương đã duyệt hoặc chương cũ
    if (role !== "admin" && role !== "publisher") {
      query.$or = [
        { isApproved: true },
        { isApproved: { $exists: false } }
      ];
    }

    const chapters = await Chapter.find(query).sort({
      chapterNumber: 1, // Sắp xếp từ chương 1 trở đi
    });
    res.status(200).json(chapters);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API thêm chương mới vào 1 bộ truyện
app.post("/api/chapters", async (req, res) => {
  try {
    const { storyId, chapterNumber, title, content, imageLinks, imageLinks2, price, role } = req.body;
    
    // Kiểm tra xem truyện có tồn tại không
    const story = await Story.findById(storyId);
    if (!story) {
      return res.status(404).json({ message: "Không tìm thấy truyện!" });
    }

    const approved = role === "admin" ? true : false;

    const newChapter = new Chapter({
      storyId,
      chapterNumber,
      title,
      content,
      imageLinks: imageLinks || [],
      imageLinks2: imageLinks2 || [],
      price: price || 0,
      isApproved: approved
    });
    await newChapter.save();
    res
      .status(201)
      .json({ message: "Thêm chương mới thành công!", chapter: newChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API lấy thông tin chi tiết 1 chương
app.get("/api/chapters/:id", async (req, res) => {
  try {
    const chapter = await Chapter.findById(req.params.id).populate("storyId");
    if (!chapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    const story = chapter.storyId;
    if (story && story.isPremium) {
      const username = req.query.username;
      if (!username) {
        return res.status(403).json({ message: "Vui lòng đăng nhập để đọc nội dung trả phí." });
      }
      
      const user = await User.findOne({ username });
      if (!user) {
        return res.status(403).json({ message: "Người dùng không hợp lệ." });
      }

      // Check quyền admin hoặc đã mua
      const isAdmin = user.role === "admin";
      const hasPurchased = user.unlockedStories.includes(story._id);

      if (!isAdmin && !hasPurchased) {
        return res.status(403).json({ 
          message: "Bạn cần mua truyện này để đọc các chương bên trong.", 
          price: story.price,
          storyId: story._id
        });
      }
    }

    res.status(200).json(chapter);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API cập nhật thông tin chương
app.put("/api/chapters/:id", async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true }
    );
    if (!updatedChapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }
    res.status(200).json({ message: "Cập nhật chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API Duyệt chương (Dành cho Admin)
app.put("/api/chapters/:id/approve", async (req, res) => {
  try {
    const updatedChapter = await Chapter.findByIdAndUpdate(
      req.params.id,
      { isApproved: true },
      { new: true }
    );
    if (!updatedChapter) return res.status(404).json({ message: "Không tìm thấy chương!" });
    res.status(200).json({ message: "Đã duyệt chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API xoá một chương cụ thể
app.delete("/api/chapters/:id", async (req, res) => {
  try {
    const deletedChapter = await Chapter.findByIdAndDelete(req.params.id);
    if (!deletedChapter) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }
    res.status(200).json({ message: "Đã xoá chương thành công!" });
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
