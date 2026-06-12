const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add state
const stateInsertion = `
  const [classSubjectsData, setClassSubjectsData] = useState<any[]>([]);
  const fetchClassSubjects = async () => {
    if (!currentSchoolId) return;
    const { data } = await supabase.from('class_subjects').select('*').eq('school_id', currentSchoolId);
    if (data) setClassSubjectsData(data);
  };
  useEffect(() => {
    if (currentSchoolId) {
      fetchClassSubjects();
    }
  }, [currentSchoolId]);
  
  const handleSaveCoefficients = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const class_id = bulletinClassId;
    
    const standardSubjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"];
    
    const upserts = [];
    for (const subj of standardSubjects) {
      const coefStr = formData.get('coef_' + subj);
      if (coefStr) {
        const coef = parseFloat(coefStr);
        if (!isNaN(coef)) {
          upserts.push({
            class_id,
            school_id: currentSchoolId,
            subject: subj,
            coefficient: coef
          });
        }
      }
    }
    
    if (upserts.length > 0) {
      // Upsert using the unique constraint (class_id, subject)
      const { error } = await supabase.from('class_subjects').upsert(upserts, { onConflict: 'class_id, subject' });
      if (error) {
        alert("Erreur lors de l'enregistrement des coefficients");
        console.error(error);
      } else {
        alert("Coefficients enregistrés avec succès !");
        fetchClassSubjects();
        closeModal();
      }
    } else {
      closeModal();
    }
  };
`;
content = content.replace(
  "const [bulletinGrades, setBulletinGrades] = useState<any[]>([]);",
  "const [bulletinGrades, setBulletinGrades] = useState<any[]>([]);\n" + stateInsertion
);

// 2. Add button in renderBulletins
content = content.replace(
  `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setActiveModal('global_grades'); setGlobalGradeClassId(row.id); setGlobalGradePeriod('1er Trimestre'); loadGlobalGrades(row.id, '1er Trimestre'); }}><Icons.FileText /> {t('admin.bulletins.btn_global', 'Saisie Globale')}</button>`,
  `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setActiveModal('global_grades'); setGlobalGradeClassId(row.id); setGlobalGradePeriod('1er Trimestre'); loadGlobalGrades(row.id, '1er Trimestre'); }}><Icons.FileText /> {t('admin.bulletins.btn_global', 'Saisie Globale')}</button>
                   <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setBulletinClassId(row.id); setActiveModal('coefficients'); }}><Icons.Settings /> Coefficients</button>`
);

// 3. Add coefficients modal
const modalContent = `
              {/* Coefficients Modal */}
              {activeModal === 'coefficients' && (
                <form onSubmit={handleSaveCoefficients}>
                  <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>Définissez les coefficients pour chaque matière. Laissez à 1 si vous n'utilisez pas de coefficients.</p>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px'}}>
                    {["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"].map(subj => {
                      const existing = classSubjectsData.find(cs => cs.class_id === bulletinClassId && cs.subject === subj);
                      return (
                        <div key={subj} className="form-group" style={{marginBottom: '10px'}}>
                          <label>{subj}</label>
                          <input type="number" step="0.5" min="0" name={'coef_' + subj} className="form-input" defaultValue={existing?.coefficient || 1} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Enregistrer les Coefficients</button>
                  </div>
                </form>
              )}
`;

content = content.replace(
  "{activeModal === 'bulletin_preview' && (",
  modalContent + "\n              {activeModal === 'bulletin_preview' && ("
);

// Add to modal titles
content = content.replace(
  `{activeModal === 'bulletin_preview' && "Aperçu des Bulletins"}`,
  `{activeModal === 'bulletin_preview' && "Aperçu des Bulletins"}
   {activeModal === 'coefficients' && "Coefficients par Matière"}`
);

fs.writeFileSync(appPath, content);
console.log("App.tsx coefficients patch applied");
