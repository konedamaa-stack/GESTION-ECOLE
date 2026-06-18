const fs = require('fs');

let appTxt = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `<button className="btn btn-outline" onClick={() => window.print()} title="Imprimer cette liste">`;
const replacementBtn = `<button className="btn btn-outline" onClick={() => { document.body.classList.add('print-finance-list'); window.print(); setTimeout(() => document.body.classList.remove('print-finance-list'), 1000); }} title="Imprimer cette liste">`;

if (appTxt.includes(targetBtn)) {
  appTxt = appTxt.replace(targetBtn, replacementBtn);
}

const targetDiv = `<div className="panel delay-250" style={{marginTop: '24px'}}>`;
const replacementDiv = `<div className="panel delay-250" id="finance-list-panel" style={{marginTop: '24px'}}>`;
if (appTxt.includes(targetDiv)) {
  appTxt = appTxt.replace(targetDiv, replacementDiv);
}

fs.writeFileSync('src/App.tsx', appTxt);

// Add the CSS to index.css
let cssTxt = fs.readFileSync('src/index.css', 'utf8');
const printCss = `
@media print {
  body.print-finance-list .page-header,
  body.print-finance-list .stats-grid,
  body.print-finance-list .panel:not(#finance-list-panel) {
    display: none !important;
  }
  
  body.print-finance-list #finance-list-panel {
    display: block !important;
    margin: 0 !important;
    padding: 0 !important;
    border: none !important;
    box-shadow: none !important;
    width: 100% !important;
  }
  
  body.print-finance-list #finance-list-panel .panel-header {
    border-bottom: 2px solid black !important;
    margin-bottom: 20px !important;
  }
}
`;

if (!cssTxt.includes('body.print-finance-list')) {
  fs.appendFileSync('src/index.css', printCss);
}
console.log('Patch complete.');
