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

  // Lịch sử mua chương lẻ: Chứa danh sách ID của các chương đã mở khoá
  unlockedChapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],

  // Giỏ hàng lưu trữ các chương muốn mua
  cart: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }],

  // Danh sách các dấu trang (đang đọc)
  bookmarks: [{
    storyId: { type: mongoose.Schema.Types.ObjectId, ref: "Story" },
    chapterId: { type: mongoose.Schema.Types.ObjectId, ref: "Chapter" },
    chapterTitle: { type: String },
    date: { type: Date, default: Date.now }
  }]
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
  story: { type: mongoose.Schema.Types.ObjectId, ref: "Story" }, // Vẫn giữ để tương thích cũ (nếu có mua nguyên truyện)
  chapters: [{ type: mongoose.Schema.Types.ObjectId, ref: "Chapter" }], // Danh sách chương vừa mua
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
  parentCommentId: { type: mongoose.Schema.Types.ObjectId, ref: "Comment", default: null },
  createdAt: { type: Date, default: Date.now }
});

const Comment = mongoose.model("Comment", commentSchema);

// --- 6.7. KHUÔN ĐÚC LƯU TRỮ RÁC (TRASH SCHEMA) ---
const trashStorySchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed, // Lưu nguyên bản JSON của truyện
  deletedAt: { type: Date, default: Date.now }
});
const TrashStory = mongoose.model("TrashStory", trashStorySchema);

const trashChapterSchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed, // Lưu nguyên bản JSON của chương
  deletedAt: { type: Date, default: Date.now }
});
const TrashChapter = mongoose.model("TrashChapter", trashChapterSchema);

const trashCommentSchema = new mongoose.Schema({
  originalId: String,
  data: mongoose.Schema.Types.Mixed,
  deletedAt: { type: Date, default: Date.now }
});
const TrashComment = mongoose.model("TrashComment", trashCommentSchema);

// --- 6.8. KHUÔN ĐÚC NHẬT KÝ ADMIN (ADMIN LOG SCHEMA) ---
const adminLogSchema = new mongoose.Schema({
  adminUsername: { type: String, required: true },
  action: { type: String, required: true },
  details: { type: String, required: true },
  createdAt: { type: Date, default: Date.now }
});
const AdminLog = mongoose.model("AdminLog", adminLogSchema);

// Hàm helper hỗ trợ ghi Log
async function logAdminAction(username, role, action, details) {
  if (role === "admin" && username) {
    try {
      const log = new AdminLog({ adminUsername: username, action, details });
      await log.save();
      console.log(`[ADMIN LOG] ${username} | ${action} | ${details}`);
    } catch (err) {
      console.error("Lỗi khi ghi Admin Log:", err);
    }
  }
}

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

// --- CÁC API VỀ TỦ SÁCH CÁ NHÂN (YÊU THÍCH, THEO DÕI, BOOKMARK) ---

