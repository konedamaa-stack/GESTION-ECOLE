const fs = require('fs');
const path = require('path');

let appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

const renderDepensesStart = `  const renderDepenses = () => (
    <div className="fade-in">`;

const loansUI = `
      {/* EMPRUNTS SECTION */}
      <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2 className="section-title">💼 Emprunts & Financements</h2>
          <p className="section-subtitle">Gérez les fonds prêtés par des banques ou organisations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('loan'); }}>
          + Nouvel Emprunt
        </button>
      </div>

      <div className="panel" style={{marginBottom: '32px'}}>
        <h3 className="panel-title">Historique des Emprunts</h3>
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
`;

if (!appCode.includes('EMPRUNTS SECTION')) {
  appCode = appCode.replace(renderDepensesStart, renderDepensesStart + loansUI);
}

const loanModalUI = `
        {activeModal === 'loan' && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEntity ? 'Modifier l\\'Emprunt' : 'Nouvel Emprunt'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleAddLoan} className="modal-body">
              <div className="form-group">
                <label>Nom du prêteur (Banque, Organisation...)</label>
                <input type="text" name="lender_name" className="form-control" required defaultValue={editEntity?.lender_name || ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Montant (F)</label>
                  <input type="number" name="amount" className="form-control" required min="0" step="1" defaultValue={editEntity?.amount || ''} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="loan_date" className="form-control" required defaultValue={editEntity?.loan_date || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-group">
                <label>Motif de l'emprunt</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={editEntity?.description || ''} placeholder="Ex: Achat de bus scolaire..."></textarea>
              </div>
              {editEntity && (
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" className="form-control" defaultValue={editEntity.status}>
                    <option value="Actif">Actif</option>
                    <option value="Remboursé">Remboursé</option>
                  </select>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>{t('common.cancel', 'Annuler')}</button>
                <button type="submit" className="btn btn-primary">{t('common.save', 'Enregistrer')}</button>
              </div>
            </form>
          </div>
        )}
`;

if (!appCode.includes('activeModal === \'loan\'')) {
  appCode = appCode.replace('{activeModal === \'expense\' && (', loanModalUI + '\n        {activeModal === \'expense\' && (');
}

fs.writeFileSync(appPath, appCode);
console.log('UI Patched successfully.');
