const fs = require('fs');
const appPath = 'src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add teacherPaymentsData state
if (!content.includes('const [teacherPaymentsData, setTeacherPaymentsData] = useState')) {
  content = content.replace(
    /const \[teachersData, setTeachersData\] = useState<any\[\]>\(\[\]\);/,
    `const [teachersData, setTeachersData] = useState<any[]>([]);\n  const [teacherPaymentsData, setTeacherPaymentsData] = useState<any[]>([]);`
  );
}

// 2. Add fetchTeacherPayments
if (!content.includes('const fetchTeacherPayments = async () => {')) {
  content = content.replace(
    /const fetchTeachers = async \(\) => {[\s\S]*?};/,
    `const fetchTeachers = async () => {\n      const { data } = await supabase.from('teachers').select('*').eq('school_id', currentSchoolId);\n      if (data) setTeachersData(data);\n    };\n    const fetchTeacherPayments = async () => {\n      const { data } = await supabase.from('teacher_payments').select('*, teachers(*)').eq('school_id', currentSchoolId).order('payment_date', { ascending: false });\n      if (data) setTeacherPaymentsData(data);\n    };`
  );
}

// 3. Call fetchTeacherPayments
if (!content.includes('fetchTeacherPayments();') && content.includes('fetchTeachers();')) {
  content = content.replace(
    /fetchTeachers\(\);/,
    `fetchTeachers();\n        fetchTeacherPayments();`
  );
}

// 4. Update renderTeachers list with 'Payer' button and 'Derniers Salaires' table
if (!content.includes('onClick={() => { setEditEntity(row); setActiveModal(\'teacher_payment\'); }}')) {
  content = content.replace(
    /<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} title="Modifier" onClick={\(\) => { setEditEntity\(row\); setActiveModal\('teacher'\); }}>✏️<\/button>/,
    `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} title="Modifier" onClick={() => { setEditEntity(row); setActiveModal('teacher'); }}>✏️</button>\n                  <button type="button" className="btn btn-primary" style={{padding: '6px 12px', marginRight: '8px', fontSize: '0.8rem'}} title="Payer" onClick={() => { setEditEntity(row); setActiveModal('teacher_payment'); }}>Payer</button>`
  );
  
  // Also add salary to the list displaying for teacher
  // First, find the header row
  content = content.replace(
    /<th style={{padding: '12px 0', fontWeight: 500}}>{t\('admin\.teachers\.col_matricule', 'Matricule'\)}<\/th>/,
    `<th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.teachers.col_matricule', 'Matricule')}</th>\n              <th style={{padding: '12px 0', fontWeight: 500}}>Salaire</th>`
  );
  
  // Then the cell
  content = content.replace(
    /<td style={{padding: '16px 0', fontWeight: '500'}}>{row\.matricule \|\| '-'}<\/td>/,
    `<td style={{padding: '16px 0', fontWeight: '500'}}>{row.matricule || '-'}</td>\n                <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--accent-color)'}}>{formatNum(row.salary || 0)} FCFA</td>`
  );
}

// 5. Add the 'Derniers Salaires Payés' table below the main teachers table
if (!content.includes('Derniers Salaires des Enseignants')) {
  const tableReplacement = `        </table>
      </div>
      
      <div className="panel delay-200" style={{marginTop: '20px'}}>
         <div className="panel-header">
           <h3 className="panel-title">Derniers Salaires des Enseignants</h3>
         </div>
         <div className="table-responsive">
           <table className="table">
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Enseignant</th>
                 <th>Mois</th>
                 <th>Montant</th>
                 <th>Moyen</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {teacherPaymentsData && teacherPaymentsData.slice(0, 10).map((pay: any, idx: number) => (
                 <tr key={pay.id || idx}>
                   <td>{new Date(pay.payment_date).toLocaleDateString('fr-FR')}</td>
                   <td>{pay.teachers?.first_name} {pay.teachers?.last_name}</td>
                   <td>{pay.month}</td>
                   <td style={{fontWeight: 'bold', color: 'var(--accent-color)'}}>{formatNum(pay.amount)} FCFA</td>
                   <td>{pay.payment_method}</td>
                   <td>
                     <button type="button" className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { setEditEntity(pay.teachers); setSelectedInvoice(pay); setActiveModal('teacher_payment_preview'); }}>
                       <Icons.FileText /> Reçu
                     </button>
                   </td>
                 </tr>
               ))}
               {(!teacherPaymentsData || teacherPaymentsData.length === 0) && (
                 <tr>
                   <td colSpan={6} style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Aucun paiement enregistré</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>`;
  content = content.replace(/<\/table>\s*<\/div>\s*<\/div>\s*\);\s*const renderParents/m, tableReplacement + '\n    </div>\n  );\n\n  const renderParents');
}

