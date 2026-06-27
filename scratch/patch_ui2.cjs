const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(appPath, 'utf8');

const targetStr = `<div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>
                      <input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue={editEntity?.matricule || ""} />`;

const replacementStr = `<div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.photo', 'Photo de profil')}</label>
                      <input type="file" name="photo" accept="image/*" className="form-input" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>
                      <input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue={editEntity?.matricule || ""} />`;

// Handle CRLF vs LF by replacing all \r\n with \n in the target string before matching,
// or just do a flexible index-of. Since we had CRLF in targetStr, let's normalize the file content to LF temporarily.
const normalizedContent = content.replace(/\r\n/g, '\n');
const normalizedTarget = targetStr.replace(/\r\n/g, '\n');

if (normalizedContent.includes(normalizedTarget)) {
  const newContent = normalizedContent.replace(normalizedTarget, replacementStr.replace(/\r\n/g, '\n'));
  fs.writeFileSync(appPath, newContent);
  console.log("UI patched successfully for real!");
} else {
  console.log("Could not find the target string!");
}
