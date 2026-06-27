const fs = require('fs');

function patchPortal(filePath) {
  let content = fs.readFileSync(filePath, 'utf8');
  
  // Check if state already exists
  if (!content.includes('isMobileMenuOpen')) {
    // 1. Add state
    content = content.replace(
      'const [activeTab, setActiveTab] = useState',
      'const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [activeTab, setActiveTab] = useState'
    );
    
    if (!content.includes('const [isMobileMenuOpen, setIsMobileMenuOpen] = useState')) {
        // Fallback for StudentPortal
        content = content.replace(
          'const [student, setStudent] = useState<any>(null);',
          'const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);\n  const [student, setStudent] = useState<any>(null);'
        );
    }

    // 2. Add sidebar open classes and overlay
    content = content.replace(
      /<aside className="sidebar">/g,
      '<div className={`sidebar-overlay ${isMobileMenuOpen ? \'open\' : \'\'}`} onClick={() => setIsMobileMenuOpen(false)}></div>\n      <aside className={`sidebar ${isMobileMenuOpen ? \'open\' : \'\'}`}>'
    );

    // 3. Add mobile menu button in top header
    if (content.includes('<header className="top-header">')) {
      content = content.replace(
        /<header className="top-header">\s*<div style={{display: 'flex', alignItems: 'center'}}>/,
        `<header className="top-header">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>`
      );
    }

    fs.writeFileSync(filePath, content);
    console.log(filePath + " updated!");
  } else {
    console.log(filePath + " already has isMobileMenuOpen.");
  }
}

patchPortal('src/components/TeacherPortal.tsx');
patchPortal('src/components/StudentPortal.tsx');
