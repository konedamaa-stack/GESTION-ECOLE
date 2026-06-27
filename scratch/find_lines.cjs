const fs = require('fs');
const content = fs.readFileSync('c:/Users/koned/Mon Drive/SaaS/ETABLISEMENT/src/App.tsx', 'utf8');
const lines = content.split('\n');

const searchTerms = [
  'const handleFormSubmit',
  'activeModal === \'student\'',
  'studentsData.filter',
  'studentsData.map',
  'className="data-table"'
];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  searchTerms.forEach(term => {
    if (line.includes(term)) {
      console.log(`[${term}] Line ${i + 1}: ${line.trim().substring(0, 100)}`);
    }
  });
}
