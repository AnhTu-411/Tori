
const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");

const app = express();
const PORT = 5000;

app.use(cors());
app.use(express.json());

const MONGO_URI = "mongodb+srv://jackieson235_db_user:QktRphCodQ4fzjGO@cluster0.m8oi10t.mongodb.net/tori_database?retryWrites=true&w=majority&appName=Cluster0";

mongoose.connect(MONGO_URI)
  .then(() => console.log("🟢 BỘ NÃO ĐÃ HOẠT ĐỘNG: Kết nối thành công với MongoDB Atlas!"))
  .catch((error) => console.log("🔴 Cảnh báo! Kết nối MongoDB thất bại:", error));

// Import Routes
const userRoutes = require("./backend/routes/userRoutes");
const publisherRoutes = require("./backend/routes/publisherRoutes");
const storyRoutes = require("./backend/routes/storyRoutes");
const commentRoutes = require("./backend/routes/commentRoutes");
const chapterRoutes = require("./backend/routes/chapterRoutes");
const adminRoutes = require("./backend/routes/adminRoutes");

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
