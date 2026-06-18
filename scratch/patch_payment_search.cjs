const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');
let changed = false;

// 1. Update fetchStudents to include parents
const findFetch = `const fetchStudents = async () => {
    const { data } = await supabase.from('students').select(\`*, classes ( name )\`).eq('school_id', currentSchoolId);
    if (data) setStudentsData(data);
  };`;

if (content.includes(findFetch)) {
    const replaceFetch = `const fetchStudents = async () => {
    const { data } = await supabase.from('students').select(\`*, classes ( name ), student_parents(parents(first_name, last_name))\`).eq('school_id', currentSchoolId);
    if (data) setStudentsData(data);
  };`;
    content = content.replace(findFetch, replaceFetch);
    changed = true;
    console.log("Updated fetchStudents");
}

// 2. Replace the payment form select with a searchable datalist
const findSelect = `<label>{t('admin.modals.student_select', 'Élève')}</label>
                    <select name="student_id" className="form-select" required defaultValue={preselectedStudentId || ""}>
                      <option value="">Sélectionner un élève...</option>
                      {studentsData.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>`;

const replaceSelect = `<label>{t('admin.modals.student_select', 'Élève')}</label>
                    <input 
                      type="text" 
                      list="payment-students" 
                      className="form-input" 
                      placeholder="Rechercher matricule, élève ou parent..." 
                      required
                      defaultValue={
                        preselectedStudentId 
                          ? (() => {
                              const s = studentsData.find(st => st.id === preselectedStudentId);
                              if (!s) return "";
                              const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? \` - Parent: \${s.student_parents[0].parents.first_name} \${s.student_parents[0].parents.last_name}\` : '';
                              return \`\${s.first_name} \${s.last_name} (\${s.matricule})\${parentStr}\`;
                            })()
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = studentsData.find(s => {
                          const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? \` - Parent: \${s.student_parents[0].parents.first_name} \${s.student_parents[0].parents.last_name}\` : '';
                          return \`\${s.first_name} \${s.last_name} (\${s.matricule})\${parentStr}\` === val;
                        });
                        if (match) {
                           e.target.setCustomValidity('');
                           const hiddenInput = document.getElementById('hidden_student_id');
                           if(hiddenInput) hiddenInput.value = match.id;
                        } else {
                           e.target.setCustomValidity('Veuillez sélectionner un élève dans la liste');
                           const hiddenInput = document.getElementById('hidden_student_id');
                           if(hiddenInput) hiddenInput.value = '';
                        }
                      }}
                    />
                    <datalist id="payment-students">
                      {studentsData.map(s => {
                        const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? \` - Parent: \${s.student_parents[0].parents.first_name} \${s.student_parents[0].parents.last_name}\` : '';
                        return <option key={s.id} value={\`\${s.first_name} \${s.last_name} (\${s.matricule})\${parentStr}\`} />;
                      })}
                    </datalist>
                    <input type="hidden" name="student_id" id="hidden_student_id" defaultValue={preselectedStudentId || ""} required />`;

if (content.includes(findSelect)) {
    content = content.replace(findSelect, replaceSelect);
    changed = true;
    console.log("Replaced select with datalist");
} else {
    console.log("Could not find the select element. Let's do a more robust replacement.");
    // try a regex or partial match
}

if (changed) {
    fs.writeFileSync(targetFile, content);
    console.log("App.tsx saved!");
} else {
    console.log("Nothing changed");
}
