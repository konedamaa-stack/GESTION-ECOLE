const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add next_class_id to class form
const classFormRegex = /<div className="form-group">\s*<label>Scolarité annuelle par défaut \(F\)<\/label>\s*<input type="number" name="tuition_fee" className="form-input" placeholder="Ex: 500000" defaultValue=\{editEntity\?\.tuition_fee \|\| ''\} \/>\s*<\/div>/;

const classFormReplace = `<div className="form-group">
                    <label>Scolarité annuelle par défaut (F)</label>
                    <input type="number" name="tuition_fee" className="form-input" placeholder="Ex: 500000" defaultValue={editEntity?.tuition_fee || ''} />
                  </div>
                  <div className="form-group">
                    <label>Classe Supérieure (Progression automatique)</label>
                    <select name="next_class_id" className="form-select" defaultValue={editEntity?.next_class_id || ''}>
                      <option value="">Aucune (Dernière classe)</option>
                      {classesData.filter(c => c.id !== editEntity?.id).map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    <small style={{color: 'var(--text-secondary)'}}>Sera utilisée automatiquement lors de la réinscription si l'élève a la moyenne d'admission.</small>
                  </div>`;
code = code.replace(classFormRegex, classFormReplace);

// 2. Add automatic logic to reinscription form
const reinscriptionRegex = /\{activeModal === 'reinscription' && editEntity && \([\s\S]*?<h3 style=\{\{marginTop: '24px'/;

const newReinscriptionBlock = `{activeModal === 'reinscription' && editEntity && (() => {
                // Determine automatic class progression
                let autoClassId = editEntity.class_id;
                let message = "";
                
                const studentEvals = evaluationsData?.filter(e => e.student_id === editEntity.id) || [];
                const globalEvals = studentEvals.filter(e => e.type === "Moyenne Globale");
                let studentMoyenne = 0;
                
                if (globalEvals.length > 0) {
                  studentMoyenne = globalEvals.reduce((sum, e) => sum + (Number(e.score) || 0), 0) / globalEvals.length;
                } else if (studentEvals.length > 0) {
                  studentMoyenne = studentEvals.reduce((sum, e) => sum + (Number(e.score) || 0), 0) / studentEvals.length;
                }

                if (studentMoyenne >= 10) {
                  const currentClass = classesData.find(c => c.id === editEntity.class_id);
                  if (currentClass && currentClass.next_class_id) {
                    autoClassId = currentClass.next_class_id;
                    const nextClass = classesData.find(c => c.id === autoClassId);
                    message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20). Passage automatique en \${nextClass?.name || 'Classe Supérieure'}.\`;
                  } else {
                    message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20) mais aucune classe supérieure définie.\`;
                  }
                } else if (studentEvals.length > 0) {
                  message = \`Moyenne insuffisante (\${studentMoyenne.toFixed(2)}/20). Redoublement conseillé.\`;
                }

                return (
                  <form key={editEntity.id} onSubmit={handleFormSubmit}>
                    <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                      <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                    
                    {message && (
                      <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: \`1px solid \${studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}\`, color: studentMoyenne >= 10 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500}}>
                        {message}
                      </div>
                    )}

                    <div className="form-group">
                      <label>Nouvelle Classe</label>
                      <select name="class_id" className="form-select" required defaultValue={autoClassId}>
                        <option value="">Choisir une classe...</option>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    <h3 style={{marginTop: '24px'`;

if (!reinscriptionRegex.test(code)) {
  console.log("Regex not matching reinscription form!");
  process.exit(1);
}

code = code.replace(reinscriptionRegex, newReinscriptionBlock);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched successfully with regex!");
