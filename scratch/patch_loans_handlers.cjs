const fs = require('fs');
const path = require('path');

let appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

// Add handleAddLoan and handleDeleteLoan
const loanHandlers = `
  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId) return;
    const form = e.target as HTMLFormElement;
    const lender_name = (form.elements.namedItem('lender_name') as HTMLInputElement).value;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const loan_date = (form.elements.namedItem('loan_date') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement)?.value || 'Actif';

    try {
      if (editEntity) {
        const { error } = await supabase
          .from('loans')
          .update({ lender_name, amount, loan_date, description, status })
          .eq('id', editEntity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('loans')
          .insert([{ school_id: currentSchoolId, lender_name, amount, loan_date, description, status }]);
        if (error) throw error;
      }
      await fetchLoans();
      closeModal();
    } catch (err: any) {
      console.error('Error saving loan:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emprunt ?')) return;
    try {
      const { error } = await supabase.from('loans').delete().eq('id', id);
      if (error) throw error;
      await fetchLoans();
    } catch (err: any) {
      console.error('Error deleting loan:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {`;

if (!appCode.includes('const handleAddLoan')) {
  appCode = appCode.replace('  const handleAddExpense = async (e: React.FormEvent) => {', loanHandlers);
}

// Add Loans UI Section in activeTab === 'finances'
const loansUISection = `
        <div className="section-header" style={{marginTop: '24px'}}>
          <div>
            <h2 className="section-title">💼 Emprunts & Financements</h2>
            <p className="section-subtitle">Gérez les fonds prêtés par des banques ou organisations</p>
          </div>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('loan'); }}>
            + Nouvel Emprunt
          </button>
        </div>

        <div className="panel" style={{marginBottom: '24px'}}>
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

        <div className="section-header" style={{marginTop: '24px'}}>
          <div>
            <h2 className="section-title">💸 {t('admin.expenses.title', 'Dépenses')}</h2>`;

if (!appCode.includes('💼 Emprunts & Financements')) {
  appCode = appCode.replace(`        <div className="section-header" style={{marginTop: '24px'}}>
          <div>
            <h2 className="section-title">💸 {t('admin.expenses.title', 'Dépenses')}</h2>`, loansUISection);
}

// Add the 'loan' modal
const loanModal = `
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

        {activeModal === 'expense' && (`;

if (!appCode.includes('activeModal === \'loan\'')) {
  appCode = appCode.replace('        {activeModal === \'expense\' && (', loanModal);
}

fs.writeFileSync(appPath, appCode);
console.log('App.tsx patched with Loans handlers, UI, and Modal.');
