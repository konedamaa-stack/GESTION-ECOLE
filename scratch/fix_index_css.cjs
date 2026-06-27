const fs = require('fs');

let css = fs.readFileSync('src/index.css', 'utf8');

// 1. Remove the first @media print
css = css.replace(/\/\* Print Styles \*\/[\s\S]*?\}\n/, '/* Print styles merged below */\n');

// 2. Add .print-bulletin isolation
const financeListSearch = `  /* Isolate Finance List and Finance Class Summary */
  body.print-finance-list .page-header,`;

const bulletinIsolation = `  /* Isolate Bulletin */
  body.print-bulletin .page-header,
  body.print-bulletin .stats-grid,
  body.print-bulletin .sidebar,
  body.print-bulletin .top-header,
  body.print-bulletin .panel:not(.bulletin-preview-container),
  body.print-bulletin .print-controls {
    display: none !important;
  }
  body.print-bulletin .bulletin-preview-container,
  body.print-bulletin .bulletin-preview-container * {
    visibility: visible !important;
  }
  body.print-bulletin .bulletin-preview-container {
    display: block !important;
    position: absolute !important;
    left: 0 !important;
    top: 0 !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    width: 100% !important;
  }
  
  /* Isolate Finance List and Finance Class Summary */
  body.print-finance-list .page-header,`;

css = css.replace(financeListSearch, bulletinIsolation);

fs.writeFileSync('src/index.css', css);
console.log("index.css updated!");
