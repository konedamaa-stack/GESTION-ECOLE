import { useState } from 'react';
import { supabase } from '../lib/supabase';

export function SuperAdminAuth({ onBack }: { onBack: () => void }) {
  const [authMode, setAuthMode] = useState<'login' | 'forgot_password'>('login');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [successMsg, setSuccessMsg] = useState<string | null>(null);

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);

    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });
      if (error) throw error;
    } catch (err: any) {
      setError(err.message || 'Identifiants incorrects.');
    } finally {
      setLoading(false);
    }
  };

  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setError('Veuillez entrer votre email.');
      return;
    }
    setLoading(true);
    setError(null);
    setSuccessMsg(null);

    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: window.location.origin,
      });
      if (error) throw error;
      setSuccessMsg('Un email de réinitialisation a été envoyé à ' + email);
    } catch (err: any) {
      setError(err.message || 'Erreur lors de la réinitialisation.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      backgroundColor: '#0F172A',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      padding: '20px',
      fontFamily: 'Inter, sans-serif'
    }}>
      <div style={{
        width: '100%',
        maxWidth: '400px',
        background: '#1E293B',
        padding: '40px',
        borderRadius: '24px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)',
        border: '1px solid #334155'
      }}>
        <button 
          onClick={onBack}
          style={{
            background: 'rgba(255,255,255,0.05)',
            border: '1px solid rgba(255,255,255,0.1)',
            borderRadius: '8px',
            color: '#F8FAFC',
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '8px',
            marginBottom: '32px',
            fontSize: '0.9rem',
            padding: '8px 16px',
            fontWeight: 500,
            transition: 'all 0.2s'
          }}
        >
          ← Retour à l'accueil
        </button>

        <div style={{ textAlign: 'center', marginBottom: '32px' }}>
          <div style={{
            width: '64px',
            height: '64px',
            background: 'linear-gradient(135deg, #8B5CF6 0%, #3B82F6 100%)',
            borderRadius: '16px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '32px',
            margin: '0 auto 16px auto',
            boxShadow: '0 10px 15px -3px rgba(139, 92, 246, 0.3)'
          }}>
            👑
          </div>
          <h1 style={{ color: '#F8FAFC', fontSize: '1.5rem', fontWeight: 700, margin: '0 0 8px 0' }}>
            {authMode === 'login' ? 'Portail Super Admin' : 'Mot de passe oublié ?'}
          </h1>
          <p style={{ color: '#94A3B8', fontSize: '0.95rem', margin: 0 }}>
            {authMode === 'login' ? 'Gestion globale du réseau SaaS' : 'Entrez votre email pour réinitialiser votre mot de passe'}
          </p>
        </div>

        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}
        
        {successMsg && (
          <div style={{ background: 'rgba(16, 185, 129, 0.1)', color: '#6EE7B7', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(16, 185, 129, 0.2)' }}>
            {successMsg}
          </div>
        )}

        <form onSubmit={authMode === 'login' ? handleLogin : handleResetPassword}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>
              Email Propriétaire
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              placeholder="admin@saas.com"
              required
              style={{
                width: '100%',
                padding: '12px 16px',
                background: '#0F172A',
                border: '1px solid #334155',
                borderRadius: '12px',
                color: '#F8FAFC',
                fontSize: '1rem',
                outline: 'none',
                transition: 'border-color 0.2s',
                boxSizing: 'border-box'
              }}
            />
          </div>

          {authMode === 'login' && (
            <div style={{ marginBottom: '32px' }}>
              <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px', fontWeight: 500 }}>
                Mot de passe
              </label>
              <input
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                required
                style={{
                  width: '100%',
                  padding: '12px 16px',
                  background: '#0F172A',
                  border: '1px solid #334155',
                  borderRadius: '12px',
                  color: '#F8FAFC',
                  fontSize: '1rem',
                  outline: 'none',
                  transition: 'border-color 0.2s',
                  boxSizing: 'border-box'
                }}
              />
            </div>
          )}

          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%',
              padding: '14px',
              background: 'linear-gradient(135deg, #8B5CF6 0%, #6D28D9 100%)',
              color: 'white',
              border: 'none',
              borderRadius: '12px',
              fontSize: '1rem',
              fontWeight: 600,
              cursor: loading ? 'not-allowed' : 'pointer',
              opacity: loading ? 0.7 : 1,
              transition: 'transform 0.1s, opacity 0.2s'
            }}
          >
            {loading ? 'En cours...' : (authMode === 'login' ? 'Accéder au Portail SaaS' : 'Réinitialiser mon mot de passe')}
          </button>
          
          <div style={{ textAlign: 'center', marginTop: '24px' }}>
            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === 'login' ? 'forgot_password' : 'login');
                setError(null);
                setSuccessMsg(null);
              }}
              style={{
                background: 'none',
                border: 'none',
                color: '#8B5CF6',
                cursor: 'pointer',
                fontSize: '0.9rem',
                fontWeight: 500
              }}
            >
              {authMode === 'login' ? 'Mot de passe oublié ?' : 'Retour à la connexion'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
