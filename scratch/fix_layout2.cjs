const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Replace the top-level "Dépenses" section header with a generic page header
const topHeaderRegex = /<div className="section-header" style=\{\{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'\}\}>\s*<div>\s*<h2 className="section-title">📉 \{t\('admin\.expenses\.title', 'Dépenses'\)\}<\/h2>\s*<p className="section-subtitle">\{t\('admin\.expenses\.subtitle', 'Gérez les factures et sorties d\\'argent de l\\'établissement'\)\}<\/p>\s*<\/div>\s*<button className="btn btn-primary" onClick=\{.*?setActiveModal\('expense'\); \}\}>\s*➕ \{t\('admin\.expenses\.add', 'Nouvelle Dépense'\)\}\s*<\/button>\s*<\/div>/;

const genericPageHeader = `<div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <h1 className="page-title">📉 Finances & Comptabilité</h1>
          <p className="page-subtitle">Consultez votre trésorerie, gérez vos emprunts et vos dépenses courantes.</p>
        </div>
      </div>`;

if(topHeaderRegex.test(code)) {
  code = code.replace(topHeaderRegex, genericPageHeader);
  console.log("Top header replaced.");
} else {
  console.log("Top header NOT found.");
}

// 2. Fix the Emprunts section to combine the header and panel
const empruntsHeaderRegex = /<div className="section-header" style=\{\{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'\}\}>\s*<div>\s*<h2 className="section-title">💼 Emprunts & Financements<\/h2>\s*<p className="section-subtitle">Gérez les fonds prêtés par des banques ou organisations<\/p>\s*<\/div>\s*<button className="btn btn-primary" onClick=\{.*?setActiveModal\('loan'\); \}\}>\s*\+ Nouvel Emprunt\s*<\/button>\s*<\/div>\s*<div className="panel" style=\{\{marginBottom: '32px'\}\}>\s*<h3 className="panel-title">Historique des Emprunts<\/h3>/;

const newEmpruntsPanelHeader = `<div className="panel" style={{marginBottom: '32px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <div>
            <h3 className="panel-title" style={{margin: 0, fontSize: '1.2rem'}}>💼 Historique des Emprunts</h3>
            <p className="text-secondary" style={{margin: 0, fontSize: '0.9rem'}}>Fonds prêtés par des banques ou organisations</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('loan'); }}>
            + Nouvel Emprunt
          </button>
        </div>`;

if(empruntsHeaderRegex.test(code)) {
  code = code.replace(empruntsHeaderRegex, newEmpruntsPanelHeader);
  console.log("Emprunts header replaced.");
} else {
  console.log("Emprunts header NOT found.");
}

// 3. Fix the Dépenses panel to include the button and better header
const depensesPanelHeaderRegex = /<h3 className="panel-title">\{t\('admin\.expenses\.list', 'Historique des Dépenses'\)\}<\/h3>/;

const newDepensesPanelHeader = `<div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <div>
            <h3 className="panel-title" style={{margin: 0, fontSize: '1.2rem'}}>📉 {t('admin.expenses.list', 'Historique des Dépenses')}</h3>
            <p className="text-secondary" style={{margin: 0, fontSize: '0.9rem'}}>Gérez les factures et sorties d'argent</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('expense'); }}>
            ➕ {t('admin.expenses.add', 'Nouvelle Dépense')}
          </button>
        </div>`;

if(depensesPanelHeaderRegex.test(code)) {
  code = code.replace(depensesPanelHeaderRegex, newDepensesPanelHeader);
  console.log("Depenses header replaced.");
} else {
  console.log("Depenses header NOT found.");
}

fs.writeFileSync('src/App.tsx', code);
console.log("Layout fixed successfully.");
