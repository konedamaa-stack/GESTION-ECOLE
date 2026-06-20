const fs = require('fs');

const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const oldRenderRHRegex = /<div className="panel delay-300">\s*<div className="panel-header">\s*<h3 className="panel-title">\{t\('admin\.rh\.panel_title', 'Personnel Administratif'\)\}<\/h3>[\s\S]*?<div style=\{\{gridColumn: '1 \/ -1'[\s\S]*?<\/div>\s*\)\}\s*<\/div>\s*<\/div>/;

const newRenderRH = `<div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.rh.panel_title', 'Personnel Administratif')}</h3>
          <div className="header-search" style={{width: 250}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.rh.search_ph', 'Rechercher...')} />
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px'}}>
          {employeesData.length > 0 ? employeesData.map((staff, i) => (
            <div key={i} style={{border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--surface-color-hover)'}}>
              <div className="avatar" style={{width: 64, height: 64, fontSize: '1.5rem', marginBottom: 12}}>{staff.first_name.charAt(0)}{staff.last_name.charAt(0)}</div>
              <h4 style={{marginBottom: 4}}>{staff.first_name} {staff.last_name}</h4>
              <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8}}>{staff.role}</span>
              <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: 12}}>{formatNum(staff.salary || 0)} FCFA</span>
              <span className={\`badge \${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}\`} style={{marginBottom: 16}}>{staff.status}</span>
              
              <div style={{display: 'flex', gap: '8px', width: '100%', marginTop: 'auto'}}>
                 <button className="btn btn-outline" style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={(e) => { e.stopPropagation(); setEditEntity(staff); setActiveModal('employee'); }}>Modifier</button>
                 <button className="btn btn-primary" style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={(e) => { e.stopPropagation(); setEditEntity(staff); setActiveModal('employee_payment'); }}>Payer</button>
              </div>
            </div>
          )) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.rh.empty_state', 'Aucun employé trouvé. Cliquez sur Ajouter.')}</div>
          )}
        </div>
      </div>
      
      <div className="panel delay-400" style={{marginTop: '20px'}}>
         <div className="panel-header">
           <h3 className="panel-title">Derniers Salaires Payés</h3>
         </div>
         <div className="table-responsive">
           <table className="table">
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Employé</th>
                 <th>Mois</th>
                 <th>Montant</th>
                 <th>Moyen</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {employeePaymentsData && employeePaymentsData.slice(0, 10).map((pay: any, idx: number) => (
                 <tr key={pay.id || idx}>
                   <td>{new Date(pay.payment_date).toLocaleDateString('fr-FR')}</td>
                   <td>{pay.employees?.first_name} {pay.employees?.last_name}</td>
                   <td>{pay.month}</td>
                   <td style={{fontWeight: 'bold', color: 'var(--accent-color)'}}>{formatNum(pay.amount)} FCFA</td>
                   <td>{pay.payment_method}</td>
                   <td>
                     <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { setEditEntity(pay.employees); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>
                       <Icons.FileText /> Reçu
                     </button>
                   </td>
                 </tr>
               ))}
               {(!employeePaymentsData || employeePaymentsData.length === 0) && (
                 <tr>
                   <td colSpan={6} style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Aucun paiement enregistré</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>`;

if (oldRenderRHRegex.test(content)) {
    content = content.replace(oldRenderRHRegex, newRenderRH);
    fs.writeFileSync(appPath, content);
    console.log('App.tsx renderRH patched correctly.');
} else {
    console.error('Could not match oldRenderRHRegex');
}
