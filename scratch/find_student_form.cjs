const fs = require('fs');

const appTsx = fs.readFileSync('c:/Users/koned/Mon Drive/SaaS/ETABLISEMENT/src/App.tsx', 'utf8');
const lines = appTsx.split('\n');

for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('saveStudent') || lines[i].includes('addStudent') || lines[i].includes('const handleSaveStudent') || lines[i].includes('submit')) {
    console.log(`Line ${i + 1}: ${lines[i].trim()}`);
  }
}
