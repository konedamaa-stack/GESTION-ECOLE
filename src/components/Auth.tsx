import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import './Auth.css';

type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login';

export default function Auth({ onStudentLogin, onTeacherLogin, onBack, isSuperAdminFlow, onSuperAdminClick }: { onStudentLogin?: (student: any) => void, onTeacherLogin?: (teacher: any) => void, onBack?: () => void, isSuperAdminFlow?: boolean, onSuperAdminClick?: () => void }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'student_login') {
        const identifier = email.trim();
        const { data: students, error } = await supabase
          .from('students')
          .select('*')
          .eq('matricule', identifier.toUpperCase())
          .eq('password', password);
        
        if (error) throw error;
        if (!students || students.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (onStudentLogin) {
          onStudentLogin(students[0]);
        }
      } else if (mode === 'teacher_login') {
        const { data: teachers, error } = await supabase
          .from('teachers')
          .select('*')
          .eq('email', email)
          .eq('password', password);
        
        if (error) throw error;
        if (!teachers || teachers.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (onTeacherLogin) {
          onTeacherLogin(teachers[0]);
        }
      } else if (mode === 'register') {
        // 1. Sign up user
        const { error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        setMessage(t('auth.register_success', 'Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.'));
      } else if (mode === 'login') {
        const { error } = await supabase.auth.signInWithPassword({
          email,
          password,
        });
        if (error) throw error;
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage(t('auth.reset_link_sent', 'Un lien de réinitialisation a été envoyé à votre adresse email.'));
      }
    } catch (err: any) {
      setError(err.message || t('auth.generic_error', 'Une erreur est survenue.'));
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <h1 className="auth-title">{isSuperAdminFlow ? 'Portail SaaS' : t('auth.admin_title', 'Administration')}</h1>
            <p className="auth-subtitle">{isSuperAdminFlow ? 'Connectez-vous avec votre compte propriétaire' : t('auth.admin_subtitle', "Connectez-vous pour gérer l'établissement")}</p>
          </>
        );
      case 'teacher_login':
        return (
          <>
            <h1 className="auth-title">{t('auth.teacher_title', 'Espace Enseignant')}</h1>
            <p className="auth-subtitle">{t('auth.teacher_subtitle', "Saisissez vos notes et gérez vos classes.")}</p>
          </>
        );
      case 'student_login':
        return (
          <>
            <h1 className="auth-title">{t('auth.student_title', 'Espace Élève')}</h1>
            <p className="auth-subtitle">{t('auth.student_subtitle', "Consultez votre bulletin et emploi du temps.")}</p>
          </>
        );
      case 'register':
        return (
          <>
            <h1 className="auth-title">{t('auth.register_title', 'Créer un compte')}</h1>
            <p className="auth-subtitle">{t('auth.register_subtitle', "Rejoignez-nous dès aujourd'hui")}</p>
          </>
        );
      case 'forgot_password':
        return (
          <>
            <h1 className="auth-title">{t('auth.forgot_password_title', 'Mot de passe oublié ?')}</h1>
            <p className="auth-subtitle">{t('auth.forgot_password_subtitle', "Entrez votre email pour réinitialiser votre mot de passe")}</p>
          </>
        );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
        {onBack && (
          <button 
            onClick={onBack}
            style={{background: 'none', border: 'none', color: 'var(--text-secondary)', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '1.5rem', fontSize: '0.9rem', width: '100%', justifyContent: 'flex-start', padding: 0}}
          >
            ← Retour à l'accueil
          </button>
        )}
        <div className="auth-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
        </div>
        
        {/* Toggle Login Type */}
        <div style={{display: 'flex', gap: '4px', marginBottom: '24px', padding: '4px', background: 'var(--surface-color-hover)', borderRadius: '8px'}}>
          <button 
            className={`btn ${mode === 'login' ? 'btn-primary' : 'btn-outline'}`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'login' ? 'var(--primary-color)' : 'transparent', color: mode === 'login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('login')}
          >{t('auth.tab_admin', 'Admin')}</button>
          <button 
            className={`btn ${mode === 'teacher_login' ? 'btn-primary' : 'btn-outline'}`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'teacher_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'teacher_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('teacher_login')}
          >{t('auth.tab_teacher', 'Professeur')}</button>
          <button 
            className={`btn ${mode === 'student_login' ? 'btn-primary' : 'btn-outline'}`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'student_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'student_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('student_login')}
          >{t('auth.tab_student', 'Élève')}</button>
        </div>

        {renderContent()}

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleAuth} className="auth-form">
          {mode === 'student_login' || mode === 'teacher_login' ? (
            <>
              {mode === 'student_login' ? (
                <div className="auth-input-group">
                  <label>{t('auth.matricule_label', 'Matricule de l\'élève')}</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="Ex: ELV-2024-1234"
                    required
                  />
                </div>
              ) : (
                <div className="auth-input-group">
                  <label>{t('auth.email_label', 'Email')}</label>
                  <input
                    type="email"
                    className="auth-input"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder={t('auth.email_placeholder', "votre.email@ecole.com")}
                    required
                  />
                </div>
              )}
              <div className="auth-input-group">
                <label>{t('auth.password_label', 'Mot de passe')}</label>
                <input
                  type="password"
                  className="auth-input"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                />
              </div>
            </>
          ) : (
            <>
              <div className="auth-input-group">
                <label>{t('auth.admin_email_label', 'Email Administrateur')}</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecole.com"
                  required
                />
              </div>

              {mode !== 'forgot_password' && (
                <div className="auth-input-group">
                  <label>{t('auth.password_label', 'Mot de passe')}</label>
                  <input
                    type="password"
                    className="auth-input"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    required
                  />
                </div>
              )}
            </>
          )}

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? t('auth.loading', 'Chargement...') : mode === 'login' || mode === 'student_login' || mode === 'teacher_login' ? t('auth.btn_login', 'Se connecter') : mode === 'register' ? t('auth.btn_register', "S'inscrire") : t('auth.btn_send_link', 'Envoyer le lien')}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <>
              <button className="auth-link" onClick={() => handleModeSwitch('forgot_password')}>
                {t('auth.forgot_password_link', 'Mot de passe oublié ?')}
              </button>
              <button className="auth-link" onClick={() => handleModeSwitch('register')}>
                {t('auth.register_link', "S'inscrire")}
              </button>
            </>
          ) : mode !== 'student_login' && mode !== 'teacher_login' ? (
            <button className="auth-link" style={{ margin: '0 auto' }} onClick={() => handleModeSwitch('login')}>
              {t('auth.back_to_login', 'Retour à la connexion')}
            </button>
          ) : null}
        </div>
        
        {(!isSuperAdminFlow && onSuperAdminClick) && (
          <div style={{ marginTop: '24px', textAlign: 'center', borderTop: '1px solid var(--border-color)', paddingTop: '16px' }}>
            <button 
              className="auth-link" 
              style={{ color: '#8B5CF6', fontWeight: 600, margin: '0 auto', display: 'block' }} 
              onClick={(e) => { e.preventDefault(); onSuperAdminClick(); handleModeSwitch('login'); }}
            >
              🔐 Je suis le Propriétaire du SaaS
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
