const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/index.css');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize newlines
content = content.replace(/\r\n/g, '\n');

// Update visibility
const findVisibility = `.bulletins-container, .bulletins-container * {
    visibility: visible;
  }`;
const replaceVisibility = `.bulletins-container, .bulletins-container *,
  .bulletin-classic-container, .bulletin-classic-container * {
    visibility: visible;
  }`;

if (content.includes(findVisibility)) {
    content = content.replace(findVisibility, replaceVisibility);
    console.log("Updated visibility");
}

// Update absolute positioning to include bulletin-classic-container
const findPosition = `.bulletins-container {
    position: absolute;
    left: 0;
    top: 0;
    padding: 0;
    margin: 0;
    background: white;
  }`;
const replacePosition = `.bulletins-container, .bulletin-classic-container {
    position: absolute;
    left: 0;
    top: 0;
    padding: 0;
    margin: 0;
    background: white;
  }`;

if (content.includes(findPosition)) {
    content = content.replace(findPosition, replacePosition);
    console.log("Updated absolute positioning");
}

fs.writeFileSync(targetFile, content);
console.log("index.css saved!");
