const fs = require('fs');

let content = fs.readFileSync('src/components/CommitteePortal.tsx', 'utf8');

// 1. Add activeTab and subject state
if (!content.includes('activeTab')) {
  content = content.replace(
    `const [selectedClass, setSelectedClass] = useState<string | null>(null);`,
    `const [selectedClass, setSelectedClass] = useState<string | null>(null);\n  const [activeTab, setActiveTab] = useState('dashboard');\n  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);\n  const [showEvalForm, setShowEvalForm] = useState(false);\n  const [newEval, setNewEval] = useState({ name: '', period: 'Trimestre 1', max_score: 20 });\n  const [selectedEval, setSelectedEval] = useState<string | null>(null);\n  const [savingGrades, setSavingGrades] = useState(false);\n  const [editingGrades, setEditingGrades] = useState<Record<string, { score: number | '', comment: string }>>({});`
  );
}

// 2. Add subject list and helper methods
if (!content.includes('const subjects =')) {
  const helpers = `
  const subjects = [
    'Mathématiques', 'Français', 'Histoire-Géographie', 
    'Anglais', 'Physique-Chimie', 'SVT', 
    'EPS', 'Philosophie', 'Espagnol', 'Allemand'
  ];

  const handleCreateEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return;
    try {
      const { data, error } = await supabase.from('evaluations').insert([{
        ...newEval,
        class_id: selectedClass,
        subject: selectedSubject,
        school_id: session.school_id
      }]).select();
      
      if (error) throw error;
      
      if (data) {
        setEvaluations([data[0], ...evaluations]);
        setShowEvalForm(false);
        setSelectedEval(data[0].id);
        setNewEval({ name: '', period: 'Trimestre 1', max_score: 20 });
      }
    } catch (error: any) {
      alert("Erreur lors de la création : " + error.message);
    }
  };

  const loadGradesForEval = (evalId: string) => {
    const currentGrades = grades.filter(g => g.evaluation_id === evalId);
    const gradesMap: Record<string, { score: number | '', comment: string }> = {};
    
    currentGrades.forEach(g => {
      gradesMap[g.student_id] = {
        score: g.score,
        comment: g.comment || ''
      };
    });
    
    setEditingGrades(gradesMap);
    setSelectedEval(evalId);
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: any) => {
    setEditingGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const saveGrades = async () => {
    if (!selectedEval) return;
    setSavingGrades(true);
    try {
      const updates = Object.keys(editingGrades).map(studentId => ({
        evaluation_id: selectedEval,
        student_id: studentId,
        score: editingGrades[studentId].score === '' ? null : Number(editingGrades[studentId].score),
        comment: editingGrades[studentId].comment,
        school_id: session.school_id
      }));

      const { error } = await supabase.from('grades').upsert(updates, { onConflict: 'evaluation_id,student_id' });
      if (error) throw error;

      alert("Notes enregistrées avec succès");
      fetchData(); // reload
    } catch (error: any) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setSavingGrades(false);
    }
  };
`;
  content = content.replace(`const getFilteredStudents = () => {`, helpers + `\n  const getFilteredStudents = () => {`);
}

// 3. Add tabs to UI
const tabsUI = `
        <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
          <button className={\`btn \${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}\`} onClick={() => setActiveTab('dashboard')}>Tableau de bord / Bulletins</button>
          <button className={\`btn \${activeTab === 'evaluations' ? 'btn-primary' : 'btn-outline'}\`} onClick={() => setActiveTab('evaluations')}>Saisie des Notes</button>
        </div>
`;
if (!content.includes('Saisie des Notes')) {
  content = content.replace(`<main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>`, `<main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>\n${tabsUI}`);
}

// 4. Wrap existing main content in activeTab === 'dashboard'
content = content.replace(
  `<div style={{background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px'}}>`,
  `{activeTab === 'dashboard' && (\n          <div>\n          <div style={{background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px'}}>`
);

