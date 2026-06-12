const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

const selectHtml = `<select name="subject" className="form-input" required defaultValue={editEntity?.subject || ""}>
                        <option value="">Sélectionnez une matière</option>
                        <option value="Mathématiques">Mathématiques</option>
                        <option value="Français">Français</option>
                        <option value="Anglais">Anglais</option>
                        <option value="Histoire-Géographie">Histoire-Géographie</option>
                        <option value="Physique-Chimie">Physique-Chimie</option>
                        <option value="SVT">SVT</option>
                        <option value="EPS">EPS</option>
                        <option value="Philosophie">Philosophie</option>
                        <option value="Informatique">Informatique</option>
                        <option value="Espagnol">Espagnol</option>
                        <option value="Allemand">Allemand</option>
                        <option value="Arts Plastiques">Arts Plastiques</option>
                        <option value="Éducation Musicale">Éducation Musicale</option>
                      </select>`;

content = content.replace(/<input type="text" name="subject" className="form-input" required defaultValue=\{editEntity\?\.subject \|\| ""\} \/>/g, selectHtml);
content = content.replace(/<input type="text" name="subject" className="form-input" required placeholder="Ex: Mathématiques" \/>/g, selectHtml);

fs.writeFileSync(appPath, content);
console.log("Subjects patched in App.tsx");
