const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(mainFile, 'utf8');

const targetSpan = `<span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{settingsData?.school_name || 'SGES Pro'}</span>`;
const newSpan = `<span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'Établissement'}</span>`;

const targetDiv = `<div className="logo-icon">S</div>`;
const newDiv = `<div className="logo-icon">{(adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'É').charAt(0).toUpperCase()}</div>`;

if (content.includes(targetSpan)) {
  content = content.replace(targetSpan, newSpan);
} else {
  console.log("Could not find target span");
}

if (content.includes(targetDiv)) {
  content = content.replace(targetDiv, newDiv);
} else {
  console.log("Could not find target div");
}

fs.writeFileSync(mainFile, content);
console.log("Logo updated successfully!");
