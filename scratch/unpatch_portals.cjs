const fs = require('fs');

function unpatchPortal(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Remove the unused state
  content = content.replace(
    /const \[isMobileMenuOpen, setIsMobileMenuOpen\] = useState\(false\);\s*/,
    ''
  );

  fs.writeFileSync(filePath, content);
  console.log(filePath + " fixed!");
}

unpatchPortal('src/components/TeacherPortal.tsx');
unpatchPortal('src/components/StudentPortal.tsx');
