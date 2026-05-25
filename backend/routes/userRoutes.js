const express = require("express");
const router = express.Router();
const User = require("../models/User");
const Chapter = require("../models/Chapter");
const Transaction = require("../models/Transaction");
// --- CÁC API VỀ TÀI KHOẢN (AUTH) ---
router.post("/api/register", async (req, res) => {
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

router.post("/api/login", async (req, res) => {
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
router.get("/api/users/:username/bookmarks", async (req, res) => {
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

router.post("/api/users/:username/bookmarks", async (req, res) => {
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
router.get("/api/users/:username/favorites", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username }).populate("favorites");
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json(user.favorites);
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 2. Thêm/Xoá truyện khỏi danh sách đã thích (Toggle)
router.post("/api/users/:username/favorites", async (req, res) => {
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
router.get("/api/users/:username/following", async (req, res) => {
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
router.post("/api/users/:username/following", async (req, res) => {
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
router.get("/api/users/:username/transactions", async (req, res) => {
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
router.get("/api/users/:username/info", async (req, res) => {
  try {
    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy user" });
    res.status(200).json({ unlockedChapters: user.unlockedChapters, coins: user.coins });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

router.get("/api/users/:username/cart", async (req, res) => {
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

router.post("/api/users/cart/add", async (req, res) => {
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

router.post("/api/users/cart/remove", async (req, res) => {
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
router.post("/api/transactions", async (req, res) => {
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

// 6.5. API Nạp tiền (Recharge)
router.post("/api/users/:username/recharge", async (req, res) => {
  try {
    const { coins, method } = req.body;
    if (!coins || coins <= 0) return res.status(400).json({ message: "Số tiền nạp không hợp lệ" });

    const user = await User.findOne({ username: req.params.username });
    if (!user) return res.status(404).json({ message: "Không tìm thấy User" });

    user.coins += coins;
    await user.save();

    // Ghi lịch sử giao dịch (Nạp tiền)
    const newTx = new Transaction({
      user: user._id,
      type: "Nạp tiền",
      price: coins, // số coin nạp
      status: `Thành công qua ${method || "Hệ thống"}`
    });
    await newTx.save();

    res.status(200).json({ message: "Nạp tiền thành công!", newCoins: user.coins, method: method, transaction: newTx });
  } catch (error) {
    res.status(500).json({ message: "Lỗi Server!", error: error.message });
  }
});

// 7. Lấy danh sách giao dịch cho NXB
router.get("/api/publishers/:username/transactions", async (req, res) => {
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



module.exports = router;
