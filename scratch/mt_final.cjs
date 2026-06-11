const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 2. Fetch Schools Logic
const initLogicOld = /useEffect\(\(\) => \{\s*if \(session\) \{\s*fetchStudents\(\);\s*fetchClasses\(\);\s*fetchTeachers\(\);\s*fetchEmployees\(\);\s*fetchParents\(\);\s*fetchInvoices\(\);\s*fetchAbsences\(\);\s*fetchSchedules\(\);\s*fetchEvaluations\(\);\s*fetchSettings\(\);\s*\}\s*\}, \[session\]\);/;

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

content = content.replace(initLogicOld, initLogicNew);

// 3. Add .eq('school_id', currentSchoolId) to ALL fetch functions
const fetchFunctions = [
  { old: ".from('students').select(`*, classes ( name )`)", new: ".from('students').select(`*, classes ( name )`).eq('school_id', currentSchoolId)" },
  { old: ".from('classes').select('*')", new: ".from('classes').select('*').eq('school_id', currentSchoolId)" },
  { old: ".from('teachers').select('*')", new: ".from('teachers').select('*').eq('school_id', currentSchoolId)" },
  { old: ".from('parents').select('*')", new: ".from('parents').select('*').eq('school_id', currentSchoolId)" },
  { old: ".from('employees').select('*')", new: ".from('employees').select('*').eq('school_id', currentSchoolId)" },
  { old: ".from('invoices').select(`*, students ( first_name, last_name, matricule )`)", new: ".from('invoices').select(`*, students ( first_name, last_name, matricule )`).eq('school_id', currentSchoolId)" },
  { old: ".from('absences').select(`*, students ( first_name, last_name, matricule )`)", new: ".from('absences').select(`*, students ( first_name, last_name, matricule )`).eq('school_id', currentSchoolId)" },
  { old: ".from('schedules').select(`*, classes ( name )`)", new: ".from('schedules').select(`*, classes ( name )`).eq('school_id', currentSchoolId)" },
  { old: ".from('evaluations').select(`*, classes ( name )`)", new: ".from('evaluations').select(`*, classes ( name )`).eq('school_id', currentSchoolId)" },
  { old: ".from('school_settings').select('*')", new: ".from('school_settings').select('*').eq('school_id', currentSchoolId)" },
];

for (const fn of fetchFunctions) {
  content = content.split(fn.old).join(fn.new);
}

