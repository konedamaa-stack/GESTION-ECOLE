const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/components/TeacherPortal.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// The original nav and start of portal-content:
/*
    <div className="student-portal">
      <nav className="portal-nav">
        <div className="portal-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: 24, height: 24, color: 'var(--primary-color)'}}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          Établissement
        </div>
        <div className="portal-nav-links">
          <button className={`portal-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>{t('teacher.tab_dashboard', "Tableau de Bord")}</button>
          <button className={`portal-nav-link ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}>{t('teacher.tab_evaluations', "Mes Évaluations")}</button>
          <button className={`portal-nav-link ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>{t('teacher.tab_students', "Mes Élèves")}</button>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{session.first_name} {session.last_name}</div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{t('teacher.teacher_of', "Professeur de")} {session.subject}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout} style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}><Icons.LogOut /> {t('app.logout', "Déconnexion")}</button>
        </div>
      </nav>

      <div className="portal-content">
*/

const searchRegex = /<nav className="portal-nav">[\s\S]*?<div className="portal-content">/;

const replaceStr = `<header style={{background: 'var(--surface-color)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: 40, height: 40, background: 'var(--primary-color)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
            👨‍🏫
          </div>
          <div>
            <h1 style={{margin: 0, fontSize: '1.2rem'}}>{t('teacher.portal_title', 'Portail Enseignant')}</h1>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Établissement</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{session.first_name} {session.last_name}</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{t('teacher.teacher_of', "Professeur de")} {session.subject}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout} style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}><Icons.LogOut /> {t('app.logout', 'Déconnexion')}</button>
        </div>
      </header>

      <main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap'}}>
          <button className={\`btn \${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}\`} onClick={() => setActiveTab('dashboard')}>{t('teacher.tab_dashboard', "Tableau de Bord")}</button>
          <button className={\`btn \${activeTab === 'evaluations' ? 'btn-primary' : 'btn-outline'}\`} onClick={() => setActiveTab('evaluations')}>{t('teacher.tab_evaluations', "Mes Évaluations")}</button>
          <button className={\`btn \${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}\`} onClick={() => setActiveTab('students')}>{t('teacher.tab_students', "Mes Élèves")}</button>
        </div>`;

if (searchRegex.test(content)) {
  content = content.replace(searchRegex, replaceStr);
  
  // also change the closing tags at the very end
  // from:
  //       </div>
  //     </div>
  //   );
  // }
  // to:
  //       </main>
  //     </div>
  //   );
  // }
  content = content.replace(/<\/div>\s*<\/div>\s*\);\s*}/, '</main>\n    </div>\n  );\n}');
  
  fs.writeFileSync(targetFile, content);
  console.log("TeacherPortal layout patched successfully.");
} else {
  console.log("Could not find the target layout structure in TeacherPortal.tsx.");
}
