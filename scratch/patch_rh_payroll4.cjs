const fs = require('fs');

const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 5. Add modal header text
content = content.replace(
    /\{activeModal === 'employee' && t\('admin\.modals\.employee', "Ajouter un EmployǸ"\)\}/,
    `{activeModal === 'employee' && t('admin.modals.employee', "Ajouter un EmployǸ")}
                  {activeModal === 'employee_payment' && "Payer Salaire"}
                  {activeModal === 'employee_payment_preview' && "Reçu de Salaire"}`
);
content = content.replace(
    /\{activeModal === 'employee' && t\('admin\.modals\.employee', "Ajouter un Employé"\)\}/,
    `{activeModal === 'employee' && t('admin.modals.employee', "Ajouter un Employé")}
                  {activeModal === 'employee_payment' && "Payer Salaire"}
                  {activeModal === 'employee_payment_preview' && "Reçu de Salaire"}`
);

// 6. Fix `employee` form to include salary
content = content.replace(
    /\{activeModal === 'employee' && \(\s*<div className="form-group">\s*<label>\{t\('admin\.modals\.role', 'Poste \/ Rle'\)\}<\/label>\s*<input type="text" name="role" className="form-input" required \/>\s*<\/div>\s*\)/,
    `{activeModal === 'employee' && (
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
                    )}`
);

// 7. Add employee payment modal body
content = content.replace(
    /\{activeModal === 'parent' && \(\s*<div className="form-group">\s*<label>\{t\('admin\.modals\.link_to_student', 'Lier  un Ǹlve \(Matricule ou Nom\)'\)\}<\/label>\s*<input type="text" className="form-input" \/>\s*<\/div>\s*\)/,
    `{activeModal === 'parent' && (
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
                )}`
);

// 8. Add `employee_payment_preview` button logics
content = content.replace(
    /\{!\['global_grades', 'bulletin_preview', 'receipt_preview', 'parent_children', 'coefficients'\]\.includes\(activeModal\) && \(/,
    `{!['global_grades', 'bulletin_preview', 'receipt_preview', 'parent_children', 'coefficients', 'employee_payment_preview'].includes(activeModal) && (`
);

// 9. Update employee submit payload
content = content.replace(
    /const employee = \{\s*first_name: formData\.get\('first_name'\),\s*last_name: formData\.get\('last_name'\),\s*role: formData\.get\('role'\),\s*phone: formData\.get\('phone'\),\s*email: formData\.get\('email'\),\s*\};/,
    `const employee = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            role: formData.get('role'),
            salary: formData.get('salary') ? Number(formData.get('salary')) : 0,
            phone: formData.get('phone'),
            email: formData.get('email'),
          };`
);

// 10. Handle employee_payment submit
content = content.replace(
    /          if \(error\) throw error;\s*fetchEmployees\(\);\s*\}\s*else if \(activeModal === 'absence'\) \{/,
    `          if (error) throw error;
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
             motif: formData.get('motif') || \`Salaire \${monthText}\`,
             payment_method: formData.get('payment_method')
          };
          const { data, error } = await supabase.from('employee_payments').insert([{...payment, school_id: currentSchoolId}]).select().single();
          if (error) throw error;
          fetchEmployeePayments();
          setSelectedInvoice(data);
          setActiveModal('employee_payment_preview');
          return; // prevent modal close
        }
        else if (activeModal === 'absence') {`
);

// Convert line endings back
content = content.replace(/\n/g, '\r\n');

// Save
fs.writeFileSync(appPath, content);
console.log('App.tsx patched Regex correctly.');
