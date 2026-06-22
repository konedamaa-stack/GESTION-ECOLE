const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. IMPORT
if (!content.includes("HonorCertificate")) {
  content = content.replace(
    "import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';",
    "import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';\nimport { HonorCertificate } from './components/HonorCertificate';"
  );
}

// 2. STATE
if (!content.includes("honorStudentData")) {
  content = content.replace(
    "const [activeModal, setActiveModal] = useState<string | null>(null);",
    "const [activeModal, setActiveModal] = useState<string | null>(null);\n  const [honorStudentData, setHonorStudentData] = useState<{student: any, average: number, mention: string, period: string} | null>(null);"
  );
}

// 3. MODAL RENDER
if (!content.includes("activeModal === 'honor_certificate'")) {
  const modalRender = `
        {activeModal === 'honor_certificate' && honorStudentData && (
          <div style={{ position: 'fixed', zIndex: 100000 }}>
            <HonorCertificate 
              student={honorStudentData.student}
              schoolInfo={{ ...settingsData, ...adminSchools?.find((s:any) => s.id === currentSchoolId) }}
              period={honorStudentData.period}
              average={honorStudentData.average}
              mention={honorStudentData.mention}
              onClose={() => { setActiveModal('studentDossier'); setHonorStudentData(null); }}
            />
          </div>
        )}
`;
  content = content.replace("{/* Student Dossier Modal */}", modalRender + "\n              {/* Student Dossier Modal */}");
}

// 4. WHATSAPP BUTTON (After badge-success/badge-warning for student status)
const badgePattern = `<span className={\`badge \${selectedStudent.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`} style={{marginTop: '8px', display: 'inline-block'}}>
                        {selectedStudent.status}
                      </span>`;
if (content.includes(badgePattern)) {
  const waReplacement = `<div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <span className={\`badge \${selectedStudent.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`} style={{display: 'inline-block'}}>
                          {selectedStudent.status}
                        </span>
                        {(() => {
                          const parent = parentsData?.find(p => p.student_parents?.some((sp) => sp.student_id === selectedStudent.id));
                          if (parent && parent.phone) {
                            const cleanPhone = parent.phone.replace(/\\D/g, '');
                            const finalPhone = cleanPhone.length === 10 ? '225' + cleanPhone : cleanPhone;
                            const msg = \`Bonjour, voici un message de la Direction concernant \${selectedStudent.first_name} \${selectedStudent.last_name}.\`;
                            return (
                               <a href={\`https://wa.me/\${finalPhone}?text=\${encodeURIComponent(msg)}\`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', color: '#25D366', borderColor: '#25D366', background: 'rgba(37, 211, 102, 0.1)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                  Message WhatsApp
                               </a>
                            );
                          }
                          return null;
                        })()}
                      </div>`;
  content = content.replace(badgePattern, waReplacement);
}

// 5. HONOR BUTTON (Auto-fetch) inside Dossier
const markerEmploi = "{/* Emploi du temps de la classe */}";
if (content.includes(markerEmploi) && !content.includes("Générer un Tableau d'Honneur (Automatique)")) {
  const honorBox = `
                      <div style={{marginTop: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
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
                              const classEvals = evaluationsData.filter(ev => ev.class_id === selectedStudent.class_id && ev.period === per);
                              const classEvalIds = classEvals.map(ev => ev.id);
                              
                              if (classEvalIds.length === 0) {
                                alert("Aucune évaluation trouvée pour ce trimestre.");
                                return;
                              }
                              
                              const { data: fetchGrades, error } = await supabase.from('grades')
                                .select('*')
                                .eq('student_id', selectedStudent.id)
                                .in('evaluation_id', classEvalIds);
                                
                              if (error) throw error;
                              
                              const classGrades = (fetchGrades || []).filter(g => g.score !== null);
                              
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
                      </div>

`;
  content = content.replace(markerEmploi, honorBox + markerEmploi);
}

// 6. SETTINGS FIELDS
if (!content.includes('honor_certificate_signer')) {
  const settingPattern = `<input type="text" name="studies_director_name" defaultValue={settingsData?.studies_director_name || ''} className="form-input" placeholder="Signature droite bulletin" />
                </div>`;
  const injectSetting = `<input type="text" name="studies_director_name" defaultValue={settingsData?.studies_director_name || ''} className="form-input" placeholder="Signature droite bulletin" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px', gridColumn: '1 / -1'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Signataire Tableau d'Honneur (Titre et Nom)</label>
                  <input type="text" name="honor_certificate_signer" defaultValue={settingsData?.honor_certificate_signer || settingsData?.studies_director_name || ''} className="form-input" placeholder="Ex: SANOGO OUMAR" />
                </div>`;
  content = content.replace(settingPattern, injectSetting);

  const savePattern = `studies_director_name: formData.get('studies_director_name'),`;
  const saveInject = `studies_director_name: formData.get('studies_director_name'),
      honor_certificate_signer: formData.get('honor_certificate_signer'),`;
  content = content.replace(savePattern, saveInject);
}

fs.writeFileSync(targetPath, content, 'utf8');
console.log('App.tsx fully restored and patched!');
