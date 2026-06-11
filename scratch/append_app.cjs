const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const endOfApp = `      {/* School Creation Modal */}
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

export default App;
`;

// Find the last index of `  );`
const lastParenIdx = content.lastIndexOf('  );');
if (lastParenIdx !== -1) {
  // Find the `</div>` before it
  const lastDivIdx = content.lastIndexOf('</div>', lastParenIdx);
  if (lastDivIdx !== -1) {
    // Truncate EVERYTHING from `</div>` onwards
    content = content.substring(0, lastDivIdx);
    
    // Add `    </div>\n` and then our modal + end of file.
    // Actually our endOfApp already has `    </div>\n  );\n}\n\nexport default App;\n`.
    // Wait! In the original code, `</div>` is the closing tag for `<div className="app-container">`.
    // My `endOfApp` provides `    </div>\n  );\n}\n\nexport default App;\n` which closes `<div className="app-container">` and the component `App`.
    // BUT what if there were TWO `</div>` tags?
    // Let's just look at `lastDivIdx`. 
    // It's the `</div>` just before `);`. We can replace EVERYTHING starting from `lastDivIdx` with `endOfApp`.
    
    // BUT wait! Does my `endOfApp` start with `    </div>`? No, it starts with `      {/* School Creation Modal */}` and then ends with `    </div>\n  );\n}\n\nexport default App;\n`.
    // So the `</div>` we delete MUST BE ADDED BACK at the end! Yes!
    
    content = content + '\\n' + endOfApp;
    fs.writeFileSync(file, content);
    console.log('Fixed exactly!');
  }
}
