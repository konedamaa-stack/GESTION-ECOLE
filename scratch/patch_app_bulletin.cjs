const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// 1. Add import
content = content.replace(
  "import TeacherPortal from './components/TeacherPortal';",
  "import TeacherPortal from './components/TeacherPortal';\nimport { BulletinPreview } from './components/BulletinPreview';"
);

// 2. Add state for bulletin preview
const stateInsertion = `
  const [bulletinClassId, setBulletinClassId] = useState<string | null>(null);
  const [bulletinPeriod, setBulletinPeriod] = useState<string>('1er Trimestre');
`;
content = content.replace(
  "const [globalGrades, setGlobalGrades] = useState<{[key: string]: string}>({});",
  "const [globalGrades, setGlobalGrades] = useState<{[key: string]: string}>({});" + stateInsertion
);

// 3. Replace Exporter button
content = content.replace(
  `<button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => alert("Génération du PDF en cours...")}><Icons.Download /> {t('admin.bulletins.btn_export', 'Exporter')}</button>`,
  `<button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => { setBulletinClassId(row.id); setBulletinPeriod('1er Trimestre'); setActiveModal('bulletin_preview'); }}><Icons.FileText /> {t('admin.bulletins.btn_export', 'Aperçu Bulletins')}</button>`
);

// 4. Add modal content
const modalContent = `
              {/* Bulletin Preview Modal */}
              {activeModal === 'bulletin_preview' && (
                <div style={{width: '100%'}}>
                  <div className="print-controls" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                      <div className="form-group" style={{marginBottom: 0}}>
                        <label>Période</label>
                        <select className="form-select" value={bulletinPeriod} onChange={(e) => setBulletinPeriod(e.target.value)}>
                          <option value="1er Trimestre">1er Trimestre</option>
                          <option value="2ème Trimestre">2ème Trimestre</option>
                          <option value="3ème Trimestre">3ème Trimestre</option>
                          <option value="1er Semestre">1er Semestre</option>
                          <option value="2ème Semestre">2ème Semestre</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-primary" onClick={() => window.print()}><Icons.Download /> Imprimer / PDF</button>
                    </div>
                  </div>
                  
                  <div style={{background: '#f1f5f9', padding: '20px', borderRadius: '8px', maxHeight: '70vh', overflowY: 'auto'}}>
                    <BulletinPreview 
                      classData={classesData.find(c => c.id === bulletinClassId)}
                      students={studentsData.filter(s => s.class_id === bulletinClassId)}
                      evaluations={evaluationsData}
                      grades={gradesData}
                      period={bulletinPeriod}
                      schoolInfo={adminSchools.find(s => s.id === currentSchoolId)}
                    />
                  </div>
                </div>
              )}
`;

content = content.replace(
  "{activeModal === 'global_grades' && (",
  modalContent + "\n              {activeModal === 'global_grades' && ("
);

// 5. Add to modal header titles
content = content.replace(
  `{activeModal === 'global_grades' && "Saisie Globale des Notes"}`,
  `{activeModal === 'global_grades' && "Saisie Globale des Notes"}
   {activeModal === 'bulletin_preview' && "Aperçu des Bulletins"}`
);

// 6. Fix modal-content width for bulletin_preview too
content = content.replace(
  `style={activeModal === 'global_grades' ? {maxWidth: '1600px', width: '98%'} : {}}`,
  `style={['global_grades', 'bulletin_preview'].includes(activeModal) ? {maxWidth: '1600px', width: '98%'} : {}}`
);

fs.writeFileSync(appPath, content);
console.log("Bulletin patch applied");
