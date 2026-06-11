const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Find the header section exactly as it is now and replace it
const oldHeaderRegex = /<div className="header-search">[\s\S]*?\+ %tablissement\s*<\/button>\s*<\/div>/;

const newHeader = `<div className="header-search">
              <Icons.Search />
              <input type="text" placeholder={t('admin.header.search', 'Rechercher...')} />
            </div>
            <div style={{display: 'flex', gap: '10px', marginLeft: '20px'}}>
              {adminSchools && adminSchools.length > 0 && (
                <select 
                  className="form-select" 
                  style={{padding: '8px 12px', border: '2px solid var(--primary-color)', borderRadius: '6px', background: 'var(--surface-color)', color: 'var(--text-color)'}}
                  value={currentSchoolId || ''}
                  onChange={(e) => setCurrentSchoolId(e.target.value)}
                >
                  {adminSchools.map((s: any) => (
                    <option key={s.id} value={s.id}>{s.name}</option>
                  ))}
                </select>
              )}
              <button 
                type="button" 
                onClick={() => setShowSchoolModal(true)} 
                style={{
                  background: '#ff4b4b', 
                  color: 'white', 
                  padding: '8px 16px', 
                  borderRadius: '6px', 
                  fontWeight: 'bold', 
                  border: 'none', 
                  cursor: 'pointer',
                  boxShadow: '0 4px 6px rgba(255, 75, 75, 0.3)'
                }}
              >
                + CRÉER ÉTABLISSEMENT
              </button>
            </div>
          </div>`;

if (content.match(oldHeaderRegex)) {
  content = content.replace(oldHeaderRegex, newHeader);
  fs.writeFileSync(file, content);
  console.log("Successfully replaced header with highly visible red button.");
} else {
  console.log("Regex did not match. Let's try to find it dynamically.");
  // Find where it is and replace
  const startIdx = content.indexOf('<div className="header-search">');
  const endIdx = content.indexOf('<div className="header-actions">');
  
  if (startIdx > -1 && endIdx > -1 && startIdx < endIdx) {
    const stringToReplace = content.substring(startIdx, endIdx);
    // The string ends with `</div>` usually.
    const lastDivIdx = stringToReplace.lastIndexOf('</div>');
    const actualString = stringToReplace.substring(0, lastDivIdx + 6);
    content = content.replace(actualString, newHeader + '\n          ');
    fs.writeFileSync(file, content);
    console.log("Successfully replaced header using index-based slicing.");
  } else {
    console.log("Could not find the target text!");
  }
}
