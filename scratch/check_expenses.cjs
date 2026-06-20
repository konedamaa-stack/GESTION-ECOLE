const fs = require('fs');
const code = fs.readFileSync('src/App.tsx', 'utf8');

console.log('Has renderDepenses:', code.includes('const renderDepenses'));
console.log('Has Dépenses tab text:', code.includes('Dépenses'));
console.log('Has activeTab depenses:', code.includes("activeTab === 'depenses'"));
console.log('Has activeModal expense:', code.includes("activeModal === 'expense'"));
