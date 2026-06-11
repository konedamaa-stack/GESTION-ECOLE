const fs = require('fs');
const path = require('path');

const mainFile = path.join(__dirname, '../src/main.tsx');
let mainContent = fs.readFileSync(mainFile, 'utf8');

if (!mainContent.includes("initCustomAlert")) {
  mainContent = mainContent.replace(
    "import App from './App.tsx'",
    "import App from './App.tsx'\nimport { CustomAlert, initCustomAlert } from './components/CustomAlert';"
  );
  
  mainContent = mainContent.replace(
    "import './index.css'",
    "import './index.css'\n\ninitCustomAlert();"
  );
}

if (!mainContent.includes("<CustomAlert />")) {
  mainContent = mainContent.replace(
    "<App />",
    "<App />\n    <CustomAlert />"
  );
}

fs.writeFileSync(mainFile, mainContent);
console.log("main.tsx patched successfully!");
