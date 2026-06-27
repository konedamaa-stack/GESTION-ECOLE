import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import './Auth.css';

type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login' | 'committee_login' | 'accept_invite';

export default function Auth({ onStudentLogin, onTeacherLogin, onCommitteeLogin, onBack }: { onStudentLogin?: (student: any) => void, onTeacherLogin?: (teacher: any) => void, onCommitteeLogin?: (committee: any) => void, onBack?: () => void }) {
  const { t } = useTranslation();
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingProfiles, setPendingProfiles] = useState<any[] | null>(null);
  const [pendingMode, setPendingMode] = useState<AuthMode | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  useEffect(() => {
    const checkInvite = async () => {
      const urlParams = new URLSearchParams(window.location.search);
      const inviteId = urlParams.get('invite');
      if (inviteId) {
        setLoading(true);
        const { data, error } = await supabase.from('admin_invitations').select('*, schools(name)').eq('id', inviteId).single();
        if (data && !error) {
          setInviteDetails(data);
          setEmail(data.email);
          setMode('accept_invite');
        } else {
          setError("Ce lien d'invitation est invalide ou expiré.");
        }
        setLoading(false);
      }
    };
    checkInvite();
  }, []);

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
          .select('*, schools(name)')
          .eq('matricule', identifier.toUpperCase())
          .eq('password', password);
        
        if (error) throw error;
        if (!students || students.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (students.length > 1) {
          setPendingProfiles(students);
          setPendingMode(mode);
          setLoading(false);
          return;
        }
        if (onStudentLogin) {
          onStudentLogin(students[0]);
        }
      } else if (mode === 'teacher_login') {
        const { data: teachers, error } = await supabase
          .from('teachers')
          .select('*, schools(name)')
          .eq('email', email)
          .eq('password', password);
        
        if (error) throw error;
        if (!teachers || teachers.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (teachers.length > 1) {
          setPendingProfiles(teachers);
          setPendingMode(mode);
          setLoading(false);
          return;
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
      } else if (mode === 'accept_invite') {
        if (!inviteDetails) throw new Error("Détails de l'invitation introuvables.");
        
        // Register the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        
        if (authError) {
          // If user already exists, they might just need to sign in
          if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email, password });
            if (signInError) throw new Error("Ce compte existe déjà. Veuillez utiliser le bon mot de passe, ou réinitialisez-le d'abord.");
            
            // Re-fetch user to get their ID since signUp failed
            const { data: userSession } = await supabase.auth.getSession();
            if (userSession.session?.user.id) {
              await supabase.from('school_admins').insert({
                user_id: userSession.session.user.id,
                school_id: inviteDetails.school_id,
                role: inviteDetails.role
              });
              await supabase.from('admin_invitations').delete().eq('id', inviteDetails.id);
              // Clean up URL
              window.history.replaceState({}, document.title, window.location.pathname);
              return; // Successfully linked existing account
            }
          } else {
            throw authError;
          }
        }
        
        // If sign up succeeded and we have a user ID (even if email confirmation is required)
        if (authData.user) {
          await supabase.from('school_admins').insert({
            user_id: authData.user.id,
            school_id: inviteDetails.school_id,
            role: inviteDetails.role
          });
          await supabase.from('admin_invitations').delete().eq('id', inviteDetails.id);
          
          if (authData.session) {
            // Already logged in
            window.history.replaceState({}, document.title, window.location.pathname);
          } else {
            setMessage(t('auth.register_success', 'Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.'));
          }
        }
      } else if (mode === 'committee_login') {
        const { data: committee, error } = await supabase
          .from('committee_members')
          .select('*')
          .eq('email', email)
          .eq('password', password);
        
        if (error) throw error;
        if (!committee || committee.length === 0) {
          throw new Error(t('auth.invalid_credentials', "Email ou mot de passe incorrect."));
        }
        if (committee.length > 1) {
          setPendingProfiles(committee);
          setPendingMode(mode);
          setLoading(false);
          return;
        }
        if (onCommitteeLogin) {
          onCommitteeLogin(committee[0]);
        }
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
      case 'accept_invite':
        return (
          <>
            <h1 className="auth-title">Invitation reçue !</h1>
            <p className="auth-subtitle">Vous avez été invité(e) à rejoindre l'école <strong>{inviteDetails?.schools?.name}</strong>. Créez votre mot de passe pour accepter.</p>
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

  if (pendingProfiles) {
    return (
      <div className="auth-container">
        <div className="auth-card">
          <h1 className="auth-title">Sélectionnez votre établissement</h1>
          <p className="auth-subtitle">Votre compte est associé à plusieurs établissements. Veuillez choisir celui auquel vous souhaitez vous connecter.</p>
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', marginTop: '24px' }}>
            {pendingProfiles.map(profile => (
              <button 
                key={profile.id} 
                className="btn btn-outline" 
                style={{ textAlign: 'left', padding: '16px', justifyContent: 'flex-start' }}
                onClick={() => {
                  if (pendingMode === 'teacher_login' && onTeacherLogin) onTeacherLogin(profile);
                  if (pendingMode === 'committee_login' && onCommitteeLogin) onCommitteeLogin(profile);
                  if (pendingMode === 'student_login' && onStudentLogin) onStudentLogin(profile);
                  setPendingProfiles(null);
                }}
              >
                <div style={{ fontWeight: 'bold', fontSize: '1.1rem', marginBottom: '4px' }}>
                  {profile.schools?.name || 'Établissement inconnu'}
                </div>
                {profile.role && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Rôle : {profile.role}</div>}
                {profile.subject && <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>Matière : {profile.subject}</div>}
              </button>
            ))}
          </div>
          <button className="auth-link" style={{ margin: '24px auto 0', display: 'block' }} onClick={() => setPendingProfiles(null)}>
            Annuler
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="auth-container">
      <div className="auth-card">
        {onBack && (
          <button 
            onClick={onBack}
            style={{
              background: 'var(--surface-color-hover)', 
              border: '1px solid var(--border-color)', 
              borderRadius: '8px',
              color: 'var(--text-color)', 
              cursor: 'pointer', 
              display: 'inline-flex', 
              alignItems: 'center', 
              gap: '8px', 
              marginBottom: '1.5rem', 
              fontSize: '0.9rem', 
              padding: '8px 16px',
              fontWeight: 500,
              transition: 'all 0.2s'
            }}
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
        {mode !== 'accept_invite' && (
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
            <button 
              className={`btn ${mode === 'committee_login' ? 'btn-primary' : 'btn-outline'}`} 
              style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'committee_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'committee_login' ? 'white' : 'var(--text-secondary)'}}
              onClick={() => handleModeSwitch('committee_login')}
            >Comité d'examen</button>
          </div>
        )}

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
                <label>{mode === 'committee_login' ? 'Email du Comité' : t('auth.admin_email_label', 'Email Administrateur')}</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecole.com"
                  disabled={mode === 'accept_invite'}
                  style={mode === 'accept_invite' ? { background: 'var(--surface-color-hover)', cursor: 'not-allowed' } : {}}
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
            {loading ? t('auth.loading', 'Chargement...') : mode === 'login' || mode === 'student_login' || mode === 'teacher_login' || mode === 'committee_login' ? t('auth.btn_login', 'Se connecter') : mode === 'register' ? t('auth.btn_register', "S'inscrire") : mode === 'accept_invite' ? "Accepter l'invitation" : t('auth.btn_send_link', 'Envoyer le lien')}
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
          ) : mode !== 'student_login' && mode !== 'teacher_login' && mode !== 'committee_login' ? (
            <button className="auth-link" style={{ margin: '0 auto' }} onClick={() => handleModeSwitch('login')}>
              {t('auth.back_to_login', 'Retour à la connexion')}
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
