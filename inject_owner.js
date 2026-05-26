const fs = require('fs');
const path = require('path');

const adminScripts = [
  'admin_stories.js',
  'admin_chapters.js',
  'admin_story_form.js',
  'admin_chapter_form.js',
  'admin_publisher_requests.js'
];

const ownerCheckCode = `
  if (currentUser.role === "owner") {
    const menuUsers = document.getElementById("menu-users");
    if (menuUsers) menuUsers.style.display = "block";
  }
`;

adminScripts.forEach(script => {
  const filepath = path.join(__dirname, 'scripts', 'admin', script);
  let content = fs.readFileSync(filepath, 'utf8');
  
  if (!content.includes('menuUsers.style.display = "block"')) {
    // Find the end of `if (!currentUser ...)` block or `if (currentUser.role === 'publisher')` block
    // A safe place is right after `const currentUser = ...` or `if (!currentUser... return; }`
    const searchStr = 'return;\n  }';
    const replaceStr = `return;\n  }\n${ownerCheckCode}`;
    
    if (content.includes(searchStr)) {
      content = content.replace(searchStr, replaceStr);
      fs.writeFileSync(filepath, content);
      console.log('Updated ' + script);
    }
  }
});
