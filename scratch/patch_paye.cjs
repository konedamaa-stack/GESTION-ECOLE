const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

// The bug is that i.status === 'Payé' instead of 'Payée' or we can just use i.status.includes('Payé') or just check both.
// Let's replace 'Payé' with 'Payée' in the dashboard formulas.
code = code.replace(/i\.status === 'Payé'/g, "i.status === 'Payée'");

fs.writeFileSync(appPath, code);
console.log("App.tsx patched to fix Payé/Payée issue.");
