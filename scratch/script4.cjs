const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// The first script actually tried to add fetchParents but it failed or put it in the wrong place.
// Let's explicitly inject fetchParents.
if (!content.includes('const fetchParents = async ()')) {
  content = content.replace(
    'const fetchTeachers = async () => {\n    const { data } = await supabase.from(\'teachers\').select(\'*\');\n    if (data) setTeachersData(data);\n  };',
    'const fetchTeachers = async () => {\n    const { data } = await supabase.from(\'teachers\').select(\'*\');\n    if (data) setTeachersData(data);\n  };\n  const fetchParents = async () => {\n    const { data } = await supabase.from(\'parents\').select(\'*\');\n    if (data) setParentsData(data);\n  };'
  );
}

if (!content.includes('fetchParents();')) {
  content = content.replace(
    'fetchTeachers();\n      fetchEmployees();',
    'fetchTeachers();\n      fetchEmployees();\n      fetchParents();'
  );
}

fs.writeFileSync(file, content);
console.log('Script 4 done');
