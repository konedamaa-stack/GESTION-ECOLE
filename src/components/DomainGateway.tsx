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
          setSchools(data.filter((s: any) => s.subdomain));
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
          top: '15%',
          left: '50%',
          transform: 'translateX(-50%)',
          width: '750px',
          height: '450px',
          background: 'radial-gradient(circle, rgba(16, 185, 129, 0.12) 0%, rgba(13, 148, 136, 0.08) 50%, transparent 70%)',
          borderRadius: '50%',
          filter: 'blur(100px)',
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
              background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              color: '#ffffff',
              fontWeight: 900,
              fontSize: '1.25rem',
              boxShadow: '0 4px 12px rgba(5, 150, 105, 0.25)',
            }}
          >
            S
          </div>
          <div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
              <span style={{ fontWeight: 900, fontSize: '1.15rem', letterSpacing: '-0.02em', color: '#0f172a' }}>
                Solution Écoles
              </span>
              <span
                style={{
                  fontSize: '0.65rem',
                  fontWeight: 800,
                  padding: '2px 8px',
                  borderRadius: '999px',
                  backgroundColor: '#ecfdf5',
                  color: '#059669',
                  border: '1px solid #a7f3d0',
                  textTransform: 'uppercase',
                }}
              >
                Multi-Tenant
              </span>
            </div>
            <p style={{ fontSize: '0.75rem', color: '#64748b', margin: 0 }}>
              Plateforme Nationale d&apos;Accès aux Établissements Scolaires
            </p>
          </div>
        </div>

        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
          <button
            type="button"
            onClick={onSuperAdminClick}
            style={{
              padding: '0.5rem 1rem',
              borderRadius: '12px',
              backgroundColor: '#fffbeb',
              color: '#92400e',
              border: '1px solid #fde68a',
              fontSize: '0.75rem',
              fontWeight: 800,
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              gap: '6px',
              boxShadow: '0 1px 3px rgba(0,0,0,0.05)',
              transition: 'all 0.2s',
            }}
          >
            <span>🛡️</span>
            <span>Super Admin</span>
          </button>
        </div>
      </header>

      {/* CENTER CARD CONTAINER (SPLIT 2 COLUMNS - EXACT DESIGN AS REQUESTED) */}
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
            maxWidth: '920px',
            backgroundColor: '#ffffff',
            borderRadius: '28px',
            boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.12), 0 0 0 1px rgba(226, 232, 240, 0.8)',
            display: 'flex',
            flexWrap: 'wrap',
            overflow: 'hidden',
            minHeight: '480px',
          }}
        >
          {/* LEFT COLUMN: VIBRANT GREEN GRADIENT BANNER (EXACTLY LIKE IMAGE 2) */}
          <div
            style={{
              flex: '1 1 360px',
              background: 'linear-gradient(145deg, #059669 0%, #10b981 50%, #047857 100%)',
              padding: '2.5rem 2rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              color: '#ffffff',
              position: 'relative',
              overflow: 'hidden',
            }}
          >
            {/* Soft decorative translucent background circles */}
            <div
              style={{
                position: 'absolute',
                top: '-50px',
                right: '-50px',
                width: '240px',
                height: '240px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.12)',
                filter: 'blur(10px)',
                pointerEvents: 'none',
              }}
            />
            <div
              style={{
                position: 'absolute',
                bottom: '-70px',
                left: '-70px',
                width: '280px',
                height: '280px',
                borderRadius: '50%',
                backgroundColor: 'rgba(255, 255, 255, 0.10)',
                pointerEvents: 'none',
              }}
            />

            {/* Top Badge */}
            <div style={{ position: 'relative', zIndex: 2 }}>
              <div
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '6px 14px',
                  borderRadius: '999px',
                  backgroundColor: 'rgba(255, 255, 255, 0.2)',
                  backdropFilter: 'blur(8px)',
                  border: '1px solid rgba(255, 255, 255, 0.3)',
                  fontSize: '0.75rem',
                  fontWeight: 800,
                  boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
                }}
              >
                <span>🏫</span>
                <span>Gestion Établissement Scolaire</span>
              </div>

              {/* Banner Main Title */}
              <div style={{ marginTop: '2rem' }}>
                <h1
                  style={{
                    fontSize: '2.25rem',
                    fontWeight: 900,
                    lineHeight: 1.15,
                    letterSpacing: '-0.02em',
                    color: '#ffffff',
                    margin: '0 0 1rem 0',
                  }}
                >
                  Direction &<br />Administration !
                </h1>
                <p
                  style={{
                    fontSize: '0.95rem',
                    lineHeight: 1.5,
                    color: 'rgba(255, 255, 255, 0.92)',
                    margin: 0,
                    maxWidth: '300px',
                  }}
                >
                  Pilotez l&apos;ensemble des activités et paramètres de votre établissement.
                </p>
              </div>
            </div>

            {/* Bottom Register CTA inside Green Banner */}
            <div style={{ position: 'relative', zIndex: 2, marginTop: '2.5rem' }}>
              <p
                style={{
                  fontSize: '0.85rem',
                  color: 'rgba(255, 255, 255, 0.85)',
                  marginBottom: '0.5rem',
                  fontWeight: 600,
                }}
              >
                Tu n&apos;as pas de compte ?
              </p>
              <button
                type="button"
                onClick={onLoginClick}
                style={{
                  padding: '0.65rem 1.5rem',
                  borderRadius: '999px',
                  backgroundColor: 'transparent',
                  border: '2px solid rgba(255, 255, 255, 0.8)',
                  color: '#ffffff',
                  fontSize: '0.85rem',
                  fontWeight: 800,
                  cursor: 'pointer',
                  transition: 'all 0.2s',
                  boxShadow: '0 2px 6px rgba(0,0,0,0.1)',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = '#ffffff';
                  (e.currentTarget as HTMLElement).style.color = '#059669';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget as HTMLElement).style.backgroundColor = 'transparent';
                  (e.currentTarget as HTMLElement).style.color = '#ffffff';
                }}
              >
                S&apos;inscrire
              </button>
            </div>
          </div>

          {/* RIGHT COLUMN: SEARCH INPUT & ACCESS FORM */}
          <div
            style={{
              flex: '1 1 420px',
              padding: '2.5rem 2.25rem',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              backgroundColor: '#ffffff',
            }}
          >
            <div>
              {/* Form Header */}
              <div style={{ marginBottom: '1.75rem' }}>
                <span
                  style={{
                    fontSize: '0.65rem',
                    fontWeight: 800,
                    textTransform: 'uppercase',
                    color: '#059669',
                    letterSpacing: '0.05em',
                    fontFamily: 'monospace',
                  }}
                >
                  ACCÈS PAR NOM DE DOMAINE
                </span>
                <h2
                  style={{
                    fontSize: '1.5rem',
                    fontWeight: 900,
                    color: '#0f172a',
                    letterSpacing: '-0.02em',
                    marginTop: '0.25rem',
                    marginBottom: '0.5rem',
                  }}
                >
                  Ouvrir mon Établissement
                </h2>
                <p style={{ fontSize: '0.825rem', color: '#64748b', margin: 0, lineHeight: 1.4 }}>
                  Entrez l&apos;identifiant ou le domaine de l&apos;école pour ouvrir son portail sécurisé.
                </p>
              </div>

              {/* Form Input */}
              <form onSubmit={handleSubmit} style={{ marginBottom: '1.5rem' }}>
                <div style={{ marginBottom: '0.75rem' }}>
                  <label
                    style={{
                      display: 'block',
                      fontSize: '0.75rem',
                      fontWeight: 800,
                      color: '#334155',
                      marginBottom: '0.5rem',
                      fontFamily: 'monospace',
                      textTransform: 'uppercase',
                    }}
                  >
                    Nom de Domaine ou Sous-Domaine
                  </label>

                  {/* Clean Search Input Container */}
                  <div
                    style={{
                      display: 'flex',
                      alignItems: 'center',
                      backgroundColor: '#ffffff',
                      borderRadius: '16px',
                      border: isFocused ? '2px solid #059669' : '1px solid #cbd5e1',
                      boxShadow: isFocused ? '0 0 0 4px rgba(5, 150, 105, 0.15)' : '0 2px 4px rgba(0,0,0,0.02)',
                      transition: 'all 0.2s',
                      padding: '4px',
                    }}
                  >
                    <span style={{ padding: '0 10px', fontSize: '1.25rem' }}>🌐</span>
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
                        padding: '0.85rem 0.5rem',
                        border: 'none',
                        outline: 'none',
                        fontSize: '0.9rem',
                        fontFamily: 'monospace',
                        color: '#0f172a',
                        backgroundColor: '#ffffff',
                      }}
                    />
                    <button
                      type="submit"
                      style={{
                        padding: '0.85rem 1.4rem',
                        borderRadius: '12px',
                        background: 'linear-gradient(135deg, #059669 0%, #047857 100%)',
                        color: '#ffffff',
                        border: 'none',
                        fontWeight: 900,
                        fontSize: '0.85rem',
                        cursor: 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        boxShadow: '0 4px 12px rgba(5, 150, 105, 0.35)',
                        transition: 'all 0.15s',
                        whiteSpace: 'nowrap',
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
                      borderRadius: '12px',
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

                {/* Autocomplete Suggestions */}
                {matchingSchools.length > 0 && isFocused && (
                  <div
                    style={{
                      borderRadius: '16px',
                      border: '1px solid #e2e8f0',
                      backgroundColor: '#ffffff',
                      boxShadow: '0 16px 32px -4px rgba(0,0,0,0.12)',
                      overflow: 'hidden',
                      maxHeight: '200px',
                      overflowY: 'auto',
                      marginTop: '0.5rem',
                    }}
                  >
                    <div
                      style={{
                        padding: '8px 12px',
                        backgroundColor: '#f8fafc',
                        fontSize: '0.65rem',
                        fontWeight: 800,
                        color: '#64748b',
                        textTransform: 'uppercase',
                        fontFamily: 'monospace',
                        borderBottom: '1px solid #e2e8f0',
                      }}
                    >
                      Établissements correspondants ({matchingSchools.length})
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
                        onMouseEnter={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = '#ecfdf5')}
                        onMouseLeave={(e) => ((e.currentTarget as HTMLElement).style.backgroundColor = 'transparent')}
                      >
                        <div>
                          <div style={{ fontWeight: 800, fontSize: '0.85rem', color: '#0f172a' }}>{s.name}</div>
                          <div style={{ fontSize: '0.7rem', color: '#059669', fontFamily: 'monospace' }}>
                            {s.city ? `${s.city} • ` : ''}
                            {s.subdomain}.solutionecoles.com
                          </div>
                        </div>
                        <span style={{ color: '#059669', fontWeight: 900 }}>→</span>
                      </div>
                    ))}
                  </div>
                )}
              </form>

              {/* Quick Click Badges */}
              {schools.length > 0 && (
                <div style={{ borderTop: '1px solid #f1f5f9', paddingTop: '1.25rem' }}>
                  <span
                    style={{
                      fontSize: '0.65rem',
                      fontWeight: 800,
                      color: '#94a3b8',
                      textTransform: 'uppercase',
                      display: 'block',
                      marginBottom: '0.65rem',
                      fontFamily: 'monospace',
                    }}
                  >
                    Ou cliquez sur votre campus :
                  </span>
                  <div style={{ display: 'flex', flexWrap: 'wrap', gap: '6px' }}>
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
                          (e.currentTarget as HTMLElement).style.backgroundColor = '#ecfdf5';
                          (e.currentTarget as HTMLElement).style.borderColor = '#a7f3d0';
                          (e.currentTarget as HTMLElement).style.color = '#059669';
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
            </div>

            {/* Bottom Link to Standard Login */}
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
        </div>
      </main>

      {/* FOOTER */}
      <footer
        style={{
          width: '100%',
          textAlign: 'center',
          padding: '1.25rem',
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
