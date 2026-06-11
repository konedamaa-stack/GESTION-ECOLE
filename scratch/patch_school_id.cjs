const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// Replacements for insert statements
const replacements = [
  // Classes
  {
    search: "const { error } = await supabase.from('classes').insert([{ \n          name: className, \n          level: classLevel || 'Non défini',\n          }]);",
    replace: "const { error } = await supabase.from('classes').insert([{ \n          name: className, \n          level: classLevel || 'Non défini',\n          school_id: currentSchoolId\n          }]);"
  },
  // Students
  {
    search: "const { data: studentData, error: studentError } = await supabase.from('students').insert([student]).select();",
    replace: "const { data: studentData, error: studentError } = await supabase.from('students').insert([{...student, school_id: currentSchoolId}]).select();"
  },
  // Parents
  {
    search: "const { data: parentData, error: parentError } = await supabase.from('parents').insert([parent]).select();",
    replace: "const { data: parentData, error: parentError } = await supabase.from('parents').insert([{...parent, school_id: currentSchoolId}]).select();"
  },
  // Student Parents
  {
    search: "await supabase.from('student_parents').insert([{\n              student_id: studentData[0].id,\n              parent_id: parentData[0].id\n            }]);",
    replace: "await supabase.from('student_parents').insert([{\n              student_id: studentData[0].id,\n              parent_id: parentData[0].id\n            }]);"
  },
  // Invoices (student creation)
  {
    search: "await supabase.from('invoices').insert([invoice]);",
    replace: "await supabase.from('invoices').insert([{...invoice, school_id: currentSchoolId}]);"
  },
  // Teachers
  {
    search: "const { error } = await supabase.from('teachers').insert([teacher]);",
    replace: "const { error } = await supabase.from('teachers').insert([{...teacher, school_id: currentSchoolId}]);"
  },
  // Employees
  {
    search: "const { error } = await supabase.from('employees').insert([employee]);",
    replace: "const { error } = await supabase.from('employees').insert([{...employee, school_id: currentSchoolId}]);"
  },
  // Absences
  {
    search: "const { error } = await supabase.from('absences').insert([absence]);",
    replace: "const { error } = await supabase.from('absences').insert([{...absence, school_id: currentSchoolId}]);"
  },
  // Schedules
  {
    search: "const { error } = await supabase.from('schedules').insert([schedule]);",
    replace: "const { error } = await supabase.from('schedules').insert([{...schedule, school_id: currentSchoolId}]);"
  },
  // Evaluations
  {
    search: "const { error } = await supabase.from('evaluations').insert([evaluation]);",
    replace: "const { error } = await supabase.from('evaluations').insert([{...evaluation, school_id: currentSchoolId}]);"
  },
  // Student documents
  {
    search: "const { error: dbError } = await supabase.from('student_documents').insert([{\n        student_id: studentId,\n        title: title,\n        file_url: urlData.publicUrl,\n        type: fileType\n      }]);",
    replace: "const { error: dbError } = await supabase.from('student_documents').insert([{\n        student_id: studentId,\n        title: title,\n        file_url: urlData.publicUrl,\n        type: fileType,\n        school_id: currentSchoolId\n      }]);"
  },
  // Catch block error message
  {
    search: "alert(\"Erreur lors de la création de l'établissement: \" + error.message);",
    replace: "alert(\"Erreur: \" + error.message);"
  }
];

let changed = false;
for (const { search, replace } of replacements) {
  if (content.includes(search)) {
    content = content.replace(search, replace);
    changed = true;
  } else {
    console.log("Could not find:", search.substring(0, 50));
  }
}

// Special case: since invoices appear multiple times, replace all occurrences of `insert([invoice])`
content = content.replace(/await supabase\.from\('invoices'\)\.insert\(\[invoice\]\);/g, "await supabase.from('invoices').insert([{...invoice, school_id: currentSchoolId}]);");

if (changed) {
  fs.writeFileSync(appPath, content);
  console.log("App.tsx patched successfully.");
} else {
  console.log("No changes made. Check search strings.");
}
