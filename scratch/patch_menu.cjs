const fs = require('fs');
const path = require('path');
const appPath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

if (!code.includes('Menu: () => <svg')) {
  code = code.replace(
    'const Icons = {',
    `const Icons = {
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,`
  );
  fs.writeFileSync(appPath, code);
  console.log('Added Icons.Menu');
}
