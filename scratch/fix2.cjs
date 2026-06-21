const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const targetStr = `(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -`;
const replacementStr = `(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -`;
code = code.split(targetStr).join(replacementStr);

const empruntsRegex = /[ \t]*\{\/\* EMPRUNTS SECTION \*\/\}.*?\{\/\* END EMPRUNTS SECTION \*\/\}\r?\n/s;
const empruntsMatch = code.match(empruntsRegex);

if (empruntsMatch) {
  const empruntsBlock = empruntsMatch[0];
  code = code.replace(empruntsBlock, '');
  
  const dashEndRegex = /[ \t]*<\/div>\r?\n\r?\n[ \t]*<div className="panel delay-200">\r?\n[ \t]*<h3 className="panel-title">\{t\('admin\.expenses\.list'/;
  const dashEndMatch = code.match(dashEndRegex);
  
  if (dashEndMatch) {
    const insertIndex = dashEndMatch.index;
    code = code.slice(0, insertIndex) + empruntsBlock + '\n' + code.slice(insertIndex);
    console.log("Reordered successfully.");
  } else {
    console.log("Could not find insertion point!");
  }
} else {
  console.log("Could not find EMPRUNTS SECTION!");
}

fs.writeFileSync('src/App.tsx', code);
