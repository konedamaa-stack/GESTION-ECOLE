import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login';

export default function Auth({ onStudentLogin, onTeacherLogin }: { onStudentLogin?: (student: any) => void, onTeacherLogin?: (teacher: any) => void }) {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [schoolName, setSchoolName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleModeSwitch = (newMode: AuthMode) => {
    setMode(newMode);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    setSchoolName('');
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'student_login') {
        const { data: students, error } = await supabase
          .from('students')
          .select('*')
          .eq('email', email)
          .eq('password', password);
        
        if (error) throw error;
        if (!students || students.length === 0) {
          throw new Error("Email ou mot de passe incorrect.");
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
          throw new Error("Email ou mot de passe incorrect.");
        }
        if (onTeacherLogin) {
          onTeacherLogin(teachers[0]);
        }
      } else if (mode === 'register') {
        // 1. Sign up user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email,
          password,
        });
        if (authError) throw authError;

        if (authData.user) {
          // 2. Create school
          const { data: schoolData, error: schoolError } = await supabase
            .from('schools')
            .insert([{ name: schoolName }])
            .select()
            .single();
          
          if (schoolError) throw schoolError;

          // 3. Link user to school
          const { error: linkError } = await supabase
            .from('school_admins')
            .insert([{ user_id: authData.user.id, school_id: schoolData.id }]);
          
          if (linkError) throw linkError;
        }

        setMessage('Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.');
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
        setMessage('Un lien de réinitialisation a été envoyé à votre adresse email.');
      }
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    switch (mode) {
      case 'login':
        return (
          <>
            <h1 className="auth-title">Administration</h1>
            <p className="auth-subtitle">Connectez-vous pour gérer l'établissement</p>
          </>
        );
      case 'teacher_login':
        return (
          <>
            <h1 className="auth-title">Espace Enseignant</h1>
            <p className="auth-subtitle">Saisissez vos notes et gérez vos classes.</p>
          </>
        );
      case 'student_login':
        return (
          <>
            <h1 className="auth-title">Espace Élève</h1>
            <p className="auth-subtitle">Consultez votre bulletin et emploi du temps.</p>
          </>
        );
      case 'register':
        return (
          <>
            <h1 className="auth-title">Créer un compte</h1>
            <p className="auth-subtitle">Rejoignez SGES Pro dès aujourd'hui</p>
          </>
        );
      case 'forgot_password':
        return (
          <>
            <h1 className="auth-title">Mot de passe oublié ?</h1>
            <p className="auth-subtitle">Entrez votre email pour réinitialiser votre mot de passe</p>
          </>
        );
    }
  };

  return (
    <div className="auth-container">
      <div className="auth-card">
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
          >Admin</button>
          <button 
            className={`btn ${mode === 'teacher_login' ? 'btn-primary' : 'btn-outline'}`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'teacher_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'teacher_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('teacher_login')}
          >Professeur</button>
          <button 
            className={`btn ${mode === 'student_login' ? 'btn-primary' : 'btn-outline'}`} 
            style={{flex: 1, border: 'none', padding: '8px 4px', fontSize: '0.85rem', background: mode === 'student_login' ? 'var(--primary-color)' : 'transparent', color: mode === 'student_login' ? 'white' : 'var(--text-secondary)'}}
            onClick={() => handleModeSwitch('student_login')}
          >Élève</button>
        </div>

        {renderContent()}

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleAuth} className="auth-form">
          {mode === 'student_login' || mode === 'teacher_login' ? (
            <>
              <div className="auth-input-group">
                <label>Email</label>
                <input
                  type="email"
                  className="auth-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="votre.email@ecole.com"
                  required
                />
              </div>
              <div className="auth-input-group">
                <label>Mot de passe</label>
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
              {mode === 'register' && (
                <div className="auth-input-group">
                  <label>Nom de l'établissement</label>
                  <input
                    type="text"
                    className="auth-input"
                    value={schoolName}
                    onChange={(e) => setSchoolName(e.target.value)}
                    placeholder="Ex: Lycée d'Excellence"
                    required
                  />
                </div>
              )}
              <div className="auth-input-group">
                <label>Email Administrateur</label>
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
                  <label>Mot de passe</label>
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
            {loading ? 'Chargement...' : mode === 'login' || mode === 'student_login' || mode === 'teacher_login' ? 'Se connecter' : mode === 'register' ? "S'inscrire" : 'Envoyer le lien'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <>
              <button className="auth-link" onClick={() => handleModeSwitch('forgot_password')}>
                Mot de passe oublié ?
              </button>
              <button className="auth-link" onClick={() => handleModeSwitch('register')}>
                S'inscrire
              </button>
            </>
          ) : mode !== 'student_login' && mode !== 'teacher_login' ? (
            <button className="auth-link" style={{ margin: '0 auto' }} onClick={() => handleModeSwitch('login')}>
              Retour à la connexion
            </button>
          ) : null}
        </div>
      </div>
    </div>
  );
}
