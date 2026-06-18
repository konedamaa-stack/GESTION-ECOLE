const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/components/TeacherPortal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Add state variable for teacherSchedules
const stateAnchor = `  const [gradesData, setGradesData] = useState<any[]>([]);`;
if (!content.includes('const [teacherSchedules, setTeacherSchedules] = useState<any[]>([])')) {
  content = content.replace(stateAnchor, stateAnchor + `\n  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);`);
}

// 2. Add fetch logic for teacherSchedules
const fetchAnchor = `    // Fetch grades
    const { data: grades } = await supabase.from('grades').select('*').eq('school_id', session.school_id);
    if (grades) setGradesData(grades);`;
if (!content.includes(`const { data: schedules } = await supabase.from('schedules')`)) {
  const fetchSchedules = `
    // Fetch schedules for this teacher
    const { data: schedules } = await supabase.from('schedules').select('*').eq('teacher_id', session.id);
    if (schedules) setTeacherSchedules(schedules);`;
  content = content.replace(fetchAnchor, fetchAnchor + fetchSchedules);
}

// 3. Add tab to nav links
const navLinksAnchor = `<button className={\`portal-nav-link \${activeTab === 'evaluations' ? 'active' : ''}\`} onClick={() => setActiveTab('evaluations')}>{t('teacher.tab_evaluations', "Mes Évaluations")}</button>`;
if (!content.includes(`setActiveTab('students')`)) {
  const navTab = `\n          <button className={\`portal-nav-link \${activeTab === 'students' ? 'active' : ''}\`} onClick={() => setActiveTab('students')}>{t('teacher.tab_students', "Mes Élèves")}</button>`;
  content = content.replace(navLinksAnchor, navLinksAnchor + navTab);
}

// 4. Add the students tab content right before the end of portal-content
// Wait, replacing before `      </div>\n    </div>\n  );\n}` might be tricky if there's multiple matching lines.
// Let's use `        )}` at the end of the evaluations tab content.
const evaluationsEndAnchor = `        )}
      </div>
    </div>
  );
}`;

const studentsTabContent = `        )}
        {activeTab === 'students' && (
          <div className="animate-fade-in">
            <div className="panel" style={{marginBottom: '20px', display: 'flex', gap: '24px', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e0e0e0'}}>
              <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px'}}>{t('teacher.select_class', "Sélectionner une classe :")}</label>
                <select 
                  className="form-input" 
                  style={{width: '100%', maxWidth: '400px'}}
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="" disabled>{t('teacher.choose_class', "-- Choisir une classe --")}</option>
                  {classesData.filter(c => teacherSchedules.some(s => s.class_id === c.id) || evaluationsData.some(ev => ev.class_id === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass ? (
              <div style={{background: '#fff', border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', fontSize: '13px', fontFamily: 'Arial, sans-serif'}}>
                <div style={{padding: '16px', borderBottom: '1px solid #eee', background: '#f8f9fa'}}>
                  <h3 style={{margin: 0, fontSize: '1.1rem'}}>{t('teacher.students_list', "Liste des élèves")} - {classesData.find(c => c.id === selectedClass)?.name}</h3>
                </div>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '100px'}} />
                      <col style={{width: '200px'}} />
                      <col style={{width: '250px'}} />
                      <col style={{width: '150px'}} />
                    </colgroup>
                    <thead>
                      <tr style={{background: '#f9f9f9', borderBottom: '1px solid #d4d4d4', textAlign: 'left', color: '#333'}}>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.matricule', "Matricule")}</th>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.last_name', "Nom")}</th>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.first_name', "Prénoms")}</th>
                        <th style={{padding: '12px', fontWeight: 'bold'}}>{t('teacher.status', "Statut")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.filter(s => s.class_id === selectedClass).map((student) => (
                        <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                          <td style={{padding: '12px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{student.matricule || \`MAT-\${student.id.substring(0,4)}\`}</td>
                          <td style={{padding: '12px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                          <td style={{padding: '12px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                          <td style={{padding: '12px'}}><span className={\`badge \${student.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`}>{student.status || 'Inscrit'}</span></td>
                        </tr>
                      ))}
                      {studentsData.filter(s => s.class_id === selectedClass).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{textAlign: 'center', padding: '24px', color: '#777'}}>{t('teacher.no_student_found', "Aucun élève trouvé dans cette classe.")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="panel" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '64px'}}>
                <Icons.Users />
                <h3 style={{marginTop: '16px'}}>{t('teacher.no_class_selected', "Aucune classe sélectionnée")}</h3>
                <p>{t('teacher.select_class_to_start', "Veuillez choisir une classe dans le menu déroulant ci-dessus pour voir la liste de vos élèves.")}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}`;

if (content.includes(evaluationsEndAnchor) && !content.includes(`activeTab === 'students'`)) {
  content = content.replace(evaluationsEndAnchor, studentsTabContent);
  console.log("Added students tab");
} else {
  console.log("Failed to add students tab. EvaluationsEndAnchor not found.");
}

fs.writeFileSync(targetFile, content);
console.log('TeacherPortal.tsx patched!');
