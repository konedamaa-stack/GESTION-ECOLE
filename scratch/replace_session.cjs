const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const target = `  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchEmployees();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    }
  }, [session]);`;

const targetWithParents = `  useEffect(() => {
    if (session) {
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
  }, [session]);`;

const targetWithParentsData = `  useEffect(() => {
    if (session) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchEmployees();
      fetchParentsData();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    }
  }, [session]);`;

const replacement = `  useEffect(() => {
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
      if (typeof fetchParents === 'function') fetchParents();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    }
  }, [currentSchoolId]);`;

// replace whatever it is
if (content.includes(target)) content = content.replace(target, replacement);
else if (content.includes(targetWithParents)) content = content.replace(targetWithParents, replacement);
else if (content.includes(targetWithParentsData)) content = content.replace(targetWithParentsData, replacement);
else {
  // Try regex
  const regex = /useEffect\(\(\) => \{\s*if \(session\) \{\s*(fetch[A-Za-z]+\(\);\s*)+\}\s*\}, \[session\]\);/;
  content = content.replace(regex, replacement);
}

// 2. Fix the header
const headerRegex = /<div className="header-search">[\s\S]*?<\/div>\s*<\/div>/;
const headerReplacement = `<div className="header-search">
              <Icons.Search />
              <input type="text" placeholder={t('admin.header.search', 'Rechercher...')} />
            </div>
            {adminSchools && adminSchools.length > 0 && (
              <select 
                className="form-select" 
                style={{marginLeft: 16, maxWidth: 200, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--surface-color)', color: 'var(--text-color)'}}
                value={currentSchoolId || ''}
                onChange={(e) => setCurrentSchoolId(e.target.value)}
              >
                {adminSchools.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.9rem', marginLeft: '8px'}} onClick={() => setShowSchoolModal(true)}>
              + Établissement
            </button>
          </div>`;
          
if (!content.includes('setShowSchoolModal(true)')) {
  // It is included in loadSchools! So check for `<select`
  // Actually, wait, it might be in `App.tsx` already if I ran a previous script.
}

if (!content.includes('onChange={(e) => setCurrentSchoolId(e.target.value)}')) {
  content = content.replace(headerRegex, headerReplacement);
}

fs.writeFileSync(file, content);
console.log('Done');
