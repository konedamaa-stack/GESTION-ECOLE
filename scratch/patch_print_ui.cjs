const fs = require('fs');

let appContent = fs.readFileSync('src/App.tsx', 'utf8');

// Finance list panel
appContent = appContent.replace(
  '<h3 className="panel-title" style={{textTransform: \'uppercase\'}}>',
  '<h3 className="panel-title finance-print-title" style={{textTransform: \'uppercase\'}}>'
);

appContent = appContent.replace(
  '<div style={{display: \'flex\', gap: \'12px\'}}>',
  '<div className="finance-filters" style={{display: \'flex\', gap: \'12px\'}}>'
);

// Student list panel
appContent = appContent.replace(
  '<h3 className="panel-title">{t(\'admin.students.panel_title\', \'Annuaire des Élèves\')}</h3>',
  '<h3 className="panel-title student-print-title">{t(\'admin.students.panel_title\', \'Annuaire des Élèves\')}</h3>'
);

appContent = appContent.replace(
  '<div style={{display: \'flex\', gap: \'12px\', alignItems: \'center\'}}>',
  '<div className="student-filters" style={{display: \'flex\', gap: \'12px\', alignItems: \'center\'}}>'
);

fs.writeFileSync('src/App.tsx', appContent);

let cssContent = fs.readFileSync('src/index.css', 'utf8');

const printCssTarget = `  body.print-finance-list #finance-list-panel {
    display: block !important;
    position: absolute !important;`;

const newPrintCssRules = `  body.print-finance-list .finance-filters {
    display: none !important;
  }
  
  body.print-finance-list #finance-list-panel .panel-header {
    justify-content: center !important;
  }
  
  body.print-finance-list .finance-print-title {
    text-align: center !important;
    width: 100% !important;
    margin-bottom: 0 !important;
  }

  body.print-student-list .student-filters {
    display: none !important;
  }
  
  body.print-student-list #student-list-panel .panel-header {
    justify-content: center !important;
  }
  
  body.print-student-list .student-print-title {
    text-align: center !important;
    width: 100% !important;
    margin-bottom: 0 !important;
  }

`;

if (!cssContent.includes('.finance-filters {') && cssContent.includes(printCssTarget)) {
  cssContent = cssContent.replace(printCssTarget, newPrintCssRules + printCssTarget);
  fs.writeFileSync('src/index.css', cssContent);
}

console.log('Patch complete');
