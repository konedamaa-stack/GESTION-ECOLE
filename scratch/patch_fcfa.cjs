const fs = require('fs');
const path = require('path');

// Helper to replace text in a file
function replaceInFile(filePath, searchRegex, replacement) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(searchRegex, replacement);
  fs.writeFileSync(filePath, content);
}

const appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

// 1. Add Caisse summary to renderFinances()
if (!appCode.includes('<div className="dashboard-grid" style={{marginBottom: \'24px\'}}>{/* Added Caisse to Finances */}')) {
  // Find renderFinances
  appCode = appCode.replace(
    /<h1 className="page-title">\{t\('admin.finances.title', 'Comptabilit \& Scolarit'\)\}<\/h1>[\s\S]*?<p className="page-subtitle">\{t\('admin.finances.subtitle', 'Grez les paiements, factures et dpenses de l\\'tablissement.'\)\}<\/p>[\s\S]*?<\/div>[\s\S]*?<\/div>[\s\S]*?<div className="tabs">/,
    (match) => {
      // We will insert the dashboard grid right before `<div className="tabs">`
      return match.replace('<div className="tabs">', `
      {currentSchoolPlan === 'Pro' && (
      <div className="dashboard-grid" style={{marginBottom: '24px'}}>{/* Added Caisse to Finances */}
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>Total Dépenses Courantes</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>
          <div className="stat-info">
            <h3>Salaires Payés</h3>
            <p className="stat-value">{formatNum(
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} F</p>
          </div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>💰</div>
          <div className="stat-info">
            <h3>Total Rentrées (Factures)</h3>
            <p className="stat-value">{formatNum(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-300">
          <div className="stat-icon" style={{backgroundColor: '#e0e7ff', color: '#6366f1'}}>🏦</div>
          <div className="stat-info">
            <h3>Solde Caisse (Rentabilité)</h3>
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
            </p>
          </div>
        </div>
      </div>
      )}
      <div className="tabs">`);
    }
  );
}

// 2. Change FCFA to F everywhere
// In App.tsx
appCode = appCode.replace(/FCFA/g, 'F');
appCode = appCode.replace(/fcfa/g, 'F');
fs.writeFileSync(appPath, appCode);

// In Receipt Components
const componentsDir = path.join(__dirname, '../src/components');
const filesToUpdate = ['ExpenseReceiptPreview.tsx', 'ReceiptPreview.tsx', 'SalaryReceiptPreview.tsx', 'TeacherReceiptPreview.tsx'];

filesToUpdate.forEach(file => {
  const filePath = path.join(componentsDir, file);
  if (fs.existsSync(filePath)) {
    let fileContent = fs.readFileSync(filePath, 'utf8');
    fileContent = fileContent.replace(/FCFA/g, 'F');
    fs.writeFileSync(filePath, fileContent);
  }
});

console.log("Changes applied successfully.");
