const fs = require('fs');

const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

function replaceStr(search, replacement) {
    if (content.includes(search)) {
        content = content.replace(search, replacement);
    } else {
        console.warn('Could not find string:', search.substring(0, 50));
    }
}

// 1. Add employeePaymentsData state
replaceStr(
    'const [invoicesData, setInvoicesData] = useState<any[]>([]);',
    `const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);`
);

// 2. Add fetchEmployeePayments
replaceStr(
    '  const fetchInvoices = async () => {',
    `  const fetchEmployeePayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase
        .from('employee_payments')
        .select('*, employees(first_name, last_name, role)')
        .eq('school_id', currentSchoolId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      setEmployeePaymentsData(data || []);
    } catch (error: any) {
      console.error("Error fetching employee payments:", error);
    }
  };

  const fetchInvoices = async () => {`
);

// 3. Call fetchEmployeePayments
replaceStr(
    '      fetchInvoices();',
    `      fetchInvoices();
      fetchEmployeePayments();`
);

// 4. Import SalaryReceiptPreview
replaceStr(
    "import { ReceiptPreview } from './components/ReceiptPreview';",
    `import { ReceiptPreview } from './components/ReceiptPreview';
import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';`
);

// 5. Add modal header text
replaceStr(
    `                  {activeModal === 'employee' && t('admin.modals.employee', "Ajouter un Employé")}`,
    `                  {activeModal === 'employee' && t('admin.modals.employee', "Ajouter un Employé")}
                  {activeModal === 'employee_payment' && "Payer Salaire"}
                  {activeModal === 'employee_payment_preview' && "Reçu de Salaire"}`
);

// 6. Fix `employee` form to include salary
const oldEmployeeForm = `{activeModal === 'employee' && (
                      <div className="form-group">
                        <label>{t('admin.modals.role', 'Poste / Rôle')}</label>
                        <input type="text" name="role" className="form-input" required />
                      </div>
                    )}`;
const newEmployeeForm = `{activeModal === 'employee' && (
                      <>
                      <div className="form-group">
                        <label>{t('admin.modals.role', 'Poste / Rôle')}</label>
                        <input type="text" name="role" className="form-input" required defaultValue={editEntity?.role || ''} />
                      </div>
                      <div className="form-group">
                        <label>Salaire Mensuel (FCFA)</label>
                        <input type="number" name="salary" className="form-input" required defaultValue={editEntity?.salary || 0} />
                      </div>
                      </>
                    )}`;
replaceStr(oldEmployeeForm, newEmployeeForm);

// 7. Add employee payment modal body
const oldParentModal = `{activeModal === 'parent' && (
                      <div className="form-group">
                        <label>{t('admin.modals.link_to_student', 'Lier à un élève (Matricule ou Nom)')}</label>
                        <input type="text" className="form-input" />
                      </div>
                    )}`;
const newModals = `{activeModal === 'parent' && (
                      <div className="form-group">
                        <label>{t('admin.modals.link_to_student', 'Lier à un élève (Matricule ou Nom)')}</label>
                        <input type="text" className="form-input" />
                      </div>
                    )}
                {activeModal === 'employee_payment' && editEntity && (
                    <div className="form-grid">
                      <div className="form-group">
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
                      <div className="form-group">
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
replaceStr(oldParentModal, newModals);

// 8. Add `employee_payment_preview` button logics
replaceStr(
    `{!['global_grades', 'bulletin_preview', 'receipt_preview', 'parent_children', 'coefficients'].includes(activeModal) && (`,
    `{!['global_grades', 'bulletin_preview', 'receipt_preview', 'parent_children', 'coefficients', 'employee_payment_preview'].includes(activeModal) && (`
);

// 9. Update employee submit payload
const oldEmployeePayload = `const employee = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: formData.get('role'),
            phone: formData.get('phone'),
            email: formData.get('email'),
          };`;
const newEmployeePayload = `const employee = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: formData.get('role'),
            salary: formData.get('salary') ? Number(formData.get('salary')) : 0,
            phone: formData.get('phone'),
            email: formData.get('email'),
          };`;
replaceStr(oldEmployeePayload, newEmployeePayload);

// 10. Handle employee_payment submit
const oldFetchEmployeesCall = `          if (error) throw error;
          fetchEmployees();
        }
        else if (activeModal === 'absence') {`;
const newFetchEmployeesCall = `          if (error) throw error;
          fetchEmployees();
        }
        else if (activeModal === 'employee_payment') {
          const dateStr = formData.get('month') as string;
          const [year, monthNum] = dateStr.split('-');
          const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];
          const monthText = monthNames[parseInt(monthNum)-1] + " " + year;
          
          const payment = {
             employee_id: editEntity.id,
             amount: Number(formData.get('amount')),
             month: monthText,
             motif: formData.get('motif'),
             payment_method: formData.get('payment_method')
          };
          const { data, error } = await supabase.from('employee_payments').insert([{...payment, school_id: currentSchoolId}]).select().single();
          if (error) throw error;
          fetchEmployeePayments();
          setSelectedInvoice(data);
          setActiveModal('employee_payment_preview');
          return; // prevent modal close
        }
        else if (activeModal === 'absence') {`;
replaceStr(oldFetchEmployeesCall, newFetchEmployeesCall);

// 11. Update renderRH
const oldRenderRH = `      <div className="panel delay-300">
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
              <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12}}>{staff.role}</span>
              <span className={\`badge \${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}\`}>{staff.status}</span>
            </div>
          )) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.rh.empty_state', 'Aucun employé trouvé. Cliquez sur Ajouter.')}</div>
          )}
        </div>
      </div>`;

const newRenderRH = `      <div className="panel delay-300">
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
              <span style={{fontWeight: 'bold', fontSize: '1rem', color: 'var(--accent-color)', marginBottom: 12}}>{formatNum(staff.salary || 0)} FCFA</span>
              <span className={\`badge \${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}\`} style={{marginBottom: 12}}>{staff.status}</span>
              <div style={{display: 'flex', gap: '8px', marginTop: 'auto', width: '100%'}}>
                 <button className="btn btn-outline" style={{flex: 1, padding: '6px'}} onClick={() => { setEditEntity(staff); setActiveModal('employee'); }}>Modifier</button>
                 <button className="btn btn-primary" style={{flex: 1, padding: '6px'}} onClick={() => { setEditEntity(staff); setActiveModal('employee_payment'); }}>Payer</button>
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

replaceStr(oldRenderRH, newRenderRH);

// Make sure formatNum is available in renderRH scope, it is usually global
// Save
fs.writeFileSync(appPath, content);
console.log('App.tsx patched correctly.');
