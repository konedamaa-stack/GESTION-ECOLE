const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = `  const renderDepenses = () => (`;
const endMarker = `  const renderRH = () =>`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found: start=" + startIndex + " end=" + endIndex);
  process.exit(1);
}

const newBlock = `  const renderDepenses = () => (
    <div className="fade-in">
      <div className="page-header" style={{marginBottom: '24px'}}>
        <div>
          <h1 className="page-title">📉 Finances & Comptabilité</h1>
          <p className="page-subtitle">Consultez votre trésorerie, gérez vos emprunts et vos dépenses courantes.</p>
        </div>
      </div>

      <div className="stats-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>{t('admin.expenses.total', 'Total Dépenses Courantes')}</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>💼</div>
          <div className="stat-info">
            <h3>Total Emprunts Actifs</h3>
            <p className="stat-value">{formatNum(loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
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
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
            </p>
          </div>
        </div>
      </div>

      {/* EMPRUNTS SECTION */}
      <div className="panel delay-100" style={{marginBottom: '32px'}}>
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <div>
            <h3 className="panel-title" style={{margin: 0, fontSize: '1.2rem'}}>💼 Historique des Emprunts</h3>
            <p className="text-secondary" style={{margin: 0, fontSize: '0.9rem'}}>Fonds prêtés par des banques ou organisations</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('loan'); }}>
            + Nouvel Emprunt
          </button>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Prêteur (Banque/Org.)</th>
                <th>Montant</th>
                <th>Motif</th>
                <th>Statut</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loansData && loansData.length > 0 ? loansData.map((loan: any) => (
                <tr key={loan.id}>
                  <td>{new Date(loan.loan_date).toLocaleDateString('fr-FR')}</td>
                  <td style={{fontWeight: 'bold'}}>{loan.lender_name}</td>
                  <td style={{fontWeight: 'bold', color: '#10b981'}}>+{formatNum(loan.amount)} F</td>
                  <td>{loan.description || '-'}</td>
                  <td>
                    <span className={\`badge \${loan.status === 'Actif' ? 'badge-primary' : 'badge-success'}\`}>{loan.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(loan); setActiveModal('loan'); }}>✏️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDeleteLoan(loan.id)}>🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '24px'}}>
                    Aucun emprunt enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* END EMPRUNTS SECTION */}

      <div className="panel delay-200">
        <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
          <div>
            <h3 className="panel-title" style={{margin: 0, fontSize: '1.2rem'}}>📉 {t('admin.expenses.list', 'Historique des Dépenses')}</h3>
            <p className="text-secondary" style={{margin: 0, fontSize: '0.9rem'}}>Gérez les factures et sorties d'argent</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('expense'); }}>
            ➕ {t('admin.expenses.add', 'Nouvelle Dépense')}
          </button>
        </div>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.expenses.date', 'Date')}</th>
                <th>{t('admin.expenses.category', 'Catégorie')}</th>
                <th>{t('admin.expenses.amount', 'Montant')}</th>
                <th>{t('admin.expenses.description', 'Description')}</th>
                <th style={{textAlign: 'right'}}>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {expensesData && expensesData.length > 0 ? expensesData.map((expense: any) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.payment_date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className="badge badge-warning">{expense.category}</span>
                  </td>
                  <td style={{fontWeight: 'bold'}}>{formatNum(expense.amount)} F</td>
                  <td>{expense.description || '-'}</td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} title="Imprimer le reçu" onClick={() => { setEditEntity(expense); setActiveModal('expense_receipt_preview'); }}>🖨️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(expense); setActiveModal('expense'); }}>✏️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDeleteExpense(expense.id)}>🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '24px', color: 'var(--text-secondary)'}}>
                    {t('admin.expenses.empty', 'Aucune dépense enregistrée')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

`;

code = code.slice(0, startIndex) + newBlock + code.slice(endIndex);

fs.writeFileSync('src/App.tsx', code);
console.log("Replaced fully!");
