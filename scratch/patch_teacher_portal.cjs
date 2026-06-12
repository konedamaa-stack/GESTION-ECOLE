const fs = require('fs');

let content = fs.readFileSync('src/components/TeacherPortal.tsx', 'utf8');

// 1. Add Icons definition after imports
const iconsDef = `
const Icons = {
  Home: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" /></svg>,
  Users: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  BookOpen: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  CheckCircle: () => <svg className="stat-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  FileText: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" /><polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  LogOut: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7"/><line strokeLinecap="round" strokeLinejoin="round" x1="21" y1="12" x2="9" y2="12"/></svg>,
};
`;

if (!content.includes('const Icons')) {
  content = content.replace("export default function TeacherPortal", iconsDef + "\nexport default function TeacherPortal");
}

// 2. Redesign the dashboard
const oldDashboardRegex = /\{activeTab === 'dashboard' && \([\s\S]*?(?=\{activeTab === 'evaluations')/;
const newDashboard = `{activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div style={{marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>
                  👨‍🏫
                </div>
                <div>
                  <h2 style={{color: 'white', margin: 0, fontSize: '1.8rem'}}>{t('teacher.welcome', "Bienvenue dans votre espace, {{name}}", {name: session.first_name})}</h2>
                  <p style={{margin: '8px 0 0 0', opacity: 0.9, fontSize: '1.05rem'}}>Gérez vos évaluations, saisissez les notes et suivez la progression de vos élèves en toute simplicité.</p>
                </div>
              </div>
            </div>

            <div className="stats-grid" style={{marginTop: '24px'}}>
              <div className="stat-card delay-100" style={{background: 'white', border: '1px solid var(--border-color)'}}>
                <div className="stat-header">
                  <span className="stat-label">{t('teacher.your_subject', "Votre Matière")}</span>
                  <Icons.BookOpen />
                </div>
                <div className="stat-value" style={{fontSize: '1.5rem', color: 'var(--primary-color)', marginTop: '8px'}}>{session.subject}</div>
                <div className="stat-trend trend-up">Spécialité</div>
              </div>
              <div className="stat-card delay-200" style={{background: 'white', border: '1px solid var(--border-color)'}}>
                <div className="stat-header">
                  <span className="stat-label">{t('teacher.created_evals', "Évaluations Créées")}</span>
                  <Icons.CheckCircle />
                </div>
                <div className="stat-value" style={{marginTop: '8px'}}>{formatNum(evaluationsData.length)}</div>
                <div className="stat-trend trend-up">Ce trimestre</div>
              </div>
            </div>

            <div className="panel delay-300" style={{marginTop: '24px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
              <div className="panel-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px'}}>
                <h3 className="panel-title" style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px'}}><Icons.Plus /> {t('teacher.create_eval', "Créer une nouvelle évaluation")}</h3>
              </div>
              <form onSubmit={handleCreateEvaluation}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.eval_title', "Titre de l'évaluation")}</label>
                    <input type="text" name="name" className="form-input" placeholder={t('teacher.eval_title_ph', "ex: Devoir Surveillé N°1")} required style={{width: '100%'}} />
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.class', "Classe")}</label>
                    <select name="class_id" className="form-input" required style={{width: '100%'}}>
                      <option value="">{t('teacher.select_class', "Sélectionner une classe")}</option>
                      {classesData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.period', "Période")}</label>
                    <select name="period" className="form-input" required style={{width: '100%'}}>
                      <option value="1er Trimestre">{t('teacher.term_1', "1er Trimestre")}</option>
                      <option value="2ème Trimestre">{t('teacher.term_2', "2ème Trimestre")}</option>
                      <option value="3ème Trimestre">{t('teacher.term_3', "3ème Trimestre")}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('admin.modals.eval_type', "Type d'évaluation")}</label>
                    <select name="type" className="form-input" required style={{width: '100%'}}>
                      <option value="Devoir de classe">Devoir de classe</option>
                      <option value="Devoir à la maison">Devoir à la maison</option>
                      <option value="Composition">Composition</option>
                      <option value="Examen blanc">Examen blanc</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.date', "Date")}</label>
                    <input type="date" name="date" className="form-input" required style={{width: '100%'}} />
                  </div>
                </div>
                <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end'}}>
                  <button type="submit" className="btn btn-primary" style={{padding: '12px 24px', fontSize: '1rem'}}><Icons.CheckCircle /> {t('teacher.btn_create', "Créer l'évaluation")}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        `;

content = content.replace(oldDashboardRegex, newDashboard);

// 3. Make Nav Link active styling more prominent if missing
content = content.replace(
  '<button className="btn btn-outline" onClick={onLogout}>{t(\'app.logout\', "Déconnexion")}</button>',
  '<button className="btn btn-outline" onClick={onLogout} style={{color: \'var(--danger-color)\', borderColor: \'var(--danger-color)\'}}><Icons.LogOut /> {t(\'app.logout\', "Déconnexion")}</button>'
);

// Form Inputs to class form-input instead of input-field for better styling using App CSS
content = content.replace(/className="input-field"/g, 'className="form-input"');

fs.writeFileSync('src/components/TeacherPortal.tsx', content);
console.log("Teacher portal patched successfully.");
