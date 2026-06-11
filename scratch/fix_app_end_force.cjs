const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the last form closing tag before the school modal
const lastFormIdx = lines.findLastIndex(l => l.includes('</form>'));
if (lastFormIdx !== -1) {
  // we know the structure after the last form is:
  //               )}
  //             </div>
  //           </div>
  //         </div>
  //       )}
  // 
  // And then the school modal.
  // We will truncate everything after the last form and rewrite the correct ending manually.
  
  const endOfApp = `                </form>
              )}
            </div>
          </div>
        </div>
      )}

      {/* School Creation Modal */}
      {showSchoolModal && (
        <div className="modal-overlay">
          <div className="modal-content animate-scale">
            <h2>Créer un Établissement</h2>
            <p>Bienvenue ! Veuillez créer votre premier établissement pour commencer à utiliser l'application.</p>
            <form onSubmit={handleCreateSchool} style={{marginTop: 20}}>
              <div className="form-group">
                <label>Nom de l'établissement</label>
                <input type="text" name="name" className="form-input" required placeholder="Ex: École de l'Excellence" />
              </div>
              <button type="submit" className="btn btn-primary" style={{marginTop: 10, width: '100%'}}>Créer et Continuer</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default App;`;

  lines = lines.slice(0, lastFormIdx);
  let newContent = lines.join('\n') + '\n' + endOfApp;
  fs.writeFileSync(file, newContent);
  console.log('Force fixed app end');
}
