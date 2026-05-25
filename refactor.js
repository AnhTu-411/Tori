const fs = require('fs');
const path = require('path');

const serverFile = path.join(__dirname, 'server.js');
let code = fs.readFileSync(serverFile, 'utf8');

// The new server.js will be built from pieces
let newServerCode = `
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
const transactionRoutes = require("./backend/routes/transactionRoutes");

// Đăng ký API
app.use("/", userRoutes); // Chứa cả /api/register, /api/login, /api/users
app.use("/", publisherRoutes);
app.use("/", storyRoutes);
app.use("/", commentRoutes);
app.use("/", chapterRoutes);
app.use("/", adminRoutes);
app.use("/", transactionRoutes);

app.get("/", (req, res) => {
  res.send("Hello from Tori API!");
});

app.listen(PORT, () => {
  console.log(\`🚀 Server Backend đang chạy ngon lành tại: http://localhost:\${PORT}\`);
});
`;

// Lấy các khối từ file cũ
function extractBlock(startMarker, endMarker) {
  const startIdx = code.indexOf(startMarker);
  if (startIdx === -1) return "";
  let endIdx = code.length;
  if (endMarker) {
    const tmp = code.indexOf(endMarker, startIdx);
    if (tmp !== -1) endIdx = tmp;
  }
  return code.substring(startIdx, endIdx);
}

// Extract routes
let authRoutes = extractBlock("// --- CÁC API VỀ TÀI KHOẢN (AUTH) ---", "// --- CÁC API VỀ ĐƠN ĐĂNG KÝ VÀ QUẢN LÝ NHÀ XUẤT BẢN ---");
let publisherRoutesCode = extractBlock("// --- CÁC API VỀ ĐƠN ĐĂNG KÝ VÀ QUẢN LÝ NHÀ XUẤT BẢN ---", "// --- CÁC API VỀ TRUYỆN (STORIES) ---");
let storyRoutesCode = extractBlock("// --- CÁC API VỀ TRUYỆN (STORIES) ---", "// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---");
let commentRoutesCode = extractBlock("// --- CÁC API VỀ BÌNH LUẬN (COMMENTS) ---", "// --- CÁC API VỀ CHƯƠNG (CHAPTERS) ---");
let chapterRoutesCode = extractBlock("// --- CÁC API VỀ CHƯƠNG (CHAPTERS) ---", "// --- CÁC API ADMIN (THỐNG KÊ, LOG, QUẢN LÝ USER/TRUYỆN) ---");
let adminRoutesCode = extractBlock("// --- CÁC API ADMIN (THỐNG KÊ, LOG, QUẢN LÝ USER/TRUYỆN) ---", "// --- CÁC API THÙNG RÁC (TRASH) ---");
let trashRoutesCode = extractBlock("// --- CÁC API THÙNG RÁC (TRASH) ---", null);

// Hàm tạo nội dung route file
function makeRouteFile(name, imports, blocks) {
  let content = `const express = require("express");\nconst router = express.Router();\n`;
  content += imports.map(i => `const ${i} = require("../models/${i}");`).join("\n") + "\n\n";
  
  if (name === 'adminRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n`;
    content += `const { TrashStory, TrashChapter, TrashComment } = require("../models/Trash");\n\n`;
  }

  let codeBlock = blocks.join("\n");
  // Thay thế app.get -> router.get, app.post -> router.post, etc.
  codeBlock = codeBlock.replace(/app\.get\(/g, "router.get(");
  codeBlock = codeBlock.replace(/app\.post\(/g, "router.post(");
  codeBlock = codeBlock.replace(/app\.put\(/g, "router.put(");
  codeBlock = codeBlock.replace(/app\.delete\(/g, "router.delete(");
  
  content += codeBlock + "\n\nmodule.exports = router;\n";
  fs.writeFileSync(path.join(__dirname, 'backend', 'routes', `${name}.js`), content);
}

// Lưu các file
makeRouteFile('userRoutes', ['User', 'Chapter', 'Transaction'], [authRoutes]);
makeRouteFile('publisherRoutes', ['User', 'PublisherRequest'], [publisherRoutesCode]);
makeRouteFile('storyRoutes', ['User', 'Story', 'Chapter', 'Transaction'], [storyRoutesCode]);
// Cần thêm { TrashStory, TrashChapter } cho storyRoutes nếu cần, oh wait! 
// storyRoutes xoá vào trash, nên cần import TrashStory, TrashChapter, TrashComment
let storyContent = fs.readFileSync(path.join(__dirname, 'backend', 'routes', 'storyRoutes.js'), 'utf8') || ""; // Will be written later correctly below

makeRouteFile('commentRoutes', ['User', 'Story', 'Chapter', 'Comment'], [commentRoutesCode]);
makeRouteFile('chapterRoutes', ['User', 'Story', 'Chapter'], [chapterRoutesCode]);
makeRouteFile('adminRoutes', ['User', 'Story', 'Chapter', 'Transaction', 'PublisherRequest', 'Comment'], [adminRoutesCode, trashRoutesCode]);

// Viết lại hàm makeRouteFile để sửa lỗi import Trash cho storyRoutes
function makeRouteFileExtended(name, imports, blocks) {
  let content = `const express = require("express");\nconst router = express.Router();\n`;
  content += imports.map(i => `const ${i} = require("../models/${i}");`).join("\n") + "\n";
  
  if (name === 'adminRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n`;
    content += `const { TrashStory, TrashChapter, TrashComment } = require("../models/Trash");\n\n`;
  }
  if (name === 'storyRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n`;
    content += `const { TrashStory, TrashChapter } = require("../models/Trash");\n\n`;
  }
  if (name === 'commentRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n`;
    content += `const { TrashComment } = require("../models/Trash");\n\n`;
  }
  if (name === 'chapterRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n`;
    content += `const { TrashChapter } = require("../models/Trash");\n\n`;
  }
  if (name === 'publisherRoutes') {
    content += `const { AdminLog, logAdminAction } = require("../models/AdminLog");\n\n`;
  }

  let codeBlock = blocks.join("\n");
  codeBlock = codeBlock.replace(/app\.get\(/g, "router.get(");
  codeBlock = codeBlock.replace(/app\.post\(/g, "router.post(");
  codeBlock = codeBlock.replace(/app\.put\(/g, "router.put(");
  codeBlock = codeBlock.replace(/app\.delete\(/g, "router.delete(");
  
  content += codeBlock + "\n\nmodule.exports = router;\n";
  fs.writeFileSync(path.join(__dirname, 'backend', 'routes', `${name}.js`), content);
}

// Chạy lại
makeRouteFileExtended('userRoutes', ['User', 'Chapter', 'Transaction'], [authRoutes]);
makeRouteFileExtended('publisherRoutes', ['User', 'PublisherRequest'], [publisherRoutesCode]);
makeRouteFileExtended('storyRoutes', ['User', 'Story', 'Chapter', 'Transaction'], [storyRoutesCode]);
makeRouteFileExtended('commentRoutes', ['User', 'Story', 'Chapter', 'Comment'], [commentRoutesCode]);
makeRouteFileExtended('chapterRoutes', ['User', 'Story', 'Chapter'], [chapterRoutesCode]);
makeRouteFileExtended('adminRoutes', ['User', 'Story', 'Chapter', 'Transaction', 'PublisherRequest', 'Comment'], [adminRoutesCode, trashRoutesCode]);

// Không tạo transactionRoutes riêng, gộp vào userRoutes/storyRoutes vì code gốc như vậy.

// Sửa lại server.js cuối cùng
fs.writeFileSync(serverFile, newServerCode);

console.log("Refactor completed!");