// 6. Update Modals: Add 'teacher_payment' form
if (!content.includes('activeModal === \'teacher_payment\'')) {
  const teacherPaymentModal = `                {activeModal === 'teacher_payment' && editEntity && (
                    <div className="form-grid">
                      <div className="form-group" style={{gridColumn: '1 / -1'}}>
                        <label>Enseignant</label>
                        <input type="text" className="form-input" disabled value={editEntity.first_name + ' ' + editEntity.last_name + ' (' + (editEntity.subject || 'Aucune matière') + ')'} />
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
                )}`;
  content = content.replace(/\{activeModal === 'teacher' && \(/, teacherPaymentModal + '\n                {activeModal === \'teacher\' && (');
}

// 7. Add salary field to 'teacher' modal
if (!content.includes('<label>Salaire (FCFA)</label>')) {
  content = content.replace(
    /<div className="form-group">\s*<label>{t\('admin.modals.password', 'Mot de passe'\)}<\/label>/,
    `<div className="form-group">
                        <label>Salaire Mensuel (FCFA)</label>
                        <input type="number" name="salary" className="form-input" defaultValue={editEntity?.salary || 0} />
                      </div>
                      <div className="form-group">
                        <label>{t('admin.modals.password', 'Mot de passe')}</label>`
  );
}

// 8. Add teacher_payment_preview component outside modal body
if (!content.includes('<TeacherReceiptPreview')) {
  content = content.replace(
    /\{activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && \(\s*<SalaryReceiptPreview[^>]+>\s*\)\}/,
    `{activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                    <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
                )}
                {activeModal === 'teacher_payment_preview' && selectedInvoice && editEntity && (
                    <TeacherReceiptPreview payment={selectedInvoice} teacher={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
                )}`
  );
}

// 9. Update modal header logic
if (!content.includes('activeModal === \'teacher_payment\' && "Payer Enseignant"')) {
  content = content.replace(
    /\{activeModal === 'employee_payment_preview' && "Reçu de Salaire"\}/,
    `{activeModal === 'employee_payment_preview' && "Reçu de Salaire"}
                  {activeModal === 'teacher_payment' && "Payer Enseignant"}
                  {activeModal === 'teacher_payment_preview' && "Reçu de Salaire Enseignant"}`
  );
}

// 10. Hide close button logic for teacher preview
if (!content.includes('\'teacher_payment_preview\'].includes(activeModal)')) {
  content = content.replace(
    /'employee_payment_preview'\].includes\(activeModal\)/,
    `'employee_payment_preview', 'teacher_payment_preview'].includes(activeModal)`
  );
}

// 11. Import TeacherReceiptPreview
if (!content.includes('TeacherReceiptPreview')) {
  content = content.replace(
    /import \{ SalaryReceiptPreview \} from '\.\/components\/SalaryReceiptPreview';/,
    `import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';\nimport { TeacherReceiptPreview } from './components/TeacherReceiptPreview';`
  );
}

fs.writeFileSync(appPath, content);
console.log('App.tsx patched for teacher payments!');
