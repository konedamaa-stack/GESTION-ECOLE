const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const regex = /<button type="submit" className="btn btn-primary">Encaisser & Voir Reçu<\/button>\s*<\/div>\s*<\/form>\s*\}\)/;

code = code.replace(regex, `<button type="submit" className="btn btn-primary">Encaisser & Voir Reçu</button>
                  </div>
                </form>
                );
              })()}`);

fs.writeFileSync('src/App.tsx', code);
console.log('Fixed syntax error!');
