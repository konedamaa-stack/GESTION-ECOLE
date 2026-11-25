import React, { useState, useEffect, useMemo } from 'react';
import { supabase } from '../lib/supabase';

interface DomainGatewayProps {
  onSchoolSelected: (subdomain: string) => void;
  onLoginClick: () => void;
  onSuperAdminClick: () => void;
}

export const DomainGateway: React.FC<DomainGatewayProps> = ({
  onSchoolSelected,
  onLoginClick,
  onSuperAdminClick,
}) => {
  const [inputDomain, setInputDomain] = useState('');
  const [schools, setSchools] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);
  const [isFocused, setIsFocused] = useState(false);

  // Load registered schools for instant autocomplete
  useEffect(() => {
    async function loadSchools() {
      try {
        const { data, error } = await supabase
          .from('schools')
          .select('id, name, subdomain, logo_url, city')
          .order('name', { ascending: true })
          .limit(50);
        if (data && !error) {
          setSchools(data.filter((s) => s.subdomain));
        }
      } catch (err) {
        console.warn('Erreur chargement des établissements:', err);
      }
    }
    loadSchools();
  }, []);

  // Clean the user input to extract clean subdomain
  const cleanInput = useMemo(() => {
    return inputDomain
      .trim()
      .toLowerCase()
      .replace(/^https?:\/\//, '')
      .replace(/\/.*$/, '')
      .replace(/\.solutionecoles\.com$/, '')
      .replace(/\.alfasle\.xyz$/, '');
  }, [inputDomain]);

  // Real-time suggestions filtering
  const matchingSchools = useMemo(() => {
    if (!cleanInput) return [];
    return schools.filter((s) => {
      const matchSub = s.subdomain?.toLowerCase().includes(cleanInput);
      const matchName = s.name?.toLowerCase().includes(cleanInput);
      const matchCity = s.city?.toLowerCase().includes(cleanInput);
      return matchSub || matchName || matchCity;
    });
  }, [cleanInput, schools]);

  const handleGoToSchool = (sub: string) => {
    const cleaned = sub.trim().toLowerCase();
    if (!cleaned) return;

    const hostname = window.location.hostname.toLowerCase();

    // If on solutionecoles.com in production, redirect to the school's actual subdomain URL
    if (hostname.includes('solutionecoles.com')) {
      window.location.href = `https://${cleaned}.solutionecoles.com`;
      return;
    }

    // If on custom domain or localhost, use parameter or trigger selection
    if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
      window.location.href = `http://${cleaned}.localhost:${window.location.port || '5173'}`;
      return;
    }

    // Default fallback: notify parent app
    onSchoolSelected(cleaned);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg(null);

    if (!cleanInput) {
      setErrorMsg("Veuillez saisir le nom de domaine ou l'identifiant de votre école.");
      return;
    }

    // Check if matching school exists
    const exactMatch = schools.find(
      (s) => s.subdomain?.toLowerCase() === cleanInput || s.name?.toLowerCase() === cleanInput
    );

    if (exactMatch) {
      handleGoToSchool(exactMatch.subdomain);
      return;
    }

    if (matchingSchools.length === 1) {
      handleGoToSchool(matchingSchools[0].subdomain);
      return;
    }

    // If user entered a direct domain with dot (e.g., custom domain)
    if (inputDomain.includes('.') && !inputDomain.includes('solutionecoles.com')) {
      const targetUrl = inputDomain.startsWith('http') ? inputDomain : `https://${inputDomain}`;
      window.location.href = targetUrl;
      return;
    }

    // Try navigating to the cleaned subdomain directly
    handleGoToSchool(cleanInput);
  };

  return (
    <div
      style={{
        minHeight: '100vh',
        backgroundColor: '#f8fafc',
        color: '#0f172a',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        fontFamily: "'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif",
        position: 'relative',
        overflow: 'hidden',
      }}
    >
      {/* Background Soft Gradients */}
      <div
        style={{
          position: 'absolute',
          top: '20%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '650px',
          height: '420px',
          background: 'radial-gradient(circle, rgba(99, 102, 241, 0.12) 0%, rgba(168, 85, 247, 0.08) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(90px)',
          pointerEvents: 'none',
        }}
      />

      {/* TOP HEADER */}
      <header
        style={{
          width: '100%',
          maxWidth: '1200px',
          margin: '0 auto',
          padding: '1.25rem 1.5rem',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          zIndex: 10,
        }}
      >
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
          <div
            style={{
              width: '42px',
              height: '42px',
              borderRadius: '12px',
              background: 'linear-gradient(135deg, #4f46e5 0%, #3730a3 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(79, 70, 229, 0.25)',
            }}
          >
            S
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 800, fontSize: '1.1rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Solution Écoles
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 700,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#eef2ff',
                  color: '#4f46e5',
                  border: '1px solid #c7d2fe',
                  textTransform: 'uppercase',
                }}
              >
                Multi-Tenant
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              Portail d&apos;Accès aux Établissements Scolaires
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onSuperAdminClick}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '10px',
              backgroundColor: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.75rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'all 0.2s',
            }}
          >
            <span>🛡️</span>
            <span>Super Admin</span>
          </button>
        </div>
      </header>

      {/* CENTER GATEWAY CARD */}
      <main
        style={{
          flex: 1,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          padding: '1rem',
          zIndex: 10,
        }}
      >
        <div
          style={{
            width: '100%',
            maxWidth: '560px',
            backgroundColor: '#ffffff',
            borderRadius: '24px',
            padding: '2.5rem 2rem',
            boxShadow: '0 20px 40px -15px rgba(0, 0, 0, 0.1), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            position: 'relative',
          }}
        >
          {/* Card Icon & Title */}
          <div style={{ textAlign: 'center', marginBottom: '2rem' }}>
            <div
              style={{
                width: '64px',
                height: '64px',
                margin: '0 auto 1.25rem auto',
                borderRadius: '20px',
                backgroundColor: '#eef2ff',
                border: '1px solid #c7d2fe',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                fontSize: '2rem',
                boxShadow: '0 8px 16px -4px rgba(79, 70, 229, 0.15)',
              }}
            >
              🌐
            </div>
            <h1
              style={{
                fontSize: '1.75rem',
                fontWeight: 900,
                color: '#0f172a',
                letterSpacing: '-0.03em',
                marginBottom: '0.5rem',
              }}
            >
              Accédez à votre Établissement
            </h1>
            <p style={{ fontSize: '0.875rem', color: '#64748b', maxWidth: '420px', margin: '0 auto', lineHeight: 1.5 }}>
              Saisissez le <strong>nom de domaine</strong> ou le <strong>sous-domaine</strong> de votre école pour ouvrir directement votre espace.
            </p>
          </div>

          {/* Saisie Formulaire */}
          <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
            <div style={{ marginBottom: '1rem' }}>
              <label
                style={{
                  display: 'block',
                  fontSize: '0.75rem',
                  fontWeight: 700,
                  color: '#334155',
                  marginBottom: '0.5rem',
                  fontFamily: 'monospace',
                  textTransform: 'uppercase',
                }}
              >
                Nom de Domaine ou Sous-Domaine
              </label>

              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  backgroundColor: '#ffffff',
                  borderRadius: '14px',
                  border: isFocused ? '2px solid #4f46e5' : '1px solid #cbd5e1',
                  boxShadow: isFocused ? '0 0 0 4px rgba(79, 70, 229, 0.12)' : '0 1px 3px rgba(0,0,0,0.05)',
                  transition: 'all 0.2s',
                  padding: '4px',
                }}
              >
                <span style={{ padding: '0 12px', fontSize: '1.1rem', color: '#4f46e5' }}>🌐</span>
                <input
                  type="text"
                  autoFocus
                  required
                  value={inputDomain}
                  onFocus={() => setIsFocused(true)}
                  onBlur={() => setTimeout(() => setIsFocused(false), 250)}
                  onChange={(e) => {
                    setInputDomain(e.target.value);
                    setErrorMsg(null);
                  }}
                  placeholder="ex: cherifla1 ou cherifla1.solutionecoles.com"
                  style={{
                    flex: 1,
                    padding: '0.75rem 0.5rem',
                    border: 'none',
                    outline: 'none',
                    fontSize: '0.95rem',
                    fontFamily: 'monospace',
                    color: '#0f172a',
                    backgroundColor: 'transparent',
                  }}
                />
                <button
                  type="submit"
                  style={{
                    padding: '0.75rem 1.25rem',
                    borderRadius: '10px',
                    backgroundColor: '#4f46e5',
                    color: '#ffffff',
                    border: 'none',
                    fontWeight: 800,
                    fontSize: '0.85rem',
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '6px',
                    boxShadow: '0 4px 10px rgba(79, 70, 229, 0.3)',
                    transition: 'all 0.15s',
                  }}
                >
                  <span>Accéder</span>
                  <span>→</span>
                </button>
              </div>
            </div>

            {/* Error Message */}
            {errorMsg && (
              <div
                style={{
                  padding: '0.75rem 1rem',
                  borderRadius: '10px',
                  backgroundColor: '#fef2f2',
                  border: '1px solid #fecaca',
                  color: '#b91c1c',
                  fontSize: '0.8rem',
                  marginBottom: '1rem',
                }}
              >
                ⚠️ {errorMsg}
              </div>
            )}

            {/* Live Autocomplete Suggestions */}
            {matchingSchools.length > 0 && isFocused && (
              <div
                style={{
                  borderRadius: '14px',
                  border: '1px solid #e2e8f0',
                  backgroundColor: '#ffffff',
                  boxShadow: '0 12px 28px -4px rgba(0,0,0,0.12)',
                  overflow: 'hidden',
                  maxHeight: '220px',
                  overflowY: 'auto',
                  marginTop: '0.5rem',
                }}
              >
                <div
                  style={{
                    padding: '8px 12px',
                    backgroundColor: '#f8fafc',
                    fontSize: '0.65rem',
                    fontWeight: 700,
                    color: '#64748b',
                    textTransform: 'uppercase',
                    fontFamily: 'monospace',
                    borderBottom: '1px solid #e2e8f0',
                  }}
                >
                  Établissements trouvés ({matchingSchools.length})
                </div>
                {matchingSchools.map((s) => (
                  <div
                    key={s.id}
                    onClick={() => handleGoToSchool(s.subdomain)}
                    style={{
                      padding: '10px 14px',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      cursor: 'pointer',
                      borderBottom: '1px solid #f1f5f9',
                      transition: 'background-color 0.15s',
                    }}
                    onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#f1f5f9')}
                    onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                  >
                    <div>
                      <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{s.name}</div>
                      <div style={{ fontSize: '0.7rem', color: '#64748b', fontFamily: 'monospace' }}>
                        {s.city ? `${s.city} • ` : ''}
                        {s.subdomain}.solutionecoles.com
                      </div>
                    </div>
                    <span style={{ color: '#4f46e5', fontWeight: 800 }}>→</span>
                  </div>
                ))}
              </div>
            )}
          </form>

          {/* Quick Click Badges for Registered Establishments */}
          {schools.length > 0 && (
            <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem', textAlign: 'center' }}>
              <span
                style={{
                  fontSize: '0.7rem',
                  fontWeight: 700,
                  color: '#94a3b8',
                  textTransform: 'uppercase',
                  display: 'block',
                  marginBottom: '0.75rem',
                  fontFamily: 'monospace',
                }}
              >
                Ou cliquez directement sur votre établissement :
              </span>
              <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px', justifyContent: 'center' }}>
                {schools.slice(0, 6).map((s) => (
                  <button
                    key={s.id}
                    type="button"
                    onClick={() => handleGoToSchool(s.subdomain)}
                    style={{
                      padding: '6px 12px',
                      borderRadius: '10px',
                      backgroundColor: '#f8fafc',
                      border: '1px solid #e2e8f0',
                      color: '#1e293b',
                      fontSize: '0.75rem',
                      fontWeight: 700,
                      cursor: 'pointer',
                      transition: 'all 0.15s',
                    }}
                    onMouseEnter={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#eef2ff';
                      (e.currentTarget as HTMLElement).style.borderColor = '#c7d2fe';
                      (e.currentTarget as HTMLElement).style.color = '#4f46e5';
                    }}
                    onMouseLeave={(e) => {
                      (e.currentTarget as HTMLElement).style.backgroundColor = '#f8fafc';
                      (e.currentTarget as HTMLElement).style.borderColor = '#e2e8f0';
                      (e.currentTarget as HTMLElement).style.color = '#1e293b';
                    }}
                  >
                    🏫 {s.name}
                  </button>
                ))}
              </div>
            </div>
          )}

          {/* Bottom Switch to Direct Login */}
          <div style={{ textAlign: 'center', marginTop: '1.5rem', borderTop: '1px solid #f1f5f9', paddingTop: '1rem' }}>
            <button
              type="button"
              onClick={onLoginClick}
              style={{
                background: 'none',
                border: 'none',
                color: '#64748b',
                fontSize: '0.75rem',
                textDecoration: 'underline',
                cursor: 'pointer',
                fontWeight: 600,
              }}
            >
              Accéder à la connexion Direction / Personnel
            </button>
          </div>
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '1rem',
          fontSize: '0.75rem',
          color: '#94a3b8',
          borderTop: '1px solid #e2e8f0',
          fontFamily: 'monospace',
        }}
      >
        Solution Écoles • Système Multi-Établissements & Domaines Dédiés
      </footer>
    </div>
  );
};
