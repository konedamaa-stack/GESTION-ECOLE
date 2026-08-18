import React, { useState, useEffect, useRef, useCallback } from 'react';

interface IdleTimeoutManagerProps {
  isLoggedIn: boolean;
  onLogout: (reason?: string) => void;
  timeoutMinutes?: number;
  warningSeconds?: number;
}

export const IdleTimeoutManager: React.FC<IdleTimeoutManagerProps> = ({
  isLoggedIn,
  onLogout,
  timeoutMinutes = 15,
  warningSeconds = 60,
}) => {
  const [showWarning, setShowWarning] = useState(false);
  const [secondsRemaining, setSecondsRemaining] = useState(warningSeconds);
  const lastActivityRef = useRef<number>(Date.now());
  const timerRef = useRef<any>(null);

  const resetActivity = useCallback(() => {
    lastActivityRef.current = Date.now();
    if (showWarning) {
      setShowWarning(false);
      setSecondsRemaining(warningSeconds);
    }
  }, [showWarning, warningSeconds]);

  // Listen to user interactions to reset idle timer
  useEffect(() => {
    if (!isLoggedIn) return;

    const events = ['mousedown', 'mousemove', 'keydown', 'scroll', 'touchstart', 'click'];
    
    // Throttle event listener to avoid unnecessary cpu usage
    let throttleTimeout: any = null;
    const handleActivity = () => {
      if (!throttleTimeout) {
        throttleTimeout = setTimeout(() => {
          if (!showWarning) {
            lastActivityRef.current = Date.now();
          }
          throttleTimeout = null;
        }, 1000);
      }
    };

    events.forEach(event => window.addEventListener(event, handleActivity, { passive: true }));

    return () => {
      events.forEach(event => window.removeEventListener(event, handleActivity));
      if (throttleTimeout) clearTimeout(throttleTimeout);
    };
  }, [isLoggedIn, showWarning]);

  // Main check loop
  useEffect(() => {
    if (!isLoggedIn) {
      setShowWarning(false);
      if (timerRef.current) clearInterval(timerRef.current);
      return;
    }

    lastActivityRef.current = Date.now();

    const totalTimeoutMs = timeoutMinutes * 60 * 1000;
    const warningThresholdMs = totalTimeoutMs - (warningSeconds * 1000);

    timerRef.current = setInterval(() => {
      const elapsed = Date.now() - lastActivityRef.current;

      if (elapsed >= totalTimeoutMs) {
        // User is absent - auto logout
        setShowWarning(false);
        if (timerRef.current) clearInterval(timerRef.current);
        onLogout('idle');
      } else if (elapsed >= warningThresholdMs) {
        // Show warning countdown
        const remaining = Math.max(0, Math.ceil((totalTimeoutMs - elapsed) / 1000));
        setShowWarning(true);
        setSecondsRemaining(remaining);
      } else {
        setShowWarning(false);
      }
    }, 1000);

    return () => {
      if (timerRef.current) clearInterval(timerRef.current);
    };
  }, [isLoggedIn, timeoutMinutes, warningSeconds, onLogout]);

  if (!isLoggedIn || !showWarning) return null;

  return (
    <div 
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        zIndex: 999999,
        padding: '20px',
        animation: 'fadeIn 0.2s ease-out'
      }}
    >
      <div 
        style={{
          background: 'var(--surface-color, #ffffff)',
          color: 'var(--text-color, #1e293b)',
          borderRadius: '16px',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          maxWidth: '480px',
          width: '100%',
          padding: '28px',
          border: '1px solid rgba(239, 68, 68, 0.3)',
          textAlign: 'center',
          position: 'relative'
        }}
      >
        <div 
          style={{
            width: '64px',
            height: '64px',
            borderRadius: '50%',
            backgroundColor: 'rgba(239, 68, 68, 0.12)',
            color: '#ef4444',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '2rem',
            margin: '0 auto 16px'
          }}
        >
          🔒
        </div>

        <h3 style={{ fontSize: '1.35rem', fontWeight: 700, margin: '0 0 10px', color: '#ef4444' }}>
          Sécurité : Inactivité Détectée
        </h3>

        <p style={{ fontSize: '0.95rem', color: '#64748b', margin: '0 0 20px', lineHeight: 1.5 }}>
          Pour protéger les données scolaires et confidentielles de votre établissement, 
          votre session sera automatiquement fermée si vous êtes absent.
        </p>

        <div 
          style={{
            background: 'rgba(239, 68, 68, 0.08)',
            border: '1px dashed rgba(239, 68, 68, 0.3)',
            borderRadius: '12px',
            padding: '14px',
            marginBottom: '24px'
          }}
        >
          <span style={{ fontSize: '0.85rem', color: '#64748b', display: 'block', marginBottom: '4px' }}>
            Fermeture automatique dans :
          </span>
          <span style={{ fontSize: '2rem', fontWeight: 800, color: '#ef4444', fontFamily: 'monospace' }}>
            {secondsRemaining}s
          </span>
        </div>

        <div style={{ display: 'flex', gap: '12px', justifyContent: 'center' }}>
          <button 
            type="button"
            className="btn btn-primary"
            style={{
              flex: 1,
              padding: '12px 20px',
              fontSize: '0.95rem',
              fontWeight: 600,
              background: 'linear-gradient(135deg, #10b981 0%, #059669 100%)',
              borderColor: '#10b981'
            }}
            onClick={resetActivity}
          >
            ⚡ Rester connecté
          </button>
          <button 
            type="button"
            className="btn btn-outline"
            style={{
              padding: '12px 18px',
              fontSize: '0.95rem',
              color: '#ef4444',
              borderColor: '#fca5a5'
            }}
            onClick={() => onLogout()}
          >
            Se déconnecter
          </button>
        </div>
      </div>
    </div>
  );
};