// 0. API Lấy và Thêm Dấu Trang (Bookmark)
app.get("/api/users/:username/bookmarks", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate({
      path: 'bookmarks.storyId',
      select: 'title coverImg'
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user.bookmarks || []);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

app.post("/api/users/:username/bookmarks", async (req, res) => {
  try {
    const { storyId, chapterId, chapterTitle } = req.body;
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra xem đã lưu bookmark cho truyện này chưa
    const existingIdx = user.bookmarks.findIndex(b => b.storyId.toString() === storyId);
    
    const newBookmark = { 
      storyId, 
      chapterId, 
      chapterTitle, 
      date: new Date() 
    };

    if (existingIdx > -1) {
      user.bookmarks[existingIdx] = newBookmark;
    } else {
      user.bookmarks.push(newBookmark);
    }

    await user.save();
    res.status(200).json({ message: "Lưu dấu trang thành công!", bookmarks: user.bookmarks });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

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

    // Tìm chapter mới nhất cho mỗi truyện
    const storiesWithChapters = await Promise.all(user.followedStories.map(async (story) => {
      const latestChapter = await Chapter.findOne({ storyId: story._id }).sort({ createdAt: -1 });
      return {
        ...story.toObject(),
        latestChapter: latestChapter ? {
          chapterNumber: latestChapter.chapterNumber,
          title: latestChapter.title,
          createdAt: latestChapter.createdAt
        } : null
      };
    }));

    // Sắp xếp các truyện dựa trên thời gian cập nhật của chapter mới nhất
    storiesWithChapters.sort((a, b) => {
      const dateA = a.latestChapter ? new Date(a.latestChapter.createdAt).getTime() : 0;
      const dateB = b.latestChapter ? new Date(b.latestChapter.createdAt).getTime() : 0;
      return dateB - dateA; // Giảm dần (mới nhất lên đầu)
    });

    res.status(200).json(storiesWithChapters);
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
      .populate({
        path: "chapters",
        populate: {
          path: "storyId",
          select: "title coverImg"
        }
      })
      .sort({ createdAt: -1 });

    res.status(200).json(transactions);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API MỚI: QUẢN LÝ GIỎ HÀNG
// API lấy thông tin cơ bản của user (bao gồm unlockedChapters)
app.get("/api/users/:username/info", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json({ unlockedChapters: user.unlockedChapters, coins: user.coins });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

app.get("/api/users/:username/cart", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate({
      path: "cart",
      populate: { path: "storyId", select: "title coverImg" }
    });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user.cart);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

app.post("/api/users/cart/add", async (req, res) => {
  try {
    const { username, chapterId } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Đã mua rồi thì không thêm vào giỏ
    if (user.unlockedChapters.includes(chapterId)) {
      return res.status(400).json({ message: "Bạn đã mua chương này rồi!" });
    }

    if (!user.cart.includes(chapterId)) {
      user.cart.push(chapterId);
      await user.save();
    }
    res.status(200).json({ message: "Đã thêm vào giỏ hàng", cartCount: user.cart.length });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

app.post("/api/users/cart/remove", async (req, res) => {
  try {
    const { username, chapterId } = req.body;
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    user.cart = user.cart.filter(id => id.toString() !== chapterId);
    await user.save();
    res.status(200).json({ message: "Đã xoá khỏi giỏ hàng", cartCount: user.cart.length });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 6. Tạo giao dịch mới (Thanh toán giỏ hàng hoặc mua lẻ)
app.post("/api/transactions", async (req, res) => {
  try {
    const { username, chapterIds, totalAmount } = req.body; // Bỏ storyId, thay bằng chapterIds mảng
    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    // Kiểm tra số dư
    if (user.coins < totalAmount) {
      return res.status(400).json({ message: "Bạn không đủ Coin để thực hiện giao dịch này!" });
    }

    if (!chapterIds || chapterIds.length === 0) {
      return res.status(400).json({ message: "Giỏ hàng rỗng!" });
    }

    // Lấy thông tin các chương để chia tiền cho NXB
    const chaptersToBuy = await Chapter.find({ _id: { $in: chapterIds } }).populate('storyId');

    // Trừ tiền người mua
    user.coins -= totalAmount;
    
    // Tính toán tiền cho từng NXB
    const publisherEarnings = {};
    for (let chap of chaptersToBuy) {
      if (chap.storyId && chap.storyId.publisherId) {
        const pubId = chap.storyId.publisherId.toString();
        if (!publisherEarnings[pubId]) publisherEarnings[pubId] = 0;
        publisherEarnings[pubId] += (chap.price || 0);
      }
    }

    // Cập nhật ví NXB
    for (let pubId in publisherEarnings) {
      const publisher = await User.findById(pubId);
      if (publisher) {
        publisher.coins += publisherEarnings[pubId];
        await publisher.save();
      }
    }

    // Lưu Lịch sử giao dịch (có thể lưu nhiều Transaction nếu nhiều NXB, nhưng ở đây tạm gom làm 1 bill)
    const newTx = new Transaction({
      user: user._id,
      chapters: chapterIds,
      price: totalAmount,
      status: "Thành công"
    });
    await newTx.save();

    // Thêm các chương vào danh sách đã mở khoá
    for (let cid of chapterIds) {
      if (!user.unlockedChapters.includes(cid)) {
        user.unlockedChapters.push(cid);
      }
      // Xóa khỏi giỏ hàng luôn
      user.cart = user.cart.filter(item => item.toString() !== cid);
    }
    
    await user.save();

    res.status(201).json({ message: "Thanh toán thành công!", transaction: newTx, newCoins: user.coins });
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

// --- CÁC API VỀ ĐƠN ĐĂNG KÝ VÀ QUẢN LÝ NHÀ XUẤT BẢN ---

// 0. Lấy danh sách tất cả các User đang là Nhà Xuất Bản
app.get("/api/publishers", async (req, res) => {
  try {
    const publishers = await User.find({ role: "publisher" }).select("-password");
    res.status(200).json(publishers);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 0.1 Gỡ quyền Nhà Xuất Bản của 1 User
app.put("/api/publishers/:id/revoke", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) return res.status(404).json({ message: "Không tìm thấy User" });
    
    if (user.role === "admin") {
      return res.status(400).json({ message: "Không thể gỡ quyền Admin" });
    }

    user.role = "user";
    await user.save();

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "REVOKE_PUBLISHER", `Đã gỡ quyền NXB của user: "${user.username}"`);

    res.status(200).json({ message: "Đã gỡ quyền Nhà Xuất Bản thành công" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});


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

    // Nếu duyệt, thì nâng cấp user role lên publisher
    if (status === "Đã duyệt") {
      const user = await User.findById(request.user);
      if (user && user.role !== "admin") { // Không hạ cấp admin
        user.role = "publisher";
        await user.save();
      }
    }

    // Xóa đơn sau khi đã xử lý (chấp nhận hoặc từ chối)
    await PublisherRequest.findByIdAndDelete(req.params.id);

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "PROCESS_REQUEST", `Đã ${status} đơn xin làm NXB của User ID: ${request.user}`);

    res.status(200).json({ message: `Cập nhật trạng thái đơn thành ${status} và xoá thành công!` });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ TRUYỆN (STORIES) ---

// 1. API lấy toàn bộ danh sách truyện (Dùng cho Trang chủ và Admin)
app.get("/api/stories", async (req, res) => {
  try {
    const { publisherId, role, title, genres, status, year } = req.query;
    let query = {};
    if (publisherId) {
      query.publisherId = publisherId;
    }
    
    if (title) {
      query.title = { $regex: title, $options: "i" };
    }
    
    if (genres) {
      const genreArray = Array.isArray(genres) ? genres : genres.split(",");
      query.genres = { $in: genreArray };
    }
    
    if (status && status !== "Tất cả" && status !== "") {
      query.status = status;
    }

    // Nếu không phải admin và không phải đang tìm truyện của chính mình, chỉ lấy truyện đã duyệt hoặc truyện cũ
    if (role !== "admin" && !publisherId) {
      query.$or = [
        { isApproved: true },
        { isApproved: { $exists: false } }
      ];
    }
    
    let stories = await Story.find(query).sort({ createdAt: -1 });

    if (year && year !== "Tất cả" && year !== "") {
      stories = stories.filter(story => {
        const d = story.publishedDate ? new Date(story.publishedDate) : new Date(story.createdAt);
        return d.getFullYear().toString() === year.toString();
      });
    }

    res.status(200).json(stories);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. API thêm truyện mới (Dùng cho Admin/Publisher)
app.post("/api/stories", async (req, res) => {
  try {
    const { title, author, description, coverImg, status, isPremium, price, publisherId, role, genres, publishedDate } = req.body;
    
    // Nếu admin tạo truyện thì duyệt luôn, ngược lại là false
    const approved = role === "admin" ? true : false;

    const newStory = new Story({
      title,
      author,
      description,
      coverImg,
      status,
      genres: genres || [],
      publishedDate: publishedDate ? new Date(publishedDate) : new Date(),
      isPremium: isPremium || false,
      price: price || 0,
      publisherId: publisherId || null,
      isApproved: approved
    });
    await newStory.save();
    
    // Ghi Log Admin
    if (role === "admin") {
      await logAdminAction(req.body.adminUsername, role, "CREATE_STORY", `Đã thêm truyện mới: "${title}" (ID: ${newStory._id})`);
    }

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

    // Ghi Log Admin
    const { role, adminUsername } = req.body;
    if (role === "admin") {
      await logAdminAction(adminUsername, role, "UPDATE_STORY", `Đã sửa truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);
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

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "APPROVE_STORY", `Đã duyệt truyện: "${updatedStory.title}" (ID: ${updatedStory._id})`);

    res.status(200).json({ message: "Đã duyệt truyện thành công!", story: updatedStory });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 5. API xoá truyện và toàn bộ chapters thuộc về truyện đó (Có chuyển vào Thùng rác)
app.delete("/api/stories/:id", async (req, res) => {
  try {
    const storyId = req.params.id;
    
    // Tìm truyện trước khi xoá
    const storyToTrash = await Story.findById(storyId);
    if (!storyToTrash) {
      return res.status(404).json({ message: "Không tìm thấy truyện này!" });
    }

    // Lưu truyện vào Trash
    const trashStory = new TrashStory({
      originalId: storyToTrash._id.toString(),
      data: storyToTrash.toObject()
    });
    await trashStory.save();

    // Tìm tất cả chapter thuộc truyện và lưu vào Trash
    const chaptersToTrash = await Chapter.find({ storyId: storyId });
    for (const chap of chaptersToTrash) {
      const trashChap = new TrashChapter({
        originalId: chap._id.toString(),
        data: chap.toObject()
      });
      await trashChap.save();
    }

    // Tiến hành xoá thật khỏi Database chính
    await Story.findByIdAndDelete(storyId);
    await Chapter.deleteMany({ storyId: storyId });
    
    // Ghi Log Admin (Lấy query params adminUsername, role)
    const { role, adminUsername } = req.query;
    if (role === "admin") {
      await logAdminAction(adminUsername, role, "DELETE_STORY", `Đã xóa truyện: "${storyToTrash.title}" (ID: ${storyId}) vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá truyện và toàn bộ chương thành công (Đã chuyển vào thùng rác)!" });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---

// 1. Tạo bình luận mới
app.post("/api/comments", async (req, res) => {
  try {
    const { username, storyId, chapterId, content, parentCommentId } = req.body;
    
    if (!content || content.trim() === "") {
      return res.status(400).json({ message: "Nội dung bình luận không được để trống" });
    }

    const user = await User.findOne({ username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });

    const newComment = new Comment({
      user: user._id,
      story: storyId,
      chapter: chapterId,
      content: content.trim(),
      parentCommentId: parentCommentId || null
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
      .sort({ createdAt: 1 }); // Xếp từ cũ đến mới để dễ đan xen cha con
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

// 4. API xoá bình luận (Chỉ User sở hữu hoặc Admin mới được xoá)
app.delete("/api/comments/:id", async (req, res) => {
  try {
    const { username, role } = req.query;
    const commentId = req.params.id;

    const comment = await Comment.findById(commentId).populate("user", "username");
    if (!comment) return res.status(404).json({ message: "Không tìm thấy bình luận" });

    const isOwner = comment.user.username === username;
    const isAdmin = role === "admin";

    if (!isOwner && !isAdmin) {
      return res.status(403).json({ message: "Bạn không có quyền xoá bình luận này" });
    }

    // Lưu comment gốc vào Trash
    const trashComment = new TrashComment({
      originalId: comment._id.toString(),
      data: comment.toObject()
    });
    await trashComment.save();

    // Tìm và lưu toàn bộ comment con vào Trash
    const childComments = await Comment.find({ parentCommentId: commentId });
    for (const child of childComments) {
      const trashChild = new TrashComment({
        originalId: child._id.toString(),
        data: child.toObject()
      });
      await trashChild.save();
    }

    // Xóa comment gốc
    await Comment.findByIdAndDelete(commentId);
    
    // Xóa toàn bộ comment con (nếu có)
    await Comment.deleteMany({ parentCommentId: commentId });

    if (isAdmin && !isOwner) {
      await logAdminAction(username, "admin", "DELETE_COMMENT", `Đã xóa bình luận ID: ${commentId} của user: ${comment.user.username}`);
    }

    res.status(200).json({ message: "Đã xoá bình luận thành công!" });
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

    // Ghi Log Admin
    if (role === "admin") {
      await logAdminAction(req.body.adminUsername, role, "CREATE_CHAPTER", `Đã thêm chương ${chapterNumber} truyện ID: ${storyId}`);
    }

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
    if (chapter.price > 0 || (story && story.isPremium)) {
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
      // Ưu tiên check mua lẻ trước, fallback check mua nguyên bộ (unlockedStories) cho các user cũ
      const hasPurchased = user.unlockedChapters.includes(chapter._id) || user.unlockedStories.includes(story._id);
      
      const isPublisher = story.publisherId && story.publisherId.toString() === user._id.toString();

      // Tuy nhiên nếu chương có giá = 0 thì được đọc luôn
      if (chapter.price === 0 && !story.isPremium) {
         // Free chapter
      } else if (!isAdmin && !isPublisher && !hasPurchased) {
        return res.status(403).json({ 
          message: "Bạn cần mua chương truyện này để xem nội dung.", 
          price: chapter.price,
          chapterId: chapter._id
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

    // Ghi Log Admin
    const { role, adminUsername } = req.body;
    if (role === "admin") {
      await logAdminAction(adminUsername, role, "UPDATE_CHAPTER", `Đã sửa chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);
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

    // Ghi Log Admin
    const { adminUsername } = req.body;
    await logAdminAction(adminUsername, "admin", "APPROVE_CHAPTER", `Đã duyệt chương ${updatedChapter.chapterNumber} truyện ID: ${updatedChapter.storyId}`);

    res.status(200).json({ message: "Đã duyệt chương thành công!", chapter: updatedChapter });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// API xoá một chương cụ thể (Có chuyển vào Thùng rác)
app.delete("/api/chapters/:id", async (req, res) => {
  try {
    const chapterId = req.params.id;

    // Tìm chương trước khi xoá
    const chapterToTrash = await Chapter.findById(chapterId);
    if (!chapterToTrash) {
      return res.status(404).json({ message: "Không tìm thấy chương này!" });
    }

    // Lưu vào Thùng rác
    const trashChap = new TrashChapter({
      originalId: chapterToTrash._id.toString(),
      data: chapterToTrash.toObject()
    });
    await trashChap.save();

    // Xoá thật khỏi Database chính
    await Chapter.findByIdAndDelete(chapterId);

    // Ghi Log Admin
    const { role, adminUsername } = req.query;
    if (role === "admin") {
      await logAdminAction(adminUsername, role, "DELETE_CHAPTER", `Đã xóa chương ID: ${chapterId} vào thùng rác`);
    }

    res.status(200).json({ message: "Đã xoá chương thành công (Đã chuyển vào thùng rác)!" });
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
