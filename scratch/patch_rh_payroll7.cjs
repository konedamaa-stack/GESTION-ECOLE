const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/);

// 1. renderRH is from lines 1761 to 1815 (0-indexed)
// wait, 1762 is 1761 in 0-indexed.
// let's verify line content first.
if (!lines[1761].includes('const renderRH')) {
    console.error("renderRH not at expected line. It is at:", lines.findIndex(l => l.includes('const renderRH')));
    process.exit(1);
}

const renderRHStart = lines.findIndex(l => l.includes('const renderRH'));
const renderTeachersStart = lines.findIndex(l => l.includes('const renderTeachers'));

const newRenderRH = `  const renderRH = () => currentSchoolPlan !== 'Pro' ? renderPremiumOverlay(t('admin.rh.premium_title', "Ressources Humaines"), t('admin.rh.premium_desc', "Gérez les contrats, salaires et plannings de vos employés avec le plan Pro.")) : (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.rh.title', 'Ressources Humaines')}</h1>
          <p className="page-subtitle">{t('admin.rh.subtitle', 'Gestion globale du personnel (Administratif, Survie, etc.).')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('employee')}>
          <Icons.Plus /> {t('admin.rh.btn_add', 'Ajouter Employé')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">{t('admin.rh.stat_admin', 'Personnel Admin.')}</span>
            <Icons.Briefcase />
          </div>
          <div className="stat-value">{formatNum(employeesData.length)}</div>
          <div className="stat-trend trend-up">{t('admin.rh.stat_admin_desc', 'Membres du personnel')}</div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.rh.stat_leave', 'Congés en cours')}</span>
            <Icons.Activity />
          </div>
          <div className="stat-value">{formatNum(0)}</div>
          <div className="stat-trend trend-down">{t('admin.rh.stat_leave_desc', 'Sur {{count}} personnels total', { count: employeesData.length })}</div>
        </div>
      </div>

      <div className="panel delay-300">
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
      </div>
    </div>
  );`;

lines.splice(renderRHStart, renderTeachersStart - renderRHStart, ...newRenderRH.split('\n'));

// Now fix the parent modal block which starts around line 3635.
// Let's find it.
const parentStart = lines.findIndex(l => l.includes("activeModal === 'parent' && ("));
// The div ends 5 lines later
const parentEnd = parentStart + 5;

const newParentModals = `              {activeModal === 'parent' && (
                    <div className="form-group">
                      <label>{t('admin.modals.link_to_student', 'Lier à un élève (Matricule ou Nom)')}</label>
                      <input type="text" className="form-input" />
                    </div>
                  )}
                {activeModal === 'employee_payment' && editEntity && (
                    <div className="form-grid">
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>Employé</label>
                        <input type="text" className="form-input" disabled value={editEntity.first_name + ' ' + editEntity.last_name + ' (' + editEntity.role + ')'} />
                      </div>
                      <div className="form-group">
                        <label>Mois payé</label>
                        <input type="month" name="month" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label>Montant (FCFA)</label>
                        <input type="number" name="amount" className="form-input" required defaultValue={editEntity.salary || 0} />
                      </div>
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>Moyen de paiement</label>
                        <select name="payment_method" className="form-input">
                          <option value="Espèces">Espèces</option>
                          <option value="Virement">Virement</option>
                          <option value="Mobile Money">Mobile Money</option>
                          <option value="Chèque">Chèque</option>
                        </select>
                      </div>
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>Motif</label>
                        <input type="text" name="motif" className="form-input" placeholder="Ex: Salaire du mois de Juin" />
                      </div>
                    </div>
                )}
                {activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                   <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
                )}`;

lines.splice(parentStart, parentEnd - parentStart + 1, ...newParentModals.split('\n'));

fs.writeFileSync(appPath, lines.join('\r\n'));
console.log('App.tsx renderRH and parent modals patched correctly using explicit slices!');