// 4. Update Inserts to include school_id
content = content.replace("await supabase.from('classes').insert([{ \n          name: className, \n          level: classLevel || 'Non défini',\n          }]);", "await supabase.from('classes').insert([{ \n          name: className, \n          level: classLevel || 'Non défini',\n          school_id: currentSchoolId\n          }]);");
content = content.replace("const student = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          matricule: matricule,\n          class_id: formData.get('class_id'),\n          birth_date: formData.get('birth_date'),\n          email: formData.get('email'),\n          password: password,\n        };", "const student = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          matricule: matricule,\n          class_id: formData.get('class_id'),\n          birth_date: formData.get('birth_date'),\n          email: formData.get('email'),\n          password: password,\n          school_id: currentSchoolId\n        };");
content = content.replace("const parent = {\n            first_name: formData.get('parent_first_name'),\n            last_name: formData.get('parent_last_name'),\n            phone: formData.get('parent_phone'),\n            email: formData.get('parent_email'),\n          };", "const parent = {\n            first_name: formData.get('parent_first_name'),\n            last_name: formData.get('parent_last_name'),\n            phone: formData.get('parent_phone'),\n            email: formData.get('parent_email'),\n            school_id: currentSchoolId\n          };");
content = content.replace("const invoice = {\n            student_id: newStudentId,\n            amount: formData.get('reg_fee_amount'),\n            motif: 'Frais d\\'inscription et Scolarité',\n            payment_method: formData.get('reg_fee_method'),\n            status: 'Payée',\n            invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),\n          };", "const invoice = {\n            student_id: newStudentId,\n            amount: formData.get('reg_fee_amount'),\n            motif: 'Frais d\\'inscription et Scolarité',\n            payment_method: formData.get('reg_fee_method'),\n            status: 'Payée',\n            invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),\n            school_id: currentSchoolId\n          };");
content = content.replace("const teacher = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          subject: formData.get('subject'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          matricule: teacherMatricule,\n          password: password,\n        };", "const teacher = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          subject: formData.get('subject'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          matricule: teacherMatricule,\n          password: password,\n          school_id: currentSchoolId\n        };");
content = content.replace("const employee = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          role: formData.get('role'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n        };", "const employee = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          role: formData.get('role'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          school_id: currentSchoolId\n        };");
content = content.replace("const parentData = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          phone: formData.get('phone'),\n          email: formData.get('email')\n        };", "const parentData = {\n          first_name: formData.get('first_name'),\n          last_name: formData.get('last_name'),\n          phone: formData.get('phone'),\n          email: formData.get('email'),\n          school_id: currentSchoolId\n        };");
content = content.replace("await supabase.from('student_documents').insert([{\n        student_id: selectedStudent.id,\n        document_type: documentType,\n        document_name: documentName,\n        file_path: publicUrl\n      }]);", "await supabase.from('student_documents').insert([{\n        student_id: selectedStudent.id,\n        document_type: documentType,\n        document_name: documentName,\n        file_path: publicUrl,\n        school_id: currentSchoolId\n      }]);");
content = content.replace("await supabase.from('schedules').insert([{ ...scheduleData }]);", "await supabase.from('schedules').insert([{ ...scheduleData, school_id: currentSchoolId }]);");
content = content.replace("await supabase.from('evaluations').insert([{ \n        title, \n        class_id, \n        date, \n        type: evalType \n      }]);", "await supabase.from('evaluations').insert([{ \n        title, \n        class_id, \n        date, \n        type: evalType,\n        school_id: currentSchoolId \n      }]);");

// 5. Replace UI Header
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
  // Also try replacing header-search if topbar regex fails
  const regexHeaderSearch = /<div className="header-search">[\s\S]*?<\/div>\n\s*<\/div>/;
  if (regexHeaderSearch.test(content) && !content.includes('setCurrentSchoolId(e.target.value)')) {
      const headerSearchNew = `<div className="header-search">
              <Icons.Search />
              <input type="text" placeholder={t('admin.header.search', 'Rechercher...')} />
            </div>
            {adminSchools.length > 0 && (
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
      content = content.replace(regexHeaderSearch, headerSearchNew);
  }
}

// 6. Replace End of file
const endOfFileIndex = content.lastIndexOf('export default App;');
if (endOfFileIndex !== -1 && !content.includes('School Creation Modal')) {
  let endText = content.substring(content.lastIndexOf('</div>', endOfFileIndex) - 10, endOfFileIndex);
  content = content.substring(0, endOfFileIndex).trim();
  
  if (content.endsWith('}')) {
    content = content.substring(0, content.lastIndexOf('}'));
  }
  if (content.endsWith(';')) {
    content = content.substring(0, content.lastIndexOf(';'));
  }
  if (content.endsWith(')')) {
    content = content.substring(0, content.lastIndexOf(')'));
  }
  if (content.endsWith('}')) {
    content = content.substring(0, content.lastIndexOf('}'));
  }
  if (content.endsWith('div>')) {
    content = content.substring(0, content.lastIndexOf('</div>'));
  }
  
  // Clean up
  const endOfApp = `
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

  // We find the last <main className="main-content"> closing div. Wait, it's easier to just use string replace.
  const regexEnd = /\s*<\/div>\n\s*\);\n\s*\}\n*$/;
  content = content.replace(regexEnd, endOfApp);
}

fs.writeFileSync(file, content);
console.log('Done mt_final');
