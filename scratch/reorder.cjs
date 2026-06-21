const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const empruntsStart = code.indexOf('      {/* EMPRUNTS SECTION */}');
const empruntsEnd = code.indexOf('      {/* END EMPRUNTS SECTION */}\n') + '      {/* END EMPRUNTS SECTION */}\n'.length;

const empruntsBlock = code.slice(empruntsStart, empruntsEnd);

const dashEndStr = '      </div>\n\n      <div className="panel delay-200">\n        <h3 className="panel-title">{t(\'admin.expenses.list\'';

// Remove empruntsBlock from its current position
let newCode = code.slice(0, empruntsStart) + code.slice(empruntsEnd);

// Find the insertion point in the new code
const newDashEnd = newCode.indexOf(dashEndStr);

// Insert the emprunts block
newCode = newCode.slice(0, newDashEnd) + empruntsBlock + newCode.slice(newDashEnd);

fs.writeFileSync('src/App.tsx', newCode);
console.log("Reordered sections successfully.");
