const fs = require('fs');
const content = fs.readFileSync('src/App.tsx', 'utf8');
const match = content.match(/return\s*\(\s*<div[^>]*>[\s\S]{0,1000}/);
if (match) {
  console.log(match[0]);
} else {
  console.log("Not found");
}
