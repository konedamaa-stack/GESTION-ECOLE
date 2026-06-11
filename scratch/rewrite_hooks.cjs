const fs = require('fs');
const path = require('path');

let appTsx = fs.readFileSync(path.join(__dirname, '../src/App.tsx'), 'utf8');

// remove currentSchoolId useState
appTsx = appTsx.replace(/const \[currentSchoolId, setCurrentSchoolId\] = useState<string \| null>\(null\);\n/, '');
// remove adminSchools useState
appTsx = appTsx.replace(/const \[adminSchools, setAdminSchools\] = useState<\{id: string, name: string\}\[\]>\(\[\]\);\n/, '');
// remove currentSchoolId from localstorage
appTsx = appTsx.replace(/useEffect\(\(\) => \{\n\s*if \(currentSchoolId\) localStorage.setItem\('sges_school_id', currentSchoolId\);\n\s*\}, \[currentSchoolId\]\);\n/, '');

// replace getSchoolId logic
const schoolLogicRegex = /useEffect\(\(\) => \{\n\s*if \(session\) \{\n\s*const getSchoolId = async \(\) => \{[\s\S]*?\}\n\s*\}, \[session\]\);/m;

appTsx = appTsx.replace(schoolLogicRegex, `useEffect(() => {\n    if (session) {\n      setCurrentSchoolPlan('Standard');\n    }\n  }, [session]);`);

// replace fetch calls taking schoolId: string
appTsx = appTsx.replace(/\(schoolId: string\) =>/g, '() =>');
appTsx = appTsx.replace(/fetchStudents\(currentSchoolId\)/g, 'fetchStudents()');
appTsx = appTsx.replace(/fetchClasses\(currentSchoolId\)/g, 'fetchClasses()');
appTsx = appTsx.replace(/fetchTeachers\(currentSchoolId\)/g, 'fetchTeachers()');
appTsx = appTsx.replace(/fetchEmployees\(currentSchoolId\)/g, 'fetchEmployees()');
appTsx = appTsx.replace(/fetchInvoices\(currentSchoolId\)/g, 'fetchInvoices()');
appTsx = appTsx.replace(/fetchAbsences\(currentSchoolId\)/g, 'fetchAbsences()');
appTsx = appTsx.replace(/fetchSchedules\(currentSchoolId\)/g, 'fetchSchedules()');
appTsx = appTsx.replace(/fetchEvaluations\(currentSchoolId\)/g, 'fetchEvaluations()');
appTsx = appTsx.replace(/fetchSettings\(currentSchoolId\)/g, 'fetchSettings()');

// replace useEffect calling fetches
const fetchEffectRegex = /useEffect\(\(\) => \{\n\s*if \(session && currentSchoolId\) \{[\s\S]*?\}\n\s*\}, \[session, currentSchoolId\]\);/m;
appTsx = appTsx.replace(fetchEffectRegex, `useEffect(() => {\n    if (session) {\n      fetchStudents();\n      fetchClasses();\n      fetchTeachers();\n      fetchEmployees();\n      fetchInvoices();\n      fetchAbsences();\n      fetchSchedules();\n      fetchEvaluations();\n      fetchSettings();\n    }\n  }, [session]);`);

fs.writeFileSync(path.join(__dirname, '../src/App.tsx'), appTsx);
