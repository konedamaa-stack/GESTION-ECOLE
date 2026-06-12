const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add state variables
const stateVars = `
  const [globalGradeClassId, setGlobalGradeClassId] = useState<string | null>(null);
  const [globalGradePeriod, setGlobalGradePeriod] = useState<string>('1er Trimestre');
  const [globalGrades, setGlobalGrades] = useState<{[key: string]: string}>({});
`;
content = content.replace(
  "const [activeEvaluation, setActiveEvaluation] = useState<any>(null);",
  "const [activeEvaluation, setActiveEvaluation] = useState<any>(null);" + stateVars
);

// 2. Add functions
const funcs = `
  const loadGlobalGrades = async (classId: string, period: string) => {
    const evals = evaluationsData.filter(e => e.class_id === classId && e.period === period && e.type === "Moyenne Globale");
    const evalIds = evals.map(e => e.id);
    const relevantGrades = gradesData.filter(g => evalIds.includes(g.evaluation_id));
    
    const initialGrades: any = {};
    relevantGrades.forEach(g => {
      const ev = evals.find(e => e.id === g.evaluation_id);
      if(ev && g.score !== null) {
        initialGrades[\`\${g.student_id}_\${ev.subject}\`] = g.score.toString();
      }
    });
    setGlobalGrades(initialGrades);
  };

  const saveGlobalGrades = async () => {
    try {
      const subjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique"];
      for(const subject of subjects) {
        let ev = evaluationsData.find(e => e.class_id === globalGradeClassId && e.period === globalGradePeriod && e.type === "Moyenne Globale" && e.subject === subject);
        let evId = ev?.id;
        
        // Find if any grades exist for this subject
        const hasGrades = Object.keys(globalGrades).some(k => k.endsWith(\`_\${subject}\`) && globalGrades[k] !== "");
        if(!hasGrades) continue; // skip if no grades for this subject

        if(!evId) {
          const { data, error } = await supabase.from('evaluations').insert([{
             class_id: globalGradeClassId,
             subject: subject,
             period: globalGradePeriod,
             name: "Moyenne Globale",
             type: "Moyenne Globale",
             date: new Date().toISOString().split('T')[0],
             max_score: 20,
             school_id: currentSchoolId
          }]).select();
          if(error) throw error;
          evId = data[0].id;
        }
        
        const gradesToUpsert = [];
        const studentsInClass = studentsData.filter(s => s.class_id === globalGradeClassId);
        for(const st of studentsInClass) {
          const val = globalGrades[\`\${st.id}_\${subject}\`];
          if(val !== undefined && val !== "") {
            gradesToUpsert.push({
              evaluation_id: evId,
              student_id: st.id,
              score: parseFloat(val),
              school_id: currentSchoolId
            });
          }
        }
        if(gradesToUpsert.length > 0) {
          const { error: gradeErr } = await supabase.from('grades').upsert(gradesToUpsert, { onConflict: 'evaluation_id,student_id' });
          if(gradeErr) throw gradeErr;
        }
      }
      alert("Notes enregistrées avec succès !");
      setActiveModal(null);
      fetchEvaluations();
      fetchGrades();
    } catch(e: any) {
      alert("Erreur: " + e.message);
    }
  };
`;
content = content.replace(
  "const handleGenerateBulletin = async (e: React.FormEvent<HTMLFormElement>) => {",
  funcs + "\n  const handleGenerateBulletin = async (e: React.FormEvent<HTMLFormElement>) => {"
);

// 3. Add button in renderBulletins
content = content.replace(
  `<button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => alert("Génération du PDF en cours...")}><Icons.Download /> {t('admin.bulletins.btn_export', 'Exporter')}</button>`,
  `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setActiveModal('global_grades'); setGlobalGradeClassId(row.id); setGlobalGradePeriod('1er Trimestre'); loadGlobalGrades(row.id, '1er Trimestre'); }}><Icons.Edit3 /> {t('admin.bulletins.btn_global', 'Saisie Globale')}</button>
   <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => alert("Génération du PDF en cours...")}><Icons.Download /> {t('admin.bulletins.btn_export', 'Exporter')}</button>`
);

// 4. Add modal
const modalHtml = `
              {activeModal === 'global_grades' && (
                <div className="modal-content" style={{maxWidth: '1200px', width: '95%'}}>
                  <div className="modal-header">
                    <h2 className="modal-title">Saisie Globale des Notes</h2>
                    <button className="btn-close" onClick={closeModal}><Icons.X /></button>
                  </div>
                  <div className="modal-body" style={{overflowX: 'auto'}}>
                    <div style={{marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
                       <div className="form-group" style={{marginBottom: 0}}>
                         <label>Période</label>
                         <select className="form-select" value={globalGradePeriod} onChange={(e) => { setGlobalGradePeriod(e.target.value); loadGlobalGrades(globalGradeClassId!, e.target.value); }}>
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                            <option value="1er Semestre">1er Semestre</option>
                            <option value="2ème Semestre">2ème Semestre</option>
                         </select>
                       </div>
                       <button className="btn btn-primary" onClick={saveGlobalGrades}>Enregistrer tout</button>
                    </div>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '1px solid var(--border-color)'}}>
                      <thead>
                        <tr style={{background: 'var(--surface-color)'}}>
                          <th style={{border: '1px solid var(--border-color)', padding: '12px', textAlign: 'left', minWidth: '150px'}}>Élève</th>
                          {["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique"].map(sub => (
                            <th key={sub} style={{border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center'}} title={sub}>{sub.substring(0,4)}.</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentsData.filter(s => s.class_id === globalGradeClassId).map(st => (
                          <tr key={st.id}>
                            <td style={{border: '1px solid var(--border-color)', padding: '8px', fontWeight: 500}}>{st.first_name} {st.last_name}</td>
                            {["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique"].map(sub => (
                              <td key={sub} style={{border: '1px solid var(--border-color)', padding: '4px', textAlign: 'center'}}>
                                <input 
                                  type="number" 
                                  min="0" max="20" step="0.25"
                                  style={{width: '60px', padding: '6px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                                  value={globalGrades[\`\${st.id}_\${sub}\`] || ""}
                                  onChange={(e) => setGlobalGrades({...globalGrades, [\`\${st.id}_\${sub}\`]: e.target.value})}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
`;

content = content.replace(
  "{/* Main Modal Content */}",
  "{/* Main Modal Content */}" + modalHtml
);

fs.writeFileSync(appPath, content);
console.log("Global grades patch applied.");
