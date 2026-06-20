const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `                     <td>
                       <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { 
setEditEntity(pay.employees); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>
                         <Icons.FileText /> Reçu
                       </button>
                     </td>`;

const replacementStr = `                     <td>
                       <button type="button" className="btn btn-outline" style={{padding: '4px 8px'}} onClick={(e) => { 
                         e.preventDefault();
                         e.stopPropagation();
                         setEditEntity(pay.employees || {}); 
                         setSelectedInvoice(pay); 
                         setActiveModal('employee_payment_preview'); 
                       }}>
                         <Icons.FileText /> Reçu
                       </button>
                     </td>`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replacementStr);
  fs.writeFileSync(appPath, content);
  console.log("Successfully replaced button");
} else {
  console.log("Target string not found. Please check manually.");
}
