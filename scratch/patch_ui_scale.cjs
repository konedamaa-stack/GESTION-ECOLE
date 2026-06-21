const fs = require('fs');
const path = require('path');

function replaceFile(filePath, replacements) {
  let code = fs.readFileSync(filePath, 'utf8');
  for (const { oldStr, newStr, regex } of replacements) {
    if (regex) {
      code = code.replace(oldStr, newStr);
    } else {
      code = code.split(oldStr).join(newStr);
    }
  }
  fs.writeFileSync(filePath, code);
}

// 1. Patch index.css
const indexCssPath = path.join(__dirname, '../src/index.css');
replaceFile(indexCssPath, [
  { oldStr: 'clamp(12px, 1vw + 6px, 14px)', newStr: '13px' },
  { oldStr: 'padding: 10px 20px;', newStr: 'padding: 8px 16px;' },
  { oldStr: 'padding: 12px 16px;', newStr: 'padding: 10px 14px;' }
]);
console.log("index.css patched.");

// 2. Patch App.css
const appCssPath = path.join(__dirname, '../src/App.css');
replaceFile(appCssPath, [
  { oldStr: 'font-size: 1.75rem;', newStr: 'font-size: 1.4rem;' },
  { oldStr: 'font-size: 1.5rem;', newStr: 'font-size: 1.3rem;' },
  { oldStr: '.stat-card {\n  padding: 20px;', newStr: '.stat-card {\n  padding: 16px;' },
  { oldStr: '.panel {\n  background: var(--surface-color);\n  border: 1px solid var(--border-color);\n  border-radius: 16px;\n  padding: 24px;', newStr: '.panel {\n  background: var(--surface-color);\n  border: 1px solid var(--border-color);\n  border-radius: 16px;\n  padding: 20px;' },
  { oldStr: 'padding: 24px 0;', newStr: 'padding: 20px 0;' },
  { oldStr: 'width: 260px;', newStr: 'width: 240px;' },
  { oldStr: 'min-height: 48px;', newStr: 'min-height: 40px;' }
]);
console.log("App.css patched.");
