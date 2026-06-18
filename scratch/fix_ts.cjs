const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

code = code.replace(".split(',').map((s) => s.trim())", ".split(',').map((s: string) => s.trim())");
code = code.replace("const input = document.getElementById('customSubjectInput');", "const input = document.getElementById('customSubjectInput') as HTMLInputElement;");

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed TS errors');
