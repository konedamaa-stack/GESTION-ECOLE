const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const targetToRemove = `                {activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                   <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
                )}`;

if (content.includes(targetToRemove)) {
    content = content.replace(targetToRemove, '');
    console.log("Removed from old location");
} else {
    console.log("Target to remove not found");
}

const targetToAdd = `                {/* Bulletin Form */}`;
const toInsert = `                {activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                   <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
                )}
                
`;

content = content.replace(targetToAdd, toInsert + targetToAdd);

fs.writeFileSync(appPath, content);
console.log("Moved employee_payment_preview to top level of modal-body");
