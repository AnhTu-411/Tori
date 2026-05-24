const fs = require('fs');
const path = require('path');

const rootDir = path.join(__dirname, '..');

// Các file cần bổ sung CSS cho header
const filesToFix = [
  'pages/auth/Login.html',
  'pages/auth/Signup.html',
  'pages/auth/Password_Recover.html',
  'pages/stories/Reading.html',
  'pages/account/Publisher_Register.html'
];

const cssToAdd = [
  'main_style.css',
  'main_header_style.css',
  'dark_mode_style.css'
];

filesToFix.forEach(file => {
  const filePath = path.join(rootDir, file);
  if (!fs.existsSync(filePath)) {
    console.log("Not found:", file);
    return;
  }

  let content = fs.readFileSync(filePath, 'utf8');

  cssToAdd.forEach(cssFile => {
    if (!content.includes(cssFile)) {
      // Chèn trước </head>
      const linkTag = `    <link rel="stylesheet" href="../../styles/${cssFile}" />\n`;
      content = content.replace('</head>', linkTag + '  </head>');
      console.log(`  Added ${cssFile} to ${file}`);
    }
  });

  // Đảm bảo có footer_style.css
  if (!content.includes('footer_style.css')) {
    const linkTag = `    <link rel="stylesheet" href="../../styles/footer_style.css" />\n`;
    content = content.replace('</head>', linkTag + '  </head>');
    console.log(`  Added footer_style.css to ${file}`);
  }

  fs.writeFileSync(filePath, content, 'utf8');
  console.log(`Fixed: ${file}`);
});
