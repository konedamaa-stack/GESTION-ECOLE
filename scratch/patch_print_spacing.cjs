const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Revert finance list inline styles back to 16px/12px for UI consistency
appContent = appContent.replace(/padding: '8px 0'/g, "padding: '16px 0'");
appContent = appContent.replace(/padding: '6px 0'/g, "padding: '12px 0'");

fs.writeFileSync('src/App.tsx', appContent);

let cssContent = fs.readFileSync('src/index.css', 'utf8');

const printCssTarget = `  body.print-finance-list .finance-print-title {`;

const newPrintCssRules = `  body.print-finance-list table td, body.print-finance-list table th,
  body.print-student-list table td, body.print-student-list table th {
    padding: 4px 0 !important;
    font-size: 12px !important;
  }

`;

if (!cssContent.includes('padding: 4px 0 !important;') && cssContent.includes(printCssTarget)) {
  cssContent = cssContent.replace(printCssTarget, newPrintCssRules + printCssTarget);
  fs.writeFileSync('src/index.css', cssContent);
}

console.log('Patch complete');
