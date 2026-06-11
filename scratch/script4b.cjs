const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const regexFetch = /const fetchTeachers = async \(\) => \{[\s\S]*?setTeachersData\(data\);\s*\};/g;
if (!content.includes('const fetchParents =')) {
  content = content.replace(regexFetch, (match) => {
    return match + `\n  const fetchParents = async () => {\n    const { data } = await supabase.from('parents').select('*');\n    if (data) setParentsData(data);\n  };`;
  });
}

const regexCall = /fetchTeachers\(\);\s*fetchEmployees\(\);/g;
if (!content.includes('fetchParents();')) {
  content = content.replace(regexCall, (match) => {
    return match + '\n      fetchParents();';
  });
}

fs.writeFileSync(file, content);
console.log('Script 4b done');
