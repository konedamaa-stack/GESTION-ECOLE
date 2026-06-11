import React, { useState, useEffect } from 'react';

// Initialise le remplacement de window.alert de manière globale
export const initCustomAlert = () => {
  if (typeof window !== 'undefined') {
    window.alert = (message?: any) => {
      const msgStr = message !== undefined ? String(message) : '';
      const event = new CustomEvent('app-custom-alert', { detail: msgStr });
      window.dispatchEvent(event);
    };
  }
};

export const CustomAlert: React.FC = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    const handleAlert = (e: Event) => {
      const customEvent = e as CustomEvent<string>;
      setMessage(customEvent.detail);
      setIsOpen(true);
    };

    window.addEventListener('app-custom-alert', handleAlert);
    return () => window.removeEventListener('app-custom-alert', handleAlert);
  }, []);

  if (!isOpen) return null;

  const isError = message.toLowerCase().includes('erreur') || message.toLowerCase().includes('error');

  return (
    <div style={{
      position: 'fixed', top: 0, left: 0, right: 0, bottom: 0,
      backgroundColor: 'rgba(0, 0, 0, 0.4)',
      backdropFilter: 'blur(5px)',
      display: 'flex', alignItems: 'center', justifyContent: 'center',
      zIndex: 99999,
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <div style={{
        background: 'var(--surface-color, #ffffff)',
        padding: '2rem',
        borderRadius: '20px',
        maxWidth: '400px',
        width: '90%',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
        textAlign: 'center',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        border: '1px solid var(--border-color, #e2e8f0)'
      }}>
        <div style={{ 
          width: '64px', height: '64px', 
          borderRadius: '50%', 
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          margin: '0 auto 1.5rem',
          backgroundColor: isError ? 'rgba(239, 68, 68, 0.1)' : 'rgba(34, 197, 94, 0.1)',
          color: isError ? '#ef4444' : '#22c55e'
        }}>
          {isError ? (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><circle cx="12" cy="12" r="10"></circle><line x1="15" y1="9" x2="9" y2="15"></line><line x1="9" y1="9" x2="15" y2="15"></line></svg>
          ) : (
            <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
          )}
        </div>
        
        <h3 style={{ 
          fontSize: '1.3rem', 
          fontWeight: 700, 
          marginBottom: '1rem',
          color: 'var(--text-color, #1e293b)'
        }}>
          {isError ? 'Oups !' : 'Succès !'}
        </h3>
        
        <p style={{ 
          color: 'var(--text-secondary, #64748b)', 
          lineHeight: 1.6,
          marginBottom: '2rem',
          wordBreak: 'break-word',
          whiteSpace: 'pre-wrap',
          fontSize: '1.05rem'
        }}>
          {message}
        </p>
        
        <button 
          onClick={() => setIsOpen(false)}
          className="btn btn-primary"
          style={{
            width: '100%',
            padding: '0.85rem',
            fontSize: '1.05rem',
            fontWeight: 600,
            borderRadius: '12px',
          }}
        >
          OK
        </button>
      </div>
    </div>
  );
};
