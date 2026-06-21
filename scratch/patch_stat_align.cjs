const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/App.css');
let cssCode = fs.readFileSync(cssPath, 'utf8');

// Find .stat-header and add min-height and align-items flex-start
if (cssCode.includes('.stat-header {')) {
  cssCode = cssCode.replace(
    /\.stat-header \{[\s\S]*?margin-bottom: 16px;\s*\}/,
    `.stat-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 16px;
  min-height: 48px;
}`
  );
  fs.writeFileSync(cssPath, cssCode);
  console.log("App.css patched for stat-header alignment.");
}

const indexCssPath = path.join(__dirname, '../src/index.css');
let indexCssCode = fs.readFileSync(indexCssPath, 'utf8');
if (indexCssCode.includes('.finance-stats {')) {
  // We can also ensure the value aligns at the bottom if the card stretches
  indexCssCode += `\n.stat-card { justify-content: space-between; }\n`;
  fs.writeFileSync(indexCssPath, indexCssCode);
}
