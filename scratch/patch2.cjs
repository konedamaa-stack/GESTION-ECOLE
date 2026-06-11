const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Simple replacements
content = content.replace(/\.insert\(\[student\]\)/g, ".insert([{...student, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[parent\]\)/g, ".insert([{...parent, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[teacher\]\)/g, ".insert([{...teacher, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[employee\]\)/g, ".insert([{...employee, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[absence\]\)/g, ".insert([{...absence, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[schedule\]\)/g, ".insert([{...schedule, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[evaluation\]\)/g, ".insert([{...evaluation, school_id: currentSchoolId}])");
content = content.replace(/\.insert\(\[invoice\]\)/g, ".insert([{...invoice, school_id: currentSchoolId}])");

// For classes
content = content.replace(/level: classLevel \|\| 'Non défini',/g, "level: classLevel || 'Non défini', school_id: currentSchoolId,");

// For student documents
content = content.replace(/type: fileType\r?\n\s+\}\]\)/g, "type: fileType,\n        school_id: currentSchoolId\n      }])");

// For alert
content = content.replace(/alert\("Erreur lors de la création de l'établissement: " \+ error\.message\);/g, "alert(\"Erreur: \" + error.message);");

fs.writeFileSync(appPath, content);
console.log("App.tsx patched successfully.");
