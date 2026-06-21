const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add reinscriptionAverage state
const stateInsertionPoint = `const [globalGradePeriod, setGlobalGradePeriod] = useState<string>('1er Trimestre');`;
if (code.includes(stateInsertionPoint) && !code.includes('reinscriptionAverage')) {
  code = code.replace(
    stateInsertionPoint,
    `${stateInsertionPoint}\n  const [reinscriptionAverage, setReinscriptionAverage] = useState<number | null>(null);`
  );
}

// 2. Add useEffect for reinscription average
const useEffectInsertionPoint = `// Load initial data`;
const useEffectCode = `  // Fetch student average for reinscription
  useEffect(() => {
    if (activeModal === 'reinscription' && editEntity) {
      setReinscriptionAverage(null);
      const fetchAvg = async () => {
        try {
          // Find global evaluations
          const { data: globalEvals } = await supabase
            .from('evaluations')
            .select('id')
            .eq('type', 'Moyenne Globale');
          
          if (globalEvals && globalEvals.length > 0) {
            const evalIds = globalEvals.map(e => e.id);
            const { data: grades } = await supabase
              .from('grades')
              .select('score')
              .eq('student_id', editEntity.id)
              .in('evaluation_id', evalIds);
              
            if (grades && grades.length > 0) {
              const validGrades = grades.filter(g => g.score !== null && g.score !== undefined);
              if (validGrades.length > 0) {
                const sum = validGrades.reduce((acc, g) => acc + Number(g.score), 0);
                setReinscriptionAverage(sum / validGrades.length);
              } else {
                setReinscriptionAverage(0);
              }
            } else {
              setReinscriptionAverage(0);
            }
          } else {
            setReinscriptionAverage(0);
          }
        } catch (e) {
          console.error("Error fetching reinscription average:", e);
          setReinscriptionAverage(0);
        }
      };
      fetchAvg();
    }
  }, [activeModal, editEntity]);

  // Load initial data`;

if (code.includes(useEffectInsertionPoint) && !code.includes('fetch student average for reinscription')) {
  code = code.replace(useEffectInsertionPoint, useEffectCode);
}

// 3. Fix the reinscription render logic
const reinscriptionRegex = /\{activeModal === 'reinscription' && editEntity && \(\(\) => \{[\s\S]*?let studentMoyenne = 0;[\s\S]*?if \(studentMoyenne >= 10\) \{[\s\S]*?return \([\s\S]*?<\/form>\s*\);\s*\}\)\(\)\}/;

const newReinscriptionLogic = `{activeModal === 'reinscription' && editEntity && (() => {
                let autoClassId = editEntity.class_id;
                let message = "Calcul de la moyenne en cours...";
                let studentMoyenne = reinscriptionAverage;

                if (studentMoyenne !== null) {
                  if (studentMoyenne >= 10) {
                    const currentClass = classesData.find(c => c.id === editEntity.class_id);
                    if (currentClass && currentClass.next_class_id) {
                      autoClassId = currentClass.next_class_id;
                      const nextClass = classesData.find(c => c.id === autoClassId);
                      message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20). Passage automatique en \${nextClass?.name || 'Classe Supérieure'}.\`;
                    } else {
                      message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20) mais aucune classe supérieure définie.\`;
                    }
                  } else {
                    message = \`Moyenne insuffisante (\${studentMoyenne.toFixed(2)}/20). Redoublement conseillé.\`;
                  }
                }

                return (
                  <form key={editEntity.id} onSubmit={handleFormSubmit}>
                    <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                      <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                    
                    {studentMoyenne !== null ? (
                      <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: \`1px solid \${studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}\`, color: studentMoyenne >= 10 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500}}>
                        {message}
                      </div>
                    ) : (
                       <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--primary-color)', fontWeight: 500}}>
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

                    <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>2. Frais de Réinscription</h3>
                    <div className="form-group">
                      <label>Montant des frais de réinscription (CFA)</label>
                      <input type="number" name="reg_fee_amount" className="form-input" placeholder="Ex: 25000" />
                      <small style={{color: 'var(--text-secondary)'}}>Laissez vide si l'élève n'a pas de frais à payer.</small>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Mode de paiement</label>
                        <select name="reg_fee_method" className="form-select">
                          <option value="Espèces">Espèces</option>
                          <option value="Chèque">Chèque</option>
                          <option value="Virement">Virement</option>
                          <option value="Mobile Money">Mobile Money</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Statut du paiement</label>
                        <select name="reg_fee_status" className="form-select">
                          <option value="Payée">Payée (Immédiatement)</option>
                          <option value="En attente">En attente (Paiement ultérieur)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                      <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                      <button type="submit" className="btn btn-primary">Encaisser & Voir Reçu</button>
                    </div>
                  </form>
                );
              })()}`;

if (reinscriptionRegex.test(code)) {
  code = code.replace(reinscriptionRegex, newReinscriptionLogic);
}

// 4. Update saveGlobalGrades to be more robust and log exactly what's failing if any
const saveGlobalGradesRegex = /const saveGlobalGrades = async \(\) => \{[\s\S]*?alert\("Notes enregistrées avec succès !"\);\s*setActiveModal\(null\);\s*fetchEvaluations\(\);\s*\}\s*catch\(e: any\) \{\s*alert\("Erreur: " \+ e\.message\);\s*\}\s*\};/;

