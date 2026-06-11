const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const regexHeader = /<div className="topbar">[\s\S]*?<Icons.Menu \/>[\s\S]*?<\/button>[\s\S]*?<div className="search-bar">[\s\S]*?<\/div>[\s\S]*?<\/div>/;

if (!content.includes('setCurrentSchoolId(e.target.value)')) {
  const headerNew = `<div className="topbar">
          <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
            <button className="btn btn-outline" style={{padding: '8px'}} onClick={() => setSidebarOpen(!sidebarOpen)}>
              <Icons.Menu />
            </button>
            <div className="search-bar">
              <Icons.Search />
              <input type="text" placeholder={t('admin.search_ph', 'Rechercher un élève, une classe...')} />
            </div>
            
            {adminSchools.length > 0 && (
              <select 
                className="form-select" 
                style={{marginLeft: 16, maxWidth: 200, padding: '8px 12px'}}
                value={currentSchoolId || ''}
                onChange={(e) => setCurrentSchoolId(e.target.value)}
              >
                {adminSchools.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.9rem'}} onClick={() => setShowSchoolModal(true)}>
              + Établissement
            </button>
          </div>`;
  content = content.replace(regexHeader, headerNew);
  fs.writeFileSync(file, content);
  console.log("Header replaced");
} else {
  console.log("Header already replaced");
}
