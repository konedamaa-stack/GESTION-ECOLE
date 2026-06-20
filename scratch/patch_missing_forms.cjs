const fs = require('fs');
const appPath = 'src/App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add employee_payment modal UI
if (!content.includes('activeModal === \'employee_payment\' && editEntity')) {
  const employeePaymentModal = `                {activeModal === 'employee_payment' && editEntity && (
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
                )}`;
  content = content.replace(/\{activeModal === 'teacher_payment' && editEntity && \(/, employeePaymentModal + '\n                {activeModal === \'teacher_payment\' && editEntity && (');
}

// 2. Add header title for employee_payment
if (!content.includes('activeModal === \'employee_payment\' && "Payer Employé"')) {
  content = content.replace(
    /\{activeModal === 'teacher_payment' && "Payer Enseignant"\}/,
    `{activeModal === 'employee_payment' && "Payer Employé"}\n                  {activeModal === 'teacher_payment' && "Payer Enseignant"}`
  );
}

// 3. Add handleFormSubmit logic for both teacher_payment and employee_payment
if (!content.includes('activeModal === \'teacher_payment\'')) {
  const submitLogic = `      else if (activeModal === 'teacher_payment') {
        const payment = {
          teacher_id: editEntity.id,
          month: formData.get('month'),
          amount: Number(formData.get('amount')),
          payment_method: formData.get('payment_method'),
          motif: formData.get('motif') || \`Salaire \${formData.get('month')}\`,
          school_id: currentSchoolId
        };
        const { data: newPayment, error } = await supabase.from('teacher_payments').insert([payment]).select('*, teachers(*)');
        if (error) throw error;
        fetchTeacherPayments();
        
        if (newPayment && newPayment.length > 0) {
          setSelectedInvoice(newPayment[0]);
          setActiveModal('teacher_payment_preview');
          return;
        } else {
          alert("Paiement enregistré !");
          closeModal();
          return;
        }
      }
      else if (activeModal === 'employee_payment') {
        const payment = {
          employee_id: editEntity.id,
          month: formData.get('month'),
          amount: Number(formData.get('amount')),
          payment_method: formData.get('payment_method'),
          motif: formData.get('motif') || \`Salaire \${formData.get('month')}\`,
          school_id: currentSchoolId
        };
        const { data: newPayment, error } = await supabase.from('employee_payments').insert([payment]).select('*, employees(*)');
        if (error) throw error;
        fetchEmployeePayments();
        
        if (newPayment && newPayment.length > 0) {
          setSelectedInvoice(newPayment[0]);
          setActiveModal('employee_payment_preview');
          return;
        } else {
          alert("Paiement enregistré !");
          closeModal();
          return;
        }
      }`;

  content = content.replace(
    /else if \(activeModal === 'employee'\) \{/,
    submitLogic + '\n      else if (activeModal === \'employee\') {'
  );
}

fs.writeFileSync(appPath, content);
console.log('App.tsx missing forms and submit handlers patched!');
