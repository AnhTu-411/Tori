const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');
const filesToProcess = [
  'index.html',
  'pages/admin/Admin_Chapters.html',
  'pages/admin/Admin_Chapter_Form.html',
  'pages/admin/Admin_Publisher_Requests.html',
  'pages/admin/Admin_Stories.html',
  'pages/admin/Admin_Story_Form.html'
];

filesToProcess.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) return;
  
  let content = fs.readFileSync(filePath, 'utf8');

  // Regex to remove the toggleDarkMode script block
  content = content.replace(/<script>\s*function toggleDarkMode\(\)[\s\S]*?<\/script>/g, '');

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Cleaned: ${file}`);
});
