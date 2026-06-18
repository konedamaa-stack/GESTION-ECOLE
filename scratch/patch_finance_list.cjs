const fs = require('fs');

const appFile = 'src/App.tsx';
let txt = fs.readFileSync(appFile, 'utf8');

// 1. Add state variables
const stateTarget = `  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');`;
const stateReplacement = `  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [financeStatusFilter, setFinanceStatusFilter] = useState('all');
  const [financeClassFilter, setFinanceClassFilter] = useState('all');`;

if (txt.includes(stateTarget) && !txt.includes('financeStatusFilter')) {
  txt = txt.replace(stateTarget, stateReplacement);
}

// 2. Add the panel
const panelTarget = `      <div className="panel delay-300" style={{marginTop: '24px'}}>
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.finance.panel_title', 'Dernières Transactions')}</h3>`;

const panelUI = `
      {/* NOUVEAU PANEL: Suivi des paiements par élève */}
      <div className="panel delay-250" style={{marginTop: '24px'}}>
        <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <h3 className="panel-title">Suivi des Paiements par Élève</h3>
          <div style={{display: 'flex', gap: '12px'}}>
            <select 
              className="form-select" 
              value={financeStatusFilter} 
              onChange={(e) => setFinanceStatusFilter(e.target.value)}
              style={{width: '180px'}}
            >
              <option value="all">Tous les statuts</option>
              <option value="Soldé">Soldé</option>
              <option value="Non soldé">Non soldé</option>
            </select>
            <select 
              className="form-select" 
              value={financeClassFilter} 
              onChange={(e) => setFinanceClassFilter(e.target.value)}
              style={{width: '180px'}}
            >
              <option value="all">Toutes les classes</option>
              {classesData.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button className="btn btn-outline" onClick={() => window.print()} title="Imprimer cette liste">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimer
            </button>
          </div>
        </div>
        
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Élève</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Attendu</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--success-color)'}}>Payé</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--danger-color)'}}>Reste à Payer</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {scolariteParClasse.flatMap(c => 
              (c.studentsDetails || []).map(s => ({...s, className: c.className, classId: c.id}))
            ).filter(s => {
               const matchClass = financeClassFilter === 'all' || s.classId === financeClassFilter;
               const matchStatus = financeStatusFilter === 'all' || s.status === financeStatusFilter;
               return matchClass && matchStatus;
            }).map((st, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                <td style={{padding: '16px 0'}}>{st.className}</td>
                <td style={{padding: '16px 0'}}>{formatNum(st.total)} FCFA</td>
                <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--success-color)'}}>{formatNum(st.paye)} FCFA</td>
                <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--danger-color)'}}>{formatNum(st.nonPaye)} FCFA</td>
                <td style={{padding: '16px 0'}}>
                  <span className={\`badge \${st.status === 'Soldé' ? 'badge-success' : 'badge-warning'}\`}>{st.status}</span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

`;

if (txt.includes(panelTarget) && !txt.includes('NOUVEAU PANEL: Suivi des paiements par élève')) {
  txt = txt.replace(panelTarget, panelUI + panelTarget);
}

fs.writeFileSync(appFile, txt);
console.log('App.tsx patched successfully');
