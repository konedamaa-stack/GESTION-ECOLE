const fs = require('fs');

let content = fs.readFileSync('src/components/Auth.tsx', 'utf8');

// 1. Update AuthMode type
content = content.replace(
  `type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login';`,
  `type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login' | 'committee_login';`
);

// 2. Add auth handle for committee
const handleLoginLogic = `      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;`;
const handleLoginLogicNew = `      } else if (mode === 'login' || mode === 'committee_login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;`;
content = content.replace(handleLoginLogic, handleLoginLogicNew);

// 3. Add renderContent case for committee
const renderContentAdmin = `      case 'login':
        return (
          <>
            <h1 className="auth-title">{t('auth.admin_title', 'Administration')}</h1>
            <p className="auth-subtitle">{t('auth.admin_subtitle', "Connectez-vous pour gérer l'établissement")}</p>
          </>
        );`;
const renderContentAdminNew = `      case 'login':
        return (
          <>
            <h1 className="auth-title">{t('auth.admin_title', 'Administration')}</h1>
            <p className="auth-subtitle">{t('auth.admin_subtitle', "Connectez-vous pour gérer l'établissement")}</p>
          </>
        );
      case 'committee_login':
        return (
          <>
            <h1 className="auth-title">Comité d'examen</h1>
            <p className="auth-subtitle">Espace réservé au comité d'examen</p>
          </>
        );`;
content = content.replace(renderContentAdmin, renderContentAdminNew);

// 4. Add the Tab button
const studentTab = `          <button 
            className={\`btn \${mode === 'student_login' ? 'btn-primary' : 'btn-outline'}\`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'student_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'student_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('student_login')}
          >{t('auth.tab_student', 'Élève')}</button>`;

const studentTabNew = `          <button 
            className={\`btn \${mode === 'student_login' ? 'btn-primary' : 'btn-outline'}\`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'student_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'student_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('student_login')}
          >{t('auth.tab_student', 'Élève')}</button>
          <button 
            className={\`btn \${mode === 'committee_login' ? 'btn-primary' : 'btn-outline'}\`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'committee_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'committee_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('committee_login')}
          >Comité d'examen</button>`;
content = content.replace(studentTab, studentTabNew);

// 5. Update input labels
const adminLabel = `<label>{t('auth.admin_email_label', 'Email Administrateur')}</label>`;
const adminLabelNew = `<label>{mode === 'committee_login' ? 'Email du Comité' : t('auth.admin_email_label', 'Email Administrateur')}</label>`;
content = content.replace(adminLabel, adminLabelNew);

// 6. Update submit button logic
const submitLogic = `mode === 'login' || mode === 'student_login' || mode === 'teacher_login' ?`;
const submitLogicNew = `mode === 'login' || mode === 'student_login' || mode === 'teacher_login' || mode === 'committee_login' ?`;
content = content.replace(submitLogic, submitLogicNew);

// 7. Update back to login link
const backLogic = `mode !== 'student_login' && mode !== 'teacher_login' ?`;
const backLogicNew = `mode !== 'student_login' && mode !== 'teacher_login' && mode !== 'committee_login' ?`;
content = content.replace(backLogic, backLogicNew);

fs.writeFileSync('src/components/Auth.tsx', content);
console.log('Auth.tsx patched');
