import React, { useState } from 'react';
import { supabase } from '../lib/supabase';

export function PasswordRecovery({ onComplete }: { onComplete: () => void }) {
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (password !== confirmPassword) {
      setError('Les mots de passe ne correspondent pas.');
      return;
    }
    if (password.length < 6) {
      setError('Le mot de passe doit faire au moins 6 caractères.');
      return;
    }
    
    setLoading(true);
    setError(null);
    try {
      const { error } = await supabase.auth.updateUser({ password });
      if (error) throw error;
      alert('Votre mot de passe a été mis à jour avec succès ! Veuillez vous reconnecter avec votre nouveau mot de passe.');
      await supabase.auth.signOut();
      onComplete();
    } catch (err: any) {
      setError(err.message || 'Une erreur est survenue.');
      setLoading(false);
    }
  };

  return (
    <div style={{
      minHeight: '100vh',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      background: '#0F172A',
      padding: '20px'
    }}>
      <div style={{
        background: '#1E293B',
        padding: '40px',
        borderRadius: '24px',
        width: '100%',
        maxWidth: '400px',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5)'
      }}>
        <h2 style={{ color: 'white', textAlign: 'center', marginBottom: '20px' }}>Nouveau mot de passe</h2>
        <p style={{ color: '#94A3B8', textAlign: 'center', marginBottom: '30px', fontSize: '0.9rem' }}>
          Veuillez saisir votre nouveau mot de passe.
        </p>
        
        {error && (
          <div style={{ background: 'rgba(239, 68, 68, 0.1)', color: '#FCA5A5', padding: '12px', borderRadius: '8px', marginBottom: '24px', fontSize: '0.9rem', border: '1px solid rgba(239, 68, 68, 0.2)' }}>
            {error}
          </div>
        )}

        <form onSubmit={handleUpdate}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>Nouveau mot de passe</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', boxSizing: 'border-box'
              }}
            />
          </div>
          <div style={{ marginBottom: '30px' }}>
            <label style={{ display: 'block', color: '#CBD5E1', fontSize: '0.9rem', marginBottom: '8px' }}>Confirmer le mot de passe</label>
            <input
              type="password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              style={{
                width: '100%', padding: '12px', background: '#0F172A', border: '1px solid #334155', borderRadius: '8px', color: 'white', boxSizing: 'border-box'
              }}
            />
          </div>
          <button
            type="submit"
            disabled={loading}
            style={{
              width: '100%', padding: '14px', background: '#8B5CF6', color: 'white', border: 'none', borderRadius: '8px', fontWeight: 'bold', cursor: loading ? 'not-allowed' : 'pointer'
            }}
          >
            {loading ? 'Mise à jour...' : 'Enregistrer'}
          </button>
        </form>
      </div>
    </div>
  );
}
