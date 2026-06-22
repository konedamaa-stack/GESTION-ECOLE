const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

// 1. Import HonorCertificate
if (!content.includes("HonorCertificate")) {
  content = content.replace(
    "import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';",
    "import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';\nimport { HonorCertificate } from './components/HonorCertificate';"
  );
}

// 2. Add state
if (!content.includes("honorStudentData")) {
  content = content.replace(
    "const [activeModal, setActiveModal] = useState<string | null>(null);",
    "const [activeModal, setActiveModal] = useState<string | null>(null);\n  const [honorStudentData, setHonorStudentData] = useState<{student: any, average: number, mention: string, period: string} | null>(null);"
  );
}

// 3. Render HonorCertificate
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
  content = content.replace(
    "{/* Student Dossier Modal */}",
    modalRender + "\n              {/* Student Dossier Modal */}"
  );
}

// 4. Add Button in Dossier modal (Informations Scolaires)
// Let's add a quick calculator for the average to show the button if they qualify
const dossierPattern = `<strong>{selectedStudent.classes?.name || t('admin.modals.unassigned', 'Non assigné')}</strong>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block'}}>{t('admin.modals.birth_date_title', 'Date de naissance')}</span>
                          <strong>{new Date(selectedStudent.birth_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}</strong>
                        </div>`;

const injectDossier = `<strong>{selectedStudent.classes?.name || t('admin.modals.unassigned', 'Non assigné')}</strong>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block'}}>{t('admin.modals.birth_date_title', 'Date de naissance')}</span>
                          <strong>{new Date(selectedStudent.birth_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}</strong>
                        </div>
                        <div style={{gridColumn: '1 / -1', marginTop: '16px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                          <h4 style={{margin: '0 0 8px 0'}}>🏆 Générer un Tableau d'Honneur</h4>
                          <div style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <select id="honorPeriod" className="form-select" style={{width: '200px'}}>
                              <option value="1er Trimestre">1er Trimestre</option>
                              <option value="2ème Trimestre">2ème Trimestre</option>
                              <option value="3ème Trimestre">3ème Trimestre</option>
                            </select>
                            <input id="honorAverage" type="number" min="12" max="20" step="0.01" className="form-input" placeholder="Moyenne (ex: 15.5)" style={{width: '150px'}} />
                            <button className="btn btn-primary" onClick={() => {
                              const avg = parseFloat((document.getElementById('honorAverage') as HTMLInputElement).value);
                              const per = (document.getElementById('honorPeriod') as HTMLSelectElement).value;
                              if(!avg || avg < 12) { alert("Le tableau d'honneur requiert une moyenne d'au moins 12."); return; }
                              let mention = "";
                              if(avg >= 16) mention = "Félicitations";
                              else if(avg >= 15) mention = "Félicitations"; // based on user feedback
                              else if(avg >= 14) mention = "Encouragements";
                              
                              setHonorStudentData({ student: selectedStudent, average: avg, mention, period: per });
                              setActiveModal('honor_certificate');
                            }}>Générer</button>
                          </div>
                          <small style={{color: '#64748b', display: 'block', marginTop: '4px'}}>Saisissez la moyenne du trimestre pour générer le diplôme.</small>
                        </div>`;

content = content.replace(dossierPattern, injectDossier);

// 5. Add Setting Field
const settingPattern = `<input type="text" name="studies_director_name" defaultValue={settingsData?.studies_director_name || ''} className="form-input" placeholder="Signature droite bulletin" />
                </div>`;

const injectSetting = `<input type="text" name="studies_director_name" defaultValue={settingsData?.studies_director_name || ''} className="form-input" placeholder="Signature droite bulletin" />
                </div>
                <div className="form-group">
                  <label>Signataire Tableau d'Honneur</label>
                  <input type="text" name="honor_certificate_signer" defaultValue={settingsData?.honor_certificate_signer || settingsData?.studies_director_name || ''} className="form-input" placeholder="Nom du signataire (ex: SANOGO OUMAR)" />
                </div>`;

content = content.replace(settingPattern, injectSetting);

// Also need to save it in handleSaveSettings
const savePattern = `studies_director_name: formData.get('studies_director_name'),`;
const saveInject = `studies_director_name: formData.get('studies_director_name'),
      honor_certificate_signer: formData.get('honor_certificate_signer'),`;
content = content.replace(savePattern, saveInject);


fs.writeFileSync(targetPath, content, 'utf8');
console.log('App.tsx patched for HonorCertificate successfully!');
