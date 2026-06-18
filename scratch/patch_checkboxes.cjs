const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/components/TeacherPortal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add state variable selectedStudents
const stateAnchor = `  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);`;
if (!content.includes('const [selectedStudents, setSelectedStudents] = useState<string[]>([]);')) {
  content = content.replace(stateAnchor, stateAnchor + `\n  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);`);
}

// 2. Reset selection on handleSelectEvaluation
const handleSelectAnchor = `    setSelectedEvaluation(ev);
    setSelectedClass(ev.class_id);`;
if (!content.includes('setSelectedStudents([]);')) {
  content = content.replace(handleSelectAnchor, handleSelectAnchor + `\n    setSelectedStudents([]);`);
}

// 3. Header checkbox replacement
const headerCheckboxAnchor = `<th style={{padding: '8px 4px', borderRight: '1px solid #d4d4d4', textAlign: 'center', fontWeight: 'bold'}}><input type="checkbox" /></th>`;
const headerCheckboxReplacement = `<th style={{padding: '8px 4px', borderRight: '1px solid #d4d4d4', textAlign: 'center', fontWeight: 'bold'}}>
                          <input 
                            type="checkbox" 
                            checked={studentsData.filter(s => s.class_id === selectedClass).length > 0 && selectedStudents.length === studentsData.filter(s => s.class_id === selectedClass).length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(studentsData.filter(s => s.class_id === selectedClass).map(s => s.id));
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                          />
                        </th>`;
content = content.replace(headerCheckboxAnchor, headerCheckboxReplacement);

// 4. Row checkbox replacement
const rowCheckboxAnchor = `<td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}><input type="checkbox" /></td>`;
const rowCheckboxReplacement = `<td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}>
                            <input 
                              type="checkbox" 
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(prev => [...prev, student.id]);
                                } else {
                                  setSelectedStudents(prev => prev.filter(id => id !== student.id));
                                }
                              }}
                            />
                          </td>`;
content = content.replace(rowCheckboxAnchor, rowCheckboxReplacement);

// 5. Footer text replacement
const footerAnchorStr = `{t('teacher.selected_count', "0 sur {{count}} sélectionné", {count: studentsData.filter(s => s.class_id === selectedClass).length})}`;
const footerReplacementStr = `{t('teacher.selected_count', "{{selected}} sur {{count}} sélectionné(s)", {selected: selectedStudents.length, count: studentsData.filter(s => s.class_id === selectedClass).length})}`;

if (content.includes(footerAnchorStr)) {
  content = content.replace(footerAnchorStr, footerReplacementStr);
}

fs.writeFileSync(targetFile, content);
console.log("TeacherPortal checkboxes patched successfully.");
