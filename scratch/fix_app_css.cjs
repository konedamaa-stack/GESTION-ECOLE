const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'App.css');
const buf = fs.readFileSync(cssPath);

let content = '';
// The file might be corrupted with a mix of UTF-8 and UTF-16
// Let's just remove the last line `.table-responsive` since I appended it.
const contentStr = buf.toString('utf8');
const lines = contentStr.split('\n');

const validLines = [];
for (let line of lines) {
  if (line.includes('.table-responsive') || line.includes('\0')) {
    continue;
  }
  validLines.push(line);
}

fs.writeFileSync(cssPath, validLines.join('\n'), 'utf8');
console.log('Fixed App.css');
