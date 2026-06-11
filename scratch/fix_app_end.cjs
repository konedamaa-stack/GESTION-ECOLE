const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const endOfFileIndex = content.lastIndexOf('export default App;');
if (endOfFileIndex !== -1) {
  content = content.substring(0, endOfFileIndex).trim();
  
  // Make sure we end with a proper closing div
  if (!content.endsWith('</div>')) {
    content += '\n    </div>';
  }
  content += '\n  );\n}\n\nexport default App;\n';
  fs.writeFileSync(file, content);
  console.log('Fixed end of file');
}
