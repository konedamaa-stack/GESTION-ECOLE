const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Replace useEffect session
const regexUseEffect = /useEffect\(\(\) => \{\s*if \(session\) \{[\s\S]*?fetchSettings\(\);\s*\}\s*\}, \[session\]\);/g;
if (regexUseEffect.test(content)) {
  const initLogicNew = `  useEffect(() => {
    if (session) {
      loadSchools();
    }
  }, [session]);

  const loadSchools = async () => {
    if (!session) return;
    const { data: adminLinks } = await supabase.from('school_admins').select('school_id, schools(*)').eq('user_id', session.user.id);
    if (adminLinks && adminLinks.length > 0) {
      const schools = adminLinks.map((link: any) => link.schools);
      setAdminSchools(schools);
      setCurrentSchoolId(schools[0].id);
    } else {
      setShowSchoolModal(true);
    }
  };

  useEffect(() => {
    if (currentSchoolId) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchEmployees();
      fetchParents();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    }
  }, [currentSchoolId]);`;
  content = content.replace(regexUseEffect, initLogicNew);
  console.log("Replaced useEffect session");
} else {
  // Maybe it's already loadSchools?
  console.log("Regex UseEffect did not match");
}

// 2. Replace UI Modal
const regexModal = /\{\/\* Modals \*\/\}/;
if (!content.includes('showSchoolModal &&')) {
  const schoolModalUI = `
      {/* Modals */}
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
`;
  content = content.replace(regexModal, schoolModalUI);
  console.log("Replaced UI Modal");
}

// 3. Replace UI Header
const regexHeader = /<div className="topbar">[\s\S]*?<Icons.Menu \/>[\s\S]*?<\/button>[\s\S]*?<div className="search-bar">[\s\S]*?<\/div>[\s\S]*?<\/div>/;
if (!content.includes('select')) {
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
  console.log("Replaced Header");
}

fs.writeFileSync(file, content);
console.log("Fix done");
