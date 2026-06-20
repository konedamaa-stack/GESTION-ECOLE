const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add states for expenses
if (!code.includes('expensesData')) {
  code = code.replace(
    /const \[scolariteData, setScolariteData\] = useState<any\[\]>\(\[\]\);/g,
    `const [scolariteData, setScolariteData] = useState<any[]>([]);\n  const [expensesData, setExpensesData] = useState<any[]>([]);`
  );
}

// 2. Add fetchExpenses
if (!code.includes('fetchExpenses')) {
  code = code.replace(
    /const fetchScolarite = async \(\) => \{[\s\S]*?^\s*\};\s*$/m,
    `$&

  const fetchExpenses = async () => {
    if (!currentSchool) return;
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', currentSchool.id)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setExpensesData(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
      // setError(err.message);
    } finally {
      setLoading(false);
    }
  };`
  );
}

// 3. Add fetchExpenses to the useEffect where fetchScolarite is called
if (!code.includes('fetchExpenses();')) {
  code = code.replace(
    /fetchScolarite\(\);/g,
    `fetchScolarite();\n        fetchExpenses();`
  );
}

// 4. Add renderDepenses function
if (!code.includes('renderDepenses = ()')) {
  code = code.replace(
    /const renderScolarite = \(\) => \{[\s\S]*?(?=^  const renderRH)/m,
    `$&
  const renderDepenses = () => (
    <div className="fade-in">
      <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2 className="section-title">📉 {t('admin.expenses.title', 'Dépenses')}</h2>
          <p className="section-subtitle">{t('admin.expenses.subtitle', 'Gérez les factures et sorties d\\'argent de l\\'établissement')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('expense'); }}>
          ➕ {t('admin.expenses.add', 'Nouvelle Dépense')}
        </button>
      </div>

      <div className="dashboard-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>{t('admin.expenses.total', 'Total Dépenses')}</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} FCFA</p>
          </div>
        </div>
      </div>

      <div className="panel delay-200">
        <h3 className="panel-title">{t('admin.expenses.list', 'Historique des Dépenses')}</h3>
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
                  <td style={{fontWeight: 'bold'}}>{formatNum(expense.amount)} FCFA</td>
                  <td>{expense.description || '-'}</td>
                  <td style={{textAlign: 'right'}}>
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

`
  );
}

// 5. Add handleDeleteExpense and handleAddExpense
if (!code.includes('handleDeleteExpense = async')) {
  code = code.replace(
    /const handleUpdateTransaction = async.*?^\s*\};\s*$/m,
    `$&

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchool) return;
    
    setLoading(true);
    const form = e.target as HTMLFormElement;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    try {
      if (editEntity) {
        const { error } = await supabase
          .from('expenses')
          .update({
            category,
            amount: parseFloat(amount),
            payment_date: date,
            description
          })
          .eq('id', editEntity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{
            school_id: currentSchool.id,
            category,
            amount: parseFloat(amount),
            payment_date: date,
            description
          }]);
        if (error) throw error;
      }
      
      await fetchExpenses();
      closeModal();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;
    setLoading(true);
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      alert('Erreur: ' + err.message);
    } finally {
      setLoading(false);
    }
  };`
  );
}

// 6. Add Expense Modal
if (!code.includes(`activeModal === 'expense'`)) {
  code = code.replace(
    /\{activeModal === 'payment' && \([\s\S]*?<\/div>\s*\)\s*\}/,
    `$&
        {activeModal === 'expense' && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEntity ? t('admin.expenses.edit_expense', 'Modifier la Dépense') : t('admin.expenses.add_expense', 'Nouvelle Dépense')}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleAddExpense} className="modal-body">
              <div className="form-group">
                <label>{t('admin.expenses.category', 'Catégorie')}</label>
                <select name="category" className="form-control" required defaultValue={editEntity?.category || 'Électricité'}>
                  <option value="Électricité">Électricité</option>
                  <option value="Eau">Eau</option>
                  <option value="Loyer">Loyer</option>
                  <option value="Fournitures">Fournitures</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Salaire">Salaire (Autre)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.amount', 'Montant (FCFA)')}</label>
                <input type="number" name="amount" className="form-control" required min="0" step="1" defaultValue={editEntity?.amount || ''} />
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.date', 'Date')}</label>
                <input type="date" name="date" className="form-control" required defaultValue={editEntity?.payment_date || new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.description', 'Description')}</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={editEntity?.description || ''} placeholder="Détails de la dépense..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>{t('common.cancel', 'Annuler')}</button>
                <button type="submit" className="btn btn-primary" disabled={loading}>
                  {loading ? '...' : t('common.save', 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        )}`
  );
}

// 7. Add "depenses" to render array
if (!code.includes(`{activeTab === 'depenses' && renderDepenses()}`)) {
  code = code.replace(
    /\{activeTab === 'scolarite' && renderScolarite\(\)\}/,
    `$&\n          {activeTab === 'depenses' && renderDepenses()}`
  );
}

// 8. Add sidebar navigation
if (!code.includes(`activeTab === 'depenses'`)) {
  code = code.replace(
    /<li className=\{`nav-item \$\{activeTab === 'scolarite' \? 'active' : ''\}`\} onClick=\{\(\) => \{ setActiveTab\('scolarite'\); setIsMobileMenuOpen\(false\); \}\}>\s*<span className="nav-icon">💰<\/span>\s*<span className="nav-text">\{t\('sidebar\.scolarite', 'Scolarité'\)\}<\/span>\s*<\/li>/,
    `$&
          <li className={\`nav-item \${activeTab === 'depenses' ? 'active' : ''}\`} onClick={() => { setActiveTab('depenses'); setIsMobileMenuOpen(false); }}>
            <span className="nav-icon">📉</span>
            <span className="nav-text">{t('sidebar.expenses', 'Dépenses')}</span>
          </li>`
  );
}

fs.writeFileSync(filePath, code);
console.log("Successfully patched App.tsx for Expenses feature");
