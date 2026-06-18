const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');
let changed = false;

// 1. Insert handleYearTransition just before renderSettings
const findRenderSettings = "  const renderSettings = () => (";
if (content.includes(findRenderSettings)) {
  const insertCode = `  const handleYearTransition = async () => {
    if (!window.confirm("ATTENTION IRRÉVERSIBLE !\\n\\nCette action va :\\n1. Passer TOUS les élèves actuellement 'Inscrits' en statut 'Ancien élève'.\\n2. Passer l'année académique à l'année suivante.\\n\\nVous devrez réinscrire les élèves manuellement.\\nVoulez-vous vraiment clôturer l'année scolaire ?")) return;
    
    try {
        const currentYear = settingsData?.academic_year || '2025-2026';
        const parts = currentYear.split('-');
        let nextYear = '2026-2027';
        if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
            nextYear = \`\${parseInt(parts[0])+1}-\${parseInt(parts[1])+1}\`;
        }
        
        // Update all active students to Ancien eleve
        const { error: stuErr } = await supabase.from('students').update({ status: 'Ancien élève' }).eq('status', 'Inscrit').eq('school_id', currentSchoolId as string);
        if (stuErr) throw stuErr;
        
        // Update setting
        const { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).single();
        if (existing) {
          const { error: setErr } = await supabase.from('school_settings').update({ academic_year: nextYear }).eq('school_id', currentSchoolId as string);
          if (setErr) throw setErr;
        } else {
          const { error: setErr } = await supabase.from('school_settings').insert([{ academic_year: nextYear, school_id: currentSchoolId as string }]);
          if (setErr) throw setErr;
        }
        
        alert("Année scolaire clôturée avec succès ! La nouvelle année est " + nextYear);
        fetchSettings();
        fetchStudents();
    } catch (err: any) {
        alert("Erreur: " + err.message);
    }
  };

  const renderSettings = () => (`;
  
  if (!content.includes('const handleYearTransition')) {
      content = content.replace(findRenderSettings, insertCode);
      changed = true;
      console.log("Added handleYearTransition");
  }
}

// 2. Modify Academic Settings UI
const findAcademicUI = `<h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.acad_title', 'Paramètres Pédagogiques')}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.acad_year', 'Année Scolaire en cours')}</label>
                  <select className="form-select">
                    <option>{formatNum(2026)} - {formatNum(2027)}</option>
                    <option>{formatNum(2025)} - {formatNum(2026)}</option>
                  </select>
                </div>`;
                
if (content.includes(findAcademicUI)) {
  const replaceAcademicUI = `<h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.acad_title', 'Paramètres Pédagogiques')}</h3>
              
              <div style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', marginBottom: '24px'}}>
                <h4 style={{color: '#d97706', margin: '0 0 8px 0'}}>Clôture et Changement d'Année Scolaire</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px 0'}}>
                  Année en cours : <strong>{settingsData?.academic_year || '2025-2026'}</strong><br/>
                  Utilisez ce bouton en fin d'année pour basculer tous les élèves "Inscrits" en "Ancien élève" et avancer l'année académique.
                </p>
                <button className="btn btn-primary" style={{background: '#d97706', borderColor: '#d97706'}} onClick={handleYearTransition}>
                  Clôturer l'année {settingsData?.academic_year || '2025-2026'}
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.acad_year', 'Année Scolaire (Lecture Seule)')}</label>
                  <input type="text" className="form-input" disabled value={settingsData?.academic_year || '2025-2026'} />
                </div>`;
  content = content.replace(findAcademicUI, replaceAcademicUI);
  changed = true;
  console.log("Updated Academic UI");
} else {
  console.log("Could not find academic UI");
}

if (changed) {
  fs.writeFileSync(targetFile, content);
  console.log("App.tsx saved!");
}
