const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/App.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

// Remove justify-content: space-between from .stat-card if we added it, wait, we added it to index.css!
const indexCssPath = path.join(__dirname, '../src/index.css');
let indexCssCode = fs.readFileSync(indexCssPath, 'utf8');
if (indexCssCode.includes('.stat-card { justify-content: space-between; }')) {
  indexCssCode = indexCssCode.replace('.stat-card { justify-content: space-between; }', '');
  fs.writeFileSync(indexCssPath, indexCssCode);
}

// Ensure .stat-card doesn't use justify-content space-between in App.css either
if (cssCode.includes('justify-content: space-between;') && cssCode.includes('.stat-card {')) {
  // It originally didn't have it.
}

// Modify .stat-header to have flex-grow: 1
cssCode = cssCode.replace(
  /\.stat-header \{[\s\S]*?min-height: 48px;\s*\}/,
  `.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  flex-grow: 1;
}`
);

fs.writeFileSync(cssPath, cssCode);
console.log("App.css patched for flex-grow alignment.");
