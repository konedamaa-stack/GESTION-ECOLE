const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add "Payer" button to renderTeachers actions
if (!code.includes("setActiveModal('teacher_payment')")) {
  code = code.replace(
    `<button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert(\`Identifiants pour \${row.first_name} \${row.last_name}:\\n\\nMatricule: \${row.matricule}\\nMot de passe: \${row.password}\`)}>{t('admin.teachers.btn_view_ids', 'Voir les identifiants')}</button>`,
    `<button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert(\`Identifiants pour \${row.first_name} \${row.last_name}:\\n\\nMatricule: \${row.matricule}\\nMot de passe: \${row.password}\`)}>{t('admin.teachers.btn_view_ids', 'Voir les identifiants')}</button>
                  <button className="btn btn-primary" style={{padding: '6px 12px', fontSize: '0.8rem', marginLeft: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('teacher_payment'); }}>💵 Payer</button>`
  );
}

// 2. Add handleTeacherPaymentSubmit
if (!code.includes('handleTeacherPaymentSubmit')) {
  code = code.replace(
    'const handleAddExpense = async (e: React.FormEvent) => {',
    `const handleTeacherPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;
    
    try {
      const { error } = await supabase.from('teacher_payments').insert([{
        school_id: currentSchoolId,
        teacher_id: editEntity.id,
        amount: parseFloat(amount),
        month,
        payment_method,
        payment_date: new Date().toISOString()
      }]);
      if (error) throw error;
      await fetchTeacherPayments();
      // Auto close and open receipt preview
      setActiveModal('teacher_receipt_preview');
    } catch(err: any) {
      console.error('Error paying teacher:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {`
  );
}

// 3. Add the Modal for teacher_payment
if (!code.includes(`activeModal === 'teacher_payment'`)) {
  code = code.replace(
    `{activeModal === 'expense' && (`,
    `{activeModal === 'teacher_payment' && editEntity && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payer {editEntity.first_name} {editEntity.last_name}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleTeacherPaymentSubmit} className="modal-body">
              <div className="form-group">
                <label>Montant (FCFA)</label>
                <input type="number" name="amount" className="form-control" required defaultValue={editEntity.salary || 0} />
              </div>
              <div className="form-group">
                <label>Mois (ex: Septembre 2026)</label>
                <input type="text" name="month" className="form-control" required placeholder="Septembre 2026" />
              </div>
              <div className="form-group">
                <label>Méthode de paiement</label>
                <select name="payment_method" className="form-select">
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer le paiement</button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'expense' && (`
  );
}

// 4. Update the receipt logic to use teacherReceiptPreview
// First let's inject TeacherReceiptPreview.tsx into the top of App.tsx
if (!code.includes('TeacherReceiptPreview')) {
  code = code.replace(
    `import { ReceiptPreview } from './components/ReceiptPreview';`,
    `import { ReceiptPreview } from './components/ReceiptPreview';\nimport { TeacherReceiptPreview } from './components/TeacherReceiptPreview';`
  );
}

if (!code.includes(`activeModal === 'teacher_receipt_preview'`)) {
  code = code.replace(
    `{activeModal === 'receipt_preview' && (`,
    `{activeModal === 'teacher_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu (Professeur)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              {teacherPaymentsData.filter(p => p.teacher_id === editEntity.id).length > 0 && (
                <TeacherReceiptPreview 
                  payment={teacherPaymentsData.filter(p => p.teacher_id === editEntity.id)[0]} 
                  teacher={editEntity} 
                  schoolInfo={settingsData} 
                />
              )}
            </div>
          </div>
        )}

        {activeModal === 'receipt_preview' && (`
  );
}

fs.writeFileSync(filePath, code);
console.log("App.tsx Teacher Payment patched successfully.");
