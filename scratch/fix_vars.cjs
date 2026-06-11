const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 129, 130
content = content.replace("  useEffect(() => {\n    if (currentSchoolId) localStorage.setItem('sges_school_id', currentSchoolId);\n  }, [currentSchoolId]);\n", "");

// 139
content = content.replace("if (session && currentSchoolId) {", "if (session) {");
content = content.replace("}, [session, currentSchoolId]);", "}, [session]);");

// 201
content = content.replace("if (!currentSchoolId) return;", "");

// 412
content = content.replace("if (!selectedStudent || !currentSchoolId) return;", "if (!selectedStudent) return;");

// 1706-1709
content = content.replace(
  "const { error } = await supabase.from('schools').update({ subscription_plan: 'Standard' }).eq('id', currentSchoolId);\n                      if (!error) {\n                        setCurrentSchoolPlan('Standard');\n                        setAdminSchools(adminSchools.map(s => s.id === currentSchoolId ? {...s, plan: 'Standard'} : s));\n                      }",
  "setCurrentSchoolPlan('Standard');"
);

// 1734-1737
content = content.replace(
  "const { error } = await supabase.from('schools').update({ subscription_plan: 'Pro' }).eq('id', currentSchoolId);\n                      if (!error) {\n                        setCurrentSchoolPlan('Pro');\n                        setAdminSchools(adminSchools.map(s => s.id === currentSchoolId ? {...s, plan: 'Pro'} : s));",
  "setCurrentSchoolPlan('Pro');"
);

// 1771
content = content.replace(
  "<div className=\"logo-icon\">{adminSchools.find(s => s.id === currentSchoolId)?.name?.charAt(0) || 'S'}</div>",
  "<div className=\"logo-icon\">S</div>"
);

fs.writeFileSync(file, content);
console.log('Variables fixed');
