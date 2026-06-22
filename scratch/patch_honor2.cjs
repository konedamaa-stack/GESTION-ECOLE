const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const marker = "{/* Emploi du temps de la classe */}";
if (content.includes(marker)) {
  const inject = `
                      <div style={{marginTop: '16px', marginBottom: '24px', padding: '16px', background: '#f8fafc', borderRadius: '8px', border: '1px dashed #cbd5e1'}}>
                        <h4 style={{margin: '0 0 8px 0'}}>🏆 Générer un Tableau d'Honneur</h4>
                        <div style={{display: 'flex', gap: '8px', alignItems: 'center', flexWrap: 'wrap'}}>
                          <select id="honorPeriod" className="form-select" style={{width: '180px'}}>
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                            <option value="1er Semestre">1er Semestre</option>
                            <option value="2ème Semestre">2ème Semestre</option>
                          </select>
                          <input id="honorAverage" type="number" min="12" max="20" step="0.01" className="form-input" placeholder="Moyenne (ex: 15.5)" style={{width: '150px'}} />
                          <button className="btn btn-primary" onClick={(e) => {
                            e.preventDefault();
                            const avgInput = document.getElementById('honorAverage');
                            const perInput = document.getElementById('honorPeriod');
                            if(!avgInput || !perInput) return;
                            const avg = parseFloat(avgInput.value);
                            const per = perInput.value;
                            if(!avg || avg < 12) { alert("Le tableau d'honneur requiert une moyenne d'au moins 12."); return; }
                            let mention = "";
                            if(avg >= 16) mention = "Félicitations";
                            else if(avg >= 15) mention = "Félicitations";
                            else if(avg >= 14) mention = "Encouragements";
                            
                            setHonorStudentData({ student: selectedStudent, average: avg, mention, period: per });
                            setActiveModal('honor_certificate');
                          }}>Générer</button>
                        </div>
                        <small style={{color: '#64748b', display: 'block', marginTop: '4px'}}>Saisissez la moyenne pour générer le diplôme.</small>
                      </div>

                      `;
  content = content.replace(marker, inject + marker);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Patched correctly!");
} else {
  console.log("Marker not found.");
}
