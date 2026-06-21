const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Top Header
const topHeaderRegex = /<div className="section-header" style=\{\{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'\}\}>\s*<div>\s*<h2 className="section-title">📉 \{t\('admin\.expenses\.title', 'Dépenses'\)\}<\/h2>\s*<p className="section-subtitle">\{t\('admin\.expenses\.subtitle', 'Gérez les factures et sorties d\\'argent de l\\'établissement'\)\}<\/p>\s*<\/div>\s*<button className="btn btn-primary" onClick=\{.*?setActiveModal\('expense'\); \}\}>\s*➕ \{t\('admin\.expenses\.add', 'Nouvelle Dépense'\)\}\s*<\/button>\s*<\/div>/;

const genericPageHeader = `<div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <h1 className="page-title">📉 Finances & Comptabilité</h1>
          <p className="page-subtitle">Consultez votre trésorerie, gérez vos emprunts et vos dépenses courantes.</p>
        </div>
      </div>`;
code = code.replace(topHeaderRegex, genericPageHeader);

// 2. Emprunts Header
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
code = code.replace(empruntsHeaderRegex, newEmpruntsPanelHeader);

// 3. Depenses Panel Header
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
code = code.replace(depensesPanelHeaderRegex, newDepensesPanelHeader);

// 4. Fix Grid
const gridStartRegex = /<div className="dashboard-grid" style=\{\{marginBottom: '24px'\}\}>/;
code = code.replace(gridStartRegex, `<div className="stats-grid" style={{marginBottom: '24px'}}>`);

// 5. Add 5th Card
const secondCardRegex = /<div className="stat-card delay-100">\s*<div className="stat-icon" style=\{\{backgroundColor: '#fef3c7', color: '#f59e0b'\}\}>🧑‍🏫<\/div>/;
const newCard = `<div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>💼</div>
          <div className="stat-info">
            <h3>Total Emprunts Actifs</h3>
            <p className="stat-value">{formatNum(loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>`;
code = code.replace(secondCardRegex, newCard);

// 6. Fix Grid Closure BEFORE EMPRUNTS SECTION
const gridClosureRegex = /([ \t]*)<\/div>\s*\{\/\* EMPRUNTS SECTION \*\/\}/s;
code = code.replace(gridClosureRegex, `$1<\/div>\n$1<\/div>\n$1{/* EMPRUNTS SECTION */}`);

// 7. Remove the extra closing div after EMPRUNTS SECTION
const extraDivRegex = /\{\/\* END EMPRUNTS SECTION \*\/\}\s*<\/div>\s*<div className="panel delay-200">/s;
code = code.replace(extraDivRegex, `{/* END EMPRUNTS SECTION */}\n\n      <div className="panel delay-200">`);


fs.writeFileSync('src/App.tsx', code);
console.log("Layout completely fixed.");
