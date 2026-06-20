const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const regex = /else\s+if\s*\(\s*activeModal\s*===\s*'absence'\s*\)/;

const replacement = `else if (activeModal === 'employee_payment') {
          const payment = {
            employee_id: editEntity.id,
            amount: Number(formData.get('amount')) || 0,
            month: formData.get('month'),
            motif: formData.get('motif'),
            payment_method: formData.get('payment_method'),
            school_id: currentSchoolId
          };

          if (payment.amount <= 0) {
            alert("Erreur: Le montant doit être supérieur à 0.");
            return;
          }

          const { data, error } = await supabase.from('employee_payments').insert([payment]).select('*, employees(*)').single();
          if (error) throw error;
          
          fetchEmployeePayments();
          setSelectedInvoice(data);
          setActiveModal('salary_receipt_preview');
          return;
        }
        else if (activeModal === 'absence')`;

if (regex.test(content)) {
    content = content.replace(regex, replacement);
    fs.writeFileSync(appPath, content);
    console.log("Patched employee_payment successfully.");
} else {
    console.error("Could not find activeModal === 'absence' block!");
}
