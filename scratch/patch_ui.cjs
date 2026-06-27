const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

// The block to match (using regex for flexibility on line endings)
const regex = /<div className="form-grid">\s*<div className="form-group">\s*<label>Matricule \(optionnel\)<\/label>\s*<input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue=\{editEntity\?\.matricule \|\| ""\} \/>/g;

const replacement = `<div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.photo', 'Photo de profil')}</label>
                      <input type="file" name="photo" accept="image/*" className="form-input" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>
                      <input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue={editEntity?.matricule || ""} />`;

if (regex.test(content)) {
  content = content.replace(regex, replacement);
  fs.writeFileSync(appPath, content);
  console.log("UI patched successfully!");
} else {
  console.log("Could not find the target string!");
}
