const fs = require('fs');
const path = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(path, 'utf8');

// 1. Add import
if (!content.includes('SalaryReceiptPreview')) {
    content = content.replace(
        "import { BulletinPreview } from './components/BulletinPreview';",
        "import { BulletinPreview } from './components/BulletinPreview';\nimport { SalaryReceiptPreview } from './components/SalaryReceiptPreview';"
    );
}

// 2. Add Title
if (!content.includes('employee_payment_preview\' && "Reçu de Paiement Salaire"')) {
    content = content.replace(
        "{activeModal === 'receipt_preview' && \"Reçu de Paiement\"}",
        "{activeModal === 'receipt_preview' && \"Reçu de Paiement\"}\n                  {activeModal === 'employee_payment_preview' && \"Reçu de Paiement Salaire\"}"
    );
}

// 3. Add Component body
if (!content.includes('activeModal === \'employee_payment_preview\' && selectedInvoice && editEntity')) {
    content = content.replace(
        "{activeModal === 'receipt_preview' && (",
        `{activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (
                <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />
              )}
              {activeModal === 'receipt_preview' && (`
    );
}

// 4. Update button
const oldButton = `                    <td>
                      <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { setEditEntity(pay.employees); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>
                        <Icons.FileText /> Reçu
                      </button>
                    </td>`;
const newButton = `                    <td>
                      <button type="button" className="btn btn-outline" style={{padding: '4px 8px'}} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditEntity(pay.employees || {}); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>
                        <Icons.FileText /> Reçu
                      </button>
                    </td>`;

if (content.includes(oldButton)) {
    content = content.replace(oldButton, newButton);
} else {
    // maybe it has the old version with single quotes or different spacing
    // we can use regex to find and replace the button inside renderEmployeePaymentsTab
    content = content.replace(
        /<button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={\(\) => { setEditEntity\(pay\.employees\); setSelectedInvoice\(pay\); setActiveModal\('employee_payment_preview'\); }}>/g,
        `<button type="button" className="btn btn-outline" style={{padding: '4px 8px'}} onClick={(e) => { e.preventDefault(); e.stopPropagation(); setEditEntity(pay.employees || {}); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>`
    );
}

fs.writeFileSync(path, content);
console.log("Restored all changes to App.tsx successfully!");
