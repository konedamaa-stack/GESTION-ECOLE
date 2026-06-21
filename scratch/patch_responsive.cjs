const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

// Patch App.tsx
const oldStr = `<div className="stats-grid" style={{gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))'}}>`;
const newStr = `<div className="stats-grid finance-stats">`;
if (appCode.includes(oldStr)) {
  appCode = appCode.replace(oldStr, newStr);
  fs.writeFileSync(appPath, appCode);
  console.log("App.tsx patched.");
}

// Patch index.css
const cssPath = path.join(__dirname, '../src/index.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

if (!cssCode.includes('.finance-stats {')) {
  cssCode += `

/* Finance Stats Grid (5 items) */
.finance-stats {
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
  gap: 16px;
}

@media (max-width: 768px) {
  .finance-stats {
    grid-template-columns: 1fr !important;
  }
}
`;
  fs.writeFileSync(cssPath, cssCode);
  console.log("index.css patched.");
}
