const fs = require('fs');
const path = require('path');
let appTsx = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');

// remove <div className="school-selector"> ... </div>
const selectorStart = appTsx.indexOf('<div className="school-selector"');
if (selectorStart !== -1) {
  const selectorEnd = appTsx.indexOf('</div>', selectorStart);
  if (selectorEnd !== -1) {
    appTsx = appTsx.substring(0, selectorStart) + appTsx.substring(selectorEnd + 6);
  }
}

// remove newSchool modal
const modalStart = appTsx.indexOf("{activeModal === 'newSchool' && (");
if (modalStart !== -1) {
  let depth = 0;
  let i = modalStart;
  let started = false;
  for (; i < appTsx.length; i++) {
    if (appTsx[i] === '(') { depth++; started = true; }
    else if (appTsx[i] === ')') { depth--; }
    
    if (started && depth === 0) {
      appTsx = appTsx.substring(0, modalStart) + appTsx.substring(i + 1);
      break;
    }
  }
}

// Remove formSubmit block for newSchool
const formStart = appTsx.indexOf("if (activeModal === 'newSchool') {");
if (formStart !== -1) {
  const formEnd = appTsx.indexOf("return;\n    }", formStart);
  if (formEnd !== -1) {
    appTsx = appTsx.substring(0, formStart) + appTsx.substring(formEnd + 14);
  }
}

fs.writeFileSync(path.join(__dirname, '../src/App.tsx'), appTsx);
