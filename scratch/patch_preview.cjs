const fs = require('fs');
let c = fs.readFileSync('src/App.tsx', 'utf8');
const searchString = "{activeModal === 'receipt_preview' && (";
const replacementString = `{activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                  <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
              )}
              {activeModal === 'teacher_payment_preview' && selectedInvoice && editEntity && (
                  <TeacherReceiptPreview payment={selectedInvoice} teacher={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
              )}
              {activeModal === 'receipt_preview' && (`;
c = c.replace(searchString, replacementString);
fs.writeFileSync('src/App.tsx', c);
