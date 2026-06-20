const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

// --- 1. Dashboard Caisse ---
// We append a new dashboard section at the top of renderDashboard
if (!code.includes('<h3 className="panel-title">Aperçu Financier</h3>')) {
  code = code.replace(
    /const renderDashboard = \(\) => {([\s\S]*?)return \([\s\S]*?<div className="animate-fade-in">/,
    (match, p1) => {
      return match + `
      {currentSchoolPlan === 'Pro' && (
      <div className="dashboard-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>Total Dépenses Courantes</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>
          <div className="stat-info">
            <h3>Salaires Payés</h3>
            <p className="stat-value">{formatNum(
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>💰</div>
          <div className="stat-info">
            <h3>Total Rentrées (Factures)</h3>
            <p className="stat-value">{formatNum(invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0)} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-300">
          <div className="stat-icon" style={{backgroundColor: '#e0e7ff', color: '#6366f1'}}>🏦</div>
          <div className="stat-info">
            <h3>Solde Caisse (Rentabilité)</h3>
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} FCFA
            </p>
          </div>
        </div>
      </div>
      )}
`;
    }
  );
}

// --- 2. Employee Payment UI & Logic ---
if (!code.includes("setActiveModal('employee_payment')")) {
  code = code.replace(
    /<span className=\{\`badge \$\{staff\.status === 'Actif' \? 'badge-success' : 'badge-warning'\}\`\}>\{staff\.status\}<\/span>\s*<\/div>/g,
    `<span className={\`badge \${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}\`} style={{marginBottom: 12}}>{staff.status}</span>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(staff); setActiveModal('employee'); }}>✏️</button>
                <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(staff); setActiveModal('employee_payment'); }}>💵 Payer</button>
              </div>
            </div>`
  );
}

if (!code.includes('handleEmployeePaymentSubmit')) {
  code = code.replace(
    'const handleTeacherPaymentSubmit = async (e: React.FormEvent) => {',
    `const handleEmployeePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;
    
    try {
      const { error } = await supabase.from('employee_payments').insert([{
        school_id: currentSchoolId,
        employee_id: editEntity.id,
        amount: parseFloat(amount),
        month,
        payment_method,
        payment_date: new Date().toISOString()
      }]);
      if (error) throw error;
      await fetchEmployeePayments();
      setActiveModal('employee_receipt_preview');
    } catch(err: any) {
      console.error('Error paying employee:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleTeacherPaymentSubmit = async (e: React.FormEvent) => {`
  );
}

if (!code.includes(`activeModal === 'employee_payment'`)) {
  code = code.replace(
    `{activeModal === 'teacher_payment' && editEntity && (`,
    `{activeModal === 'employee_payment' && editEntity && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payer {editEntity.first_name} {editEntity.last_name} ({editEntity.role})</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleEmployeePaymentSubmit} className="modal-body">
              <div className="form-group">
                <label>Montant (FCFA)</label>
                <input type="number" name="amount" className="form-control" required defaultValue={editEntity.salary || 0} />
              </div>
              <div className="form-group">
                <label>Mois (ex: Septembre 2026)</label>
                <input type="text" name="month" className="form-control" required placeholder="Septembre 2026" />
              </div>
              <div className="form-group">
                <label>Méthode de paiement</label>
                <select name="payment_method" className="form-select">
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer le paiement</button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'teacher_payment' && editEntity && (`
  );
}

// 3. Import SalaryReceiptPreview and add its modal
if (!code.includes('SalaryReceiptPreview')) {
  code = code.replace(
    `import { ExpenseReceiptPreview } from './components/ExpenseReceiptPreview';`,
    `import { ExpenseReceiptPreview } from './components/ExpenseReceiptPreview';\nimport { SalaryReceiptPreview } from './components/SalaryReceiptPreview';`
  );
}

if (!code.includes(`activeModal === 'employee_receipt_preview'`)) {
  code = code.replace(
    `{activeModal === 'teacher_receipt_preview' && editEntity && (`,
    `{activeModal === 'employee_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu de Salaire (Employé)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              {employeePaymentsData.filter(p => p.employee_id === editEntity.id).length > 0 && (
                <SalaryReceiptPreview 
                  payment={employeePaymentsData.filter(p => p.employee_id === editEntity.id)[0]} 
                  employee={editEntity} 
                  schoolInfo={settingsData} 
                />
              )}
            </div>
          </div>
        )}

        {activeModal === 'teacher_receipt_preview' && editEntity && (`
  );
}

// --- 4. Mobile Menu Toggle ---
// In the header, add a toggle button
if (!code.includes('mobile-menu-toggle')) {
  code = code.replace(
    `<div className="app-header">`,
    `<div className="app-header">
          <button className="mobile-menu-toggle" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            <Icons.Menu />
          </button>`
  );
}

// Fix overlay for mobile menu
if (!code.includes('sidebar-overlay')) {
  code = code.replace(
    `<aside className={\`sidebar \${isMobileMenuOpen ? 'open' : ''}\`}>`,
    `{isMobileMenuOpen && <div className="sidebar-overlay" onClick={() => setIsMobileMenuOpen(false)}></div>}
      <aside className={\`sidebar \${isMobileMenuOpen ? 'open' : ''}\`}>`
  );
}

fs.writeFileSync(appPath, code);
console.log("App.tsx patched successfully.");
