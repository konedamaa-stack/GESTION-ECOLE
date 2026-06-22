const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// We need to replace the entire <div ...> <h4>🏆 Générer un Tableau d'Honneur (Automatique)</h4> ... </div>
// Let's use a regex to grab the block
const startMarker = `<div style={{marginTop: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>`;
const endMarker = `</div>

                      {/* Emploi du temps de la classe */}`;

const startIndex = content.indexOf(startMarker);
const endIndex = content.indexOf(endMarker, startIndex);

if (startIndex !== -1 && endIndex !== -1) {
  const newBlock = `<div style={{marginTop: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                        <h4 style={{margin: '0 0 8px 0'}}>🏆 Générer un Tableau d'Honneur (Automatique)</h4>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                          <select id="honorPeriod" className="form-select" style={{width: '180px'}}>
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                            <option value="1er Semestre">1er Semestre</option>
                            <option value="2ème Semestre">2ème Semestre</option>
                          </select>
                          <button className="btn btn-primary" onClick={async (e) => {
                            e.preventDefault();
                            const perInput = document.getElementById('honorPeriod');
                            if(!perInput) return;
                            const per = perInput.value;
                            
                            try {
                              // Calcul automatique de la moyenne
                              const classEvals = evaluationsData.filter(ev => ev.class_id === selectedStudent.class_id && ev.period === per);
                              const classEvalIds = classEvals.map(ev => ev.id);
                              
                              if (classEvalIds.length === 0) {
                                alert("Aucune évaluation trouvée pour ce trimestre.");
                                return;
                              }
                              
                              const { data: gradesData, error } = await supabase.from('grades')
                                .select('*')
                                .eq('student_id', selectedStudent.id)
                                .in('evaluation_id', classEvalIds);
                                
                              if (error) throw error;
                              
                              const classGrades = (gradesData || []).filter(g => g.score !== null);
                              
                              let totalWeightedScore = 0;
                              let totalCoefs = 0;
                              const subjects = Array.from(new Set(classEvals.map(ev => ev.subject)));
                              
                              subjects.forEach(subject => {
                                const subjectEvals = classEvals.filter(ev => ev.subject === subject);
                                const subjectEvalIds = subjectEvals.map(ev => ev.id);
                                const subjObj = classSubjectsData.find(cs => cs.class_id === selectedStudent.class_id && cs.subject === subject);
                                const coef = subjObj ? subjObj.coefficient : 1;
                                
                                const studentSubjectGrades = classGrades.filter(g => subjectEvalIds.includes(g.evaluation_id));
                                if (studentSubjectGrades.length > 0) {
                                  const sumNormalized = studentSubjectGrades.reduce((acc, curr) => {
                                    const ev = subjectEvals.find(e => e.id === curr.evaluation_id);
                                    const max = ev?.max_score || 20;
                                    return acc + (curr.score / max * 20);
                                  }, 0);
                                  const avgObj = sumNormalized / studentSubjectGrades.length;
                                  totalWeightedScore += (avgObj * coef);
                                  totalCoefs += coef;
                                }
                              });
                              
                              let avg = 0;
                              if (totalCoefs > 0) {
                                 avg = totalWeightedScore / totalCoefs;
                              }
                              
                              if (avg < 13) {
                                 alert("L'élève a une moyenne de " + avg.toFixed(2) + " / 20 pour ce trimestre.\\nLe tableau d'honneur requiert une moyenne d'au moins 13.");
                                 return;
                              }
                              
                              let mention = "";
                              if(avg >= 16) mention = "Félicitations";
                              else if(avg >= 15) mention = "Félicitations";
                              else if(avg >= 14) mention = "Encouragements";
                              
                              setHonorStudentData({ student: selectedStudent, average: avg, mention, period: per });
                              setActiveModal('honor_certificate');
                            } catch (err) {
                              console.error(err);
                              alert("Erreur lors du calcul de la moyenne.");
                            }
                          }}>Calculer et Générer</button>
                        </div>
                        <small style={{color: '#64748b', display: 'block', marginTop: '4px'}}>Le système calculera automatiquement la moyenne. Requis : &gt;= 13/20.</small>
                      `;

  content = content.slice(0, startIndex) + newBlock + content.slice(endIndex);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Patched successfully with Supabase fetch!");
} else {
  console.log("Pattern not found");
}
