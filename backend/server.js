
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb://jackieson235_db_user:QktRphCodQ4fzjGO@ac-sqykxqf-shard-00-00.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-01.m8oi10t.mongodb.net:27017,ac-sqykxqf-shard-00-02.m8oi10t.mongodb.net:27017/tori_database?ssl=true&authSource=admin&retryWrites=true&w=majority";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 BỘ NÃO ĐÃ HOẠT ĐỘNG: Kết nối thành công với MongoDB Atlas!"))
  .catch((error) => console.log("🔴 Cảnh báo! Kết nối MongoDB thất bại:", error));

// Import Routes
const userRoutes = require("./routes/userRoutes");
const publisherRoutes = require("./routes/publisherRoutes");
const storyRoutes = require("./routes/storyRoutes");
const commentRoutes = require("./routes/commentRoutes");
const chapterRoutes = require("./routes/chapterRoutes");
const adminRoutes = require("./routes/adminRoutes");

// Đăng ký API
app.use("/", userRoutes); // Chứa cả /api/register, /api/login, /api/users
app.use("/", publisherRoutes);
app.use("/", storyRoutes);
app.use("/", commentRoutes);
app.use("/", chapterRoutes);
app.use("/", adminRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Tori API!");
});

app.listen(PORT, () => {
  console.log(`🚀 Server Backend đang chạy ngon lành tại: http://localhost:${PORT}`);
});
