const fs = require('fs');

let cssTxt = fs.readFileSync('src/index.css', 'utf8');

// Replace the previous print rules for finance list
const targetCSS = `@media print {
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
}`;

const replacementCSS = `@media print {
  /* Isolate Finance List */
  body.print-finance-list .page-header,
  body.print-finance-list .stats-grid,
  body.print-finance-list .sidebar,
  body.print-finance-list .top-header,
  body.print-finance-list .panel:not(#finance-list-panel) {
    display: none !important;
  }
  
  body.print-finance-list #finance-list-panel,
  body.print-finance-list #finance-list-panel * {
    visibility: visible !important;
  }
  
  body.print-finance-list #finance-list-panel {
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
  
  /* Isolate Student List */
  body.print-student-list .page-header,
  body.print-student-list .stats-grid,
  body.print-student-list .sidebar,
  body.print-student-list .top-header,
  body.print-student-list .panel:not(#student-list-panel) {
    display: none !important;
  }
  
  body.print-student-list #student-list-panel,
  body.print-student-list #student-list-panel * {
    visibility: visible !important;
  }
  
  body.print-student-list #student-list-panel {
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
}`;

if (cssTxt.includes(targetCSS)) {
  cssTxt = cssTxt.replace(targetCSS, replacementCSS);
} else {
  // If it's not there exactly, just append it
  cssTxt += '\n' + replacementCSS;
}

fs.writeFileSync('src/index.css', cssTxt);

let appTxt = fs.readFileSync('src/App.tsx', 'utf8');

const targetPanel = `<div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.students.panel_title', 'Annuaire des Élèves')}</h3>`;

const replacementPanel = `<div className="panel delay-300" id="student-list-panel">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.students.panel_title', 'Annuaire des Élèves')}</h3>`;

if (appTxt.includes(targetPanel)) {
  appTxt = appTxt.replace(targetPanel, replacementPanel);
}

const targetButton = `<button 
              className="btn btn-outline" 
              onClick={() => window.print()}
              title="Imprimer la liste"`;

const replacementButton = `<button 
              className="btn btn-outline" 
              onClick={() => { document.body.classList.add('print-student-list'); window.print(); setTimeout(() => document.body.classList.remove('print-student-list'), 1000); }}
              title="Imprimer la liste"`;

if (appTxt.includes(targetButton)) {
  appTxt = appTxt.replace(targetButton, replacementButton);
}

fs.writeFileSync('src/App.tsx', appTxt);
console.log('Patch complete');
