import React, { useState } from 'react';
import { supabase } from '../lib/supabase';
import './Auth.css';

type AuthMode = 'login' | 'register' | 'forgot_password';

export default function Auth() {
  const [mode, setMode] = useState<AuthMode>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'register') {
        const { error } = await supabase.auth.signUp({
          email,
          password,
        });
        if (error) throw error;
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
            <h1 className="auth-title">Bienvenue</h1>
            <p className="auth-subtitle">Connectez-vous pour accéder à SGES Pro</p>
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
        
        {renderContent()}

        {error && <div className="auth-error">{error}</div>}
        {message && <div className="auth-success">{message}</div>}

        <form onSubmit={handleAuth} className="auth-form">
          <div className="auth-input-group">
            <label>Email</label>
            <input
              type="email"
              className="auth-input"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="votre@email.com"
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

          <button type="submit" className="auth-button" disabled={loading}>
            {loading ? 'Chargement...' : mode === 'login' ? 'Se connecter' : mode === 'register' ? "S'inscrire" : 'Envoyer le lien'}
          </button>
        </form>

        <div className="auth-links">
          {mode === 'login' ? (
            <>
              <button className="auth-link" onClick={() => { setMode('forgot_password'); setError(null); setMessage(null); }}>
                Mot de passe oublié ?
              </button>
              <button className="auth-link" onClick={() => { setMode('register'); setError(null); setMessage(null); }}>
                S'inscrire
              </button>
            </>
          ) : (
            <button className="auth-link" style={{ margin: '0 auto' }} onClick={() => { setMode('login'); setError(null); setMessage(null); }}>
              Retour à la connexion
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
