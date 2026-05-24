const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const filesToProcess = [
  'index.html',
  'pages/account/Publisher_Register.html',
  'pages/admin/Admin_Chapters.html',
  'pages/admin/Admin_Chapter_Form.html',
  'pages/admin/Admin_Publisher_Requests.html',
  'pages/admin/Admin_Stories.html',
  'pages/admin/Admin_Story_Form.html',
  'pages/auth/Login.html',
  'pages/auth/Password_Recover.html',
  'pages/auth/Signup.html',
  'pages/payment/Cart.html',
  'pages/payment/Recharge.html',
  'pages/shelf/Advanced_Search.html',
  'pages/shelf/Bookshelf.html',
  'pages/stories/Reading.html',
  'pages/stories/Self-written_LightNovel.html',
  'pages/stories/Story_Detail.html',
  'pages/stories/Story_List.html'
];

filesToProcess.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log("Not found:", filePath);
    return;
  }
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Xoá header cũ
  content = content.replace(/<header\b[^>]*>[\s\S]*?<\/header>/gi, '');
  
  // Xoá footer cũ
  content = content.replace(/<footer\b[^>]*>[\s\S]*?<\/footer>/gi, '');
  content = content.replace(/<div class="footer"[^>]*>[\s\S]*?<\/div>/gi, '');

  // Tính toán path relative đến Navbar.js
  const depth = file.split('/').length - 1;
  const prefix = depth === 0 ? './' : '../'.repeat(depth);
  const scriptTag = `<script src="${prefix}scripts/ui/Navbar.js"></script>\n</body>`;

  // Chèn Navbar.js trước </body>
  if (!content.includes('scripts/ui/Navbar.js')) {
    content = content.replace(/<\/body>/i, scriptTag);
  }

  // Remove duplicate <script src="../../scripts/ui/Dark_Mode.js"> because Navbar handles it
  content = content.replace(/<script src="[^"]*Dark_Mode\.js"><\/script>/gi, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Updated: ${file}`);
});