const newSaveGlobalGrades = `const saveGlobalGrades = async () => {
    try {
      // Check if school ID exists
      if (!currentSchoolId) {
         throw new Error("L'identifiant de l'école (school_id) est introuvable. Veuillez vous reconnecter.");
      }

      // Fetch existing evals from DB directly to avoid duplicates if local state is stale
      const { data: existingDbEvals } = await supabase
        .from('evaluations')
        .select('id, subject')
        .eq('class_id', globalGradeClassId)
        .eq('period', globalGradePeriod)
        .eq('type', 'Moyenne Globale')
        .eq('school_id', currentSchoolId);

      const subjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique"];
      for(const subject of subjects) {
        let evId = existingDbEvals?.find(e => e.subject === subject)?.id || evaluationsData.find(e => e.class_id === globalGradeClassId && e.period === globalGradePeriod && e.type === "Moyenne Globale" && e.subject === subject)?.id;
        
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
          if(error) throw new Error("Erreur insertion évaluation " + subject + ": " + error.message);
          evId = data[0].id;
        }
        
        const gradesToUpsert = [];
        const studentsInClass = studentsData.filter(s => s.class_id === globalGradeClassId);
        for(const st of studentsInClass) {
          const val = globalGrades[\`\${st.id}_\${subject}\`];
          if(val !== undefined && val !== "") {
            const parsedVal = parseFloat(val.toString().replace(',', '.'));
            if (!isNaN(parsedVal)) {
              gradesToUpsert.push({
                evaluation_id: evId,
                student_id: st.id,
                score: parsedVal,
                school_id: currentSchoolId
              });
            }
          }
        }
        if(gradesToUpsert.length > 0) {
          const { error: gradeErr } = await supabase.from('grades').upsert(gradesToUpsert, { onConflict: 'evaluation_id,student_id' });
          if(gradeErr) throw new Error("Erreur upsert grades " + subject + ": " + gradeErr.message);
        }
      }
      alert("Notes globales enregistrées avec succès !");
      setActiveModal(null);
      fetchEvaluations();
      
    } catch(e: any) {
      console.error(e);
      alert("Erreur: " + e.message);
    }
  };`;

if (saveGlobalGradesRegex.test(code)) {
  code = code.replace(saveGlobalGradesRegex, newSaveGlobalGrades);
}

fs.writeFileSync('src/App.tsx', code);
console.log("Patched App.tsx successfully!");