content = content.replace(
  `</table>\n        </div>\n      </main>`,
  `</table>\n        </div>\n        </div>\n        )}\n\n        {/* EVALUATIONS TAB */}\n        {activeTab === 'evaluations' && (\n          <div>\n            <div style={{background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px', display: 'flex', gap: '16px'}}>\n              <div style={{flex: 1}}>\n                <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Classe</label>\n                <select className="input-field" value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)} style={{width: '100%'}}>\n                  <option value="">-- Choisir une classe --</option>\n                  {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}\n                </select>\n              </div>\n              <div style={{flex: 1}}>\n                <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Matière</label>\n                <select className="input-field" value={selectedSubject || ''} onChange={(e) => setSelectedSubject(e.target.value || null)} style={{width: '100%'}}>\n                  <option value="">-- Choisir une matière --</option>\n                  {subjects.map(s => <option key={s} value={s}>{s}</option>)}\n                </select>\n              </div>\n            </div>\n\n            {selectedClass && selectedSubject ? (\n              <div style={{display: 'flex', gap: '24px'}}>\n                <div style={{width: '300px'}}>\n                  <div style={{background: 'var(--surface-color)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>\n                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>\n                      <h3 style={{margin: 0}}>Évaluations</h3>\n                      <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.85rem'}} onClick={() => setShowEvalForm(!showEvalForm)}>\n                        {showEvalForm ? 'Fermer' : 'Nouvelle'}\n                      </button>\n                    </div>\n\n                    {showEvalForm && (\n                      <form onSubmit={handleCreateEval} style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>\n                        <div style={{marginBottom: '12px'}}>\n                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Nom</label>\n                          <input type="text" className="input-field" required value={newEval.name} onChange={e => setNewEval({...newEval, name: e.target.value})} placeholder="Ex: Devoir 1" style={{width: '100%', padding: '6px'}} />\n                        </div>\n                        <div style={{marginBottom: '12px'}}>\n                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Période</label>\n                          <select className="input-field" value={newEval.period} onChange={e => setNewEval({...newEval, period: e.target.value})} style={{width: '100%', padding: '6px'}}>\n                            <option>Trimestre 1</option>\n                            <option>Trimestre 2</option>\n                            <option>Trimestre 3</option>\n                          </select>\n                        </div>\n                        <div style={{marginBottom: '16px'}}>\n                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Sur</label>\n                          <input type="number" className="input-field" required min="1" max="100" value={newEval.max_score} onChange={e => setNewEval({...newEval, max_score: parseInt(e.target.value)})} style={{width: '100%', padding: '6px'}} />\n                        </div>\n                        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Créer</button>\n                      </form>\n                    )}\n\n                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>\n                      {evaluations.filter(e => e.class_id === selectedClass && e.subject === selectedSubject).map(ev => (\n                        <div \n                          key={ev.id} \n                          onClick={() => loadGradesForEval(ev.id)}\n                          style={{padding: '12px', borderRadius: '8px', border: selectedEval === ev.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: selectedEval === ev.id ? '#eff6ff' : 'white', cursor: 'pointer'}}\n                        >\n                          <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{ev.name}</div>\n                          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{ev.period} • Sur {ev.max_score}</div>\n                        </div>\n                      ))}\n                      {evaluations.filter(e => e.class_id === selectedClass && e.subject === selectedSubject).length === 0 && !showEvalForm && (\n                        <div style={{textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Aucune évaluation</div>\n                      )}\n                    </div>\n                  </div>\n                </div>\n\n                <div style={{flex: 1}}>\n                  {selectedEval ? (\n                    <div style={{background: 'var(--surface-color)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden'}}>\n                      <div style={{padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa'}}>\n                        <h3 style={{margin: 0}}>Saisie des notes - {evaluations.find(e => e.id === selectedEval)?.name}</h3>\n                        <button className="btn btn-primary" onClick={saveGrades} disabled={savingGrades}>\n                          {savingGrades ? 'Enregistrement...' : 'Enregistrer les notes'}\n                        </button>\n                      </div>\n                      <div style={{padding: '0'}}>\n                        <table style={{width: '100%', borderCollapse: 'collapse'}}>\n                          <thead>\n                            <tr style={{background: 'var(--background-color)'}}>\n                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Élève</th>\n                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', width: '150px'}}>Note (/{evaluations.find(e => e.id === selectedEval)?.max_score})</th>\n                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Appréciation</th>\n                            </tr>\n                          </thead>\n                          <tbody>\n                            {getFilteredStudents().map(student => (\n                              <tr key={student.id} style={{borderBottom: '1px solid var(--border-color)'}}>\n                                <td style={{padding: '12px 24px'}}>{student.last_name.toUpperCase()} {student.first_name}</td>\n                                <td style={{padding: '12px 24px'}}>\n                                  <input \n                                    type="number" \n                                    className="input-field"\n                                    style={{width: '100px'}}\n                                    min="0" \n                                    max={evaluations.find(e => e.id === selectedEval)?.max_score || 20}\n                                    step="0.25"\n                                    value={editingGrades[student.id]?.score !== undefined ? editingGrades[student.id].score : ''}\n                                    onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}\n                                  />\n                                </td>\n                                <td style={{padding: '12px 24px'}}>\n                                  <input \n                                    type="text" \n                                    className="input-field"\n                                    style={{width: '100%'}}\n                                    placeholder="Ex: Bon travail"\n                                    value={editingGrades[student.id]?.comment || ''}\n                                    onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value)}\n                                  />\n                                </td>\n                              </tr>\n                            ))}\n                          </tbody>\n                        </table>\n                      </div>\n                    </div>\n                  ) : (\n                    <div style={{background: 'var(--surface-color)', padding: '64px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)'}}>\n                      <h3>Sélectionnez une évaluation</h3>\n                      <p>Choisissez une évaluation dans la liste à gauche pour commencer la saisie.</p>\n                    </div>\n                  )}\n                </div>\n              </div>\n            ) : (\n              <div style={{background: 'var(--surface-color)', padding: '64px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)'}}>\n                <h3>Aucune sélection</h3>\n                <p>Veuillez choisir une classe et une matière pour gérer les évaluations.</p>\n              </div>\n            )}\n          </div>\n        )}\n      </main>`
);

fs.writeFileSync('src/components/CommitteePortal.tsx', content);
console.log('CommitteePortal patched with grading feature');
