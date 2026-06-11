const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

// Find the line that has "activeModal === 'schedule'"
const scheduleLineIdx = lines.findIndex(l => l.includes("activeModal === 'schedule'"));
if (scheduleLineIdx !== -1) {
  // We want to keep everything until the closing </form> of the schedule modal
  let formEndIdx = -1;
  for (let i = scheduleLineIdx; i < lines.length; i++) {
    if (lines[i].includes('</form>')) {
      formEndIdx = i;
      break;
    }
  }

  if (formEndIdx !== -1) {
    lines = lines.slice(0, formEndIdx + 1);
    
    // Now append the exact correct closing tags
    const endOfApp = `              )}
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

    let newContent = lines.join('\n') + '\n' + endOfApp;
    fs.writeFileSync(file, newContent);
    console.log('Cleaned and fixed app end');
  }
}
