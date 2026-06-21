const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -`;
const replacementStr = `(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -`;
code = code.split(targetStr).join(replacementStr);

const empruntsStart = code.indexOf('      {/* EMPRUNTS SECTION */}');
const empruntsEnd = code.indexOf('      {/* END EMPRUNTS SECTION */}\n') + '      {/* END EMPRUNTS SECTION */}\n'.length;

const empruntsBlock = code.slice(empruntsStart, empruntsEnd);

const dashEndStr = '      </div>\n\n      <div className="panel delay-200">\n        <h3 className="panel-title">{t(\'admin.expenses.list\'';

code = code.slice(0, empruntsStart) + code.slice(empruntsEnd);

const newDashEnd = code.indexOf(dashEndStr);
code = code.slice(0, newDashEnd) + empruntsBlock + code.slice(newDashEnd);

fs.writeFileSync('src/App.tsx', code);
console.log("Fixes applied successfully.");
