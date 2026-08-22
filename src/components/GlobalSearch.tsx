import React, { useState, useEffect, useRef, useMemo } from 'react';
import { useTranslation } from 'react-i18next';

interface GlobalSearchProps {
  studentsData: any[];
  parentsData: any[];
  teachersData: any[];
  classesData: any[];
  setActiveTab: (tab: string) => void;
  setSelectedStudent: (student: any) => void;
  setActiveModal: (modal: string | null) => void;
  setParentSearchQuery?: (query: string) => void;
  currentAdminRole?: string;
}

export const GlobalSearch: React.FC<GlobalSearchProps> = ({
  studentsData = [],
  parentsData = [],
  teachersData = [],
  classesData = [],
  setActiveTab,
  setSelectedStudent,
  setActiveModal,
  setParentSearchQuery,
  currentAdminRole = 'Director'
}) => {
  const { t, i18n } = useTranslation();
  const [searchTerm, setSearchTerm] = useState('');
  const [isOpen, setIsOpen] = useState(false);
  const containerRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const isRtl = i18n.language?.startsWith('ar');

  // Keyboard shortcut (Ctrl+K or Cmd+K)
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key.toLowerCase() === 'k') {
        e.preventDefault();
        inputRef.current?.focus();
        setIsOpen(true);
      } else if (e.key === 'Escape') {
        setIsOpen(false);
        inputRef.current?.blur();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

  // Click outside to close
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Navigation pages list based on admin role
  const navigationItems = useMemo(() => {
    const isDirectorOrSupervisor = currentAdminRole === 'Director' || currentAdminRole === 'Supervisor';
    const isAccountant = currentAdminRole === 'Accountant';
    const isSecretary = currentAdminRole === 'Secretary';

    const items = [
      { id: 'dashboard', label: t('admin.sidebar.dashboard', 'Tableau de bord'), icon: '📊', tab: 'dashboard', keywords: ['accueil', 'stats', 'statistiques', 'لوحة التحكم', 'dashboard'], allowed: true },
      { id: 'students', label: t('admin.sidebar.students', 'Gestion Élèves'), icon: '🎓', tab: 'students', keywords: ['élèves', 'eleves', 'inscriptions', 'etudiants', 'الطلاب', 'dossier', 'matricule'], allowed: isDirectorOrSupervisor || isSecretary || isAccountant },
      { id: 'parents', label: t('admin.sidebar.parents', "Parents d'Élèves"), icon: '👨‍👩‍👧', tab: 'parents', keywords: ['parents', 'tuteurs', 'familles', 'contacts', 'اولياء الامور'], allowed: isDirectorOrSupervisor || isSecretary || isAccountant },
      { id: 'absences', label: t('admin.sidebar.absences', 'Gestion Absences'), icon: '📋', tab: 'absences', keywords: ['absences', 'retards', 'presence', 'appel', 'الغياب'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'teachers', label: t('admin.sidebar.teachers', 'Enseignants'), icon: '👨‍🏫', tab: 'teachers', keywords: ['profs', 'professeurs', 'enseignants', 'matieres', 'المعلمين'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'pedagogy', label: t('admin.sidebar.pedagogy', 'Classes & Pédagogie'), icon: '🏫', tab: 'pedagogy', keywords: ['classes', 'niveaux', 'filières', 'pedagogie', 'الفصول'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'schedules', label: t('admin.sidebar.schedules', 'Emplois du Temps'), icon: '📅', tab: 'schedules', keywords: ['emplois', 'temps', 'planning', 'horaires', 'جدول الحصص'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'notes_bulletins', label: 'Notes & Bulletins', icon: '📑', tab: 'notes_bulletins', keywords: ['notes', 'bulletins', 'evaluations', 'moyennes', 'الدرجات', 'كشوف'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'scolarite', label: t('admin.sidebar.finance', 'Comptabilité & Scolarité'), icon: '💳', tab: 'scolarite', keywords: ['compta', 'finance', 'paiements', 'factures', 'scolarite', 'المحاسبة'], allowed: isDirectorOrSupervisor || isAccountant },
      { id: 'depenses', label: t('admin.sidebar.expenses', 'Dépenses & Emprunts'), icon: '💰', tab: 'depenses', keywords: ['depenses', 'emprunts', 'achats', 'frais', 'المصروفات'], allowed: isDirectorOrSupervisor || isAccountant },
      { id: 'rh', label: t('admin.sidebar.rh', 'RH & Admin'), icon: '💼', tab: 'rh', keywords: ['rh', 'salaires', 'employes', 'personnel', 'contrats', 'الموارد البشرية'], allowed: isDirectorOrSupervisor },
      { id: 'communication', label: t('admin.sidebar.communication', 'Communication'), icon: '💬', tab: 'communication', keywords: ['communication', 'messages', 'sms', 'annonces', 'التواصل'], allowed: isDirectorOrSupervisor || isSecretary },
      { id: 'settings', label: t('admin.sidebar.settings', 'Paramètres'), icon: '⚙️', tab: 'settings', keywords: ['parametres', 'configuration', 'annee', 'profil', 'ecole', 'الاعدادats'], allowed: isDirectorOrSupervisor },
    ];

    return items.filter(item => item.allowed);
  }, [t, currentAdminRole]);

  const query = searchTerm.trim().toLowerCase();

  // Search Results
  const results = useMemo(() => {
    if (!query) return null;

    // Filter pages
    const pages = navigationItems.filter(item => 
      item.label.toLowerCase().includes(query) || 
      item.keywords.some(k => k.toLowerCase().includes(query))
    ).slice(0, 4);

    // Filter students
    const students = studentsData.filter(s => {
      const fullName = `${s.first_name || ''} ${s.last_name || ''}`.toLowerCase();
      const mat = (s.matricule || '').toLowerCase();
      const cls = (s.classes?.name || '').toLowerCase();
      const phone = (s.parent_phone || s.phone || '').toLowerCase();
      return fullName.includes(query) || mat.includes(query) || cls.includes(query) || phone.includes(query);
    }).slice(0, 5);

    // Filter parents
    const parents = parentsData.filter(p => {
      const fullName = `${p.first_name || ''} ${p.last_name || ''}`.toLowerCase();
      const phone = (p.phone || '').toLowerCase();
      const prof = (p.profession || '').toLowerCase();
      return fullName.includes(query) || phone.includes(query) || prof.includes(query);
    }).slice(0, 4);

    // Filter teachers
    const teachers = teachersData.filter(t => {
      const name = (t.name || '').toLowerCase();
      const subj = (t.subject || '').toLowerCase();
      const phone = (t.phone || '').toLowerCase();
      return name.includes(query) || subj.includes(query) || phone.includes(query);
    }).slice(0, 4);

    // Filter classes
    const classes = classesData.filter(c => {
      const name = (c.name || '').toLowerCase();
      const level = (c.level || '').toLowerCase();
      return name.includes(query) || level.includes(query);
    }).slice(0, 4);

    const totalCount = pages.length + students.length + parents.length + teachers.length + classes.length;

    return {
      pages,
      students,
      parents,
      teachers,
      classes,
      totalCount
    };
  }, [query, navigationItems, studentsData, parentsData, teachersData, classesData]);

  const handleSelectPage = (tab: string) => {
    setActiveTab(tab);
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectStudent = (student: any) => {
    setSelectedStudent(student);
    setActiveModal('studentDossier');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectParent = (parent: any) => {
    if (setParentSearchQuery) {
      setParentSearchQuery(`${parent.first_name || ''} ${parent.last_name || ''}`.trim());
    }
    setActiveTab('parents');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectTeacher = () => {
    setActiveTab('teachers');
    setIsOpen(false);
    setSearchTerm('');
  };

  const handleSelectClass = () => {
    setActiveTab('pedagogy');
    setIsOpen(false);
    setSearchTerm('');
  };

  return (
    <div ref={containerRef} style={{ position: 'relative', width: '100%', maxWidth: '380px' }} className="hide-on-mobile">
      {/* Search Input Container */}
      <div 
        style={{
          display: 'flex',
          alignItems: 'center',
          background: 'var(--surface-color, #ffffff)',
          border: isOpen ? '1.5px solid var(--primary-color, #4F46E5)' : '1px solid var(--border-color, #E5E7EB)',
          borderRadius: '10px',
          padding: '0 12px',
          boxShadow: isOpen ? '0 0 0 3px rgba(79, 70, 229, 0.12)' : '0 1px 2px rgba(0, 0, 0, 0.04)',
          transition: 'all 0.2s ease',
          height: '40px'
        }}
      >
        <svg 
          width="18" 
          height="18" 
          viewBox="0 0 24 24" 
          fill="none" 
          stroke="var(--text-muted, #9CA3AF)" 
          strokeWidth="2" 
          strokeLinecap="round" 
          strokeLinejoin="round"
          style={{ flexShrink: 0, marginRight: isRtl ? '0' : '8px', marginLeft: isRtl ? '8px' : '0' }}
        >
          <circle cx="11" cy="11" r="8"></circle>
          <line x1="21" y1="21" x2="16.65" y2="16.65"></line>
        </svg>

        <input
          ref={inputRef}
          id="global-search-input"
          type="text"
          value={searchTerm}
          onChange={(e) => {
            setSearchTerm(e.target.value);
            if (!isOpen) setIsOpen(true);
          }}
          onFocus={() => setIsOpen(true)}
          placeholder={t('admin.header.search_placeholder', 'Rechercher élève, parent, classe...')}
          style={{
            border: 'none',
            outline: 'none',
            background: 'transparent',
            width: '100%',
            fontSize: '0.875rem',
            color: 'var(--text-color, #1F2937)',
            padding: '4px 0'
          }}
        />

        {searchTerm ? (
          <button
            type="button"
            onClick={() => {
              setSearchTerm('');
              inputRef.current?.focus();
            }}
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              color: 'var(--text-muted, #9CA3AF)',
              padding: '2px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderRadius: '50%'
            }}
            title="Effacer"
          >
            ✕
          </button>
        ) : (
          <kbd 
            style={{
              fontSize: '0.7rem',
              fontWeight: 600,
              padding: '2px 6px',
              borderRadius: '4px',
              background: 'var(--bg-secondary, #F3F4F6)',
              color: 'var(--text-muted, #9CA3AF)',
              border: '1px solid var(--border-color, #E5E7EB)',
              marginLeft: '6px',
              userSelect: 'none'
            }}
          >
            Ctrl K
          </kbd>
        )}
      </div>

      {/* Floating Dropdown Results */}
      {isOpen && query && results && (
        <div
          style={{
            position: 'absolute',
            top: 'calc(100% + 6px)',
            left: isRtl ? 'auto' : 0,
            right: isRtl ? 0 : 'auto',
            width: '440px',
            maxHeight: '460px',
            overflowY: 'auto',
            background: 'var(--surface-color, #ffffff)',
            border: '1px solid var(--border-color, #E5E7EB)',
            borderRadius: '12px',
            boxShadow: '0 12px 32px -4px rgba(0, 0, 0, 0.18), 0 4px 12px -2px rgba(0, 0, 0, 0.08)',
            zIndex: 9999,
            padding: '8px',
            backdropFilter: 'blur(10px)'
          }}
        >
          {results.totalCount === 0 ? (
            <div style={{ padding: '24px 16px', textAlign: 'center', color: 'var(--text-muted, #6B7280)' }}>
              <div style={{ fontSize: '1.8rem', marginBottom: '8px' }}>🔍</div>
              <p style={{ margin: 0, fontWeight: 500, fontSize: '0.9rem' }}>
                Aucun résultat trouvé pour « <span style={{ color: 'var(--primary-color, #4F46E5)' }}>{searchTerm}</span> »
              </p>
              <p style={{ margin: '4px 0 0', fontSize: '0.8rem', opacity: 0.75 }}>
                Essayez avec un nom, un matricule, un parent ou un menu
              </p>
            </div>
          ) : (
            <div>
              {/* Category: Navigation / Pages */}
              {results.pages.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #6B7280)', padding: '6px 8px 4px' }}>
                    Menus & Pages
                  </div>
                  {results.pages.map(page => (
                    <div
                      key={page.id}
                      onClick={() => handleSelectPage(page.tab)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        gap: '10px',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        transition: 'background 0.15s ease',
                      }}
                      className="global-search-item"
                    >
                      <span style={{ fontSize: '1.1rem' }}>{page.icon}</span>
                      <span style={{ fontSize: '0.875rem', fontWeight: 600, color: 'var(--text-color, #1F2937)', flex: 1 }}>{page.label}</span>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary-color, #4F46E5)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 6px', borderRadius: '4px' }}>
                        Aller à la page →
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Élèves */}
              {results.students.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #6B7280)', padding: '6px 8px 4px' }}>
                    🎓 Élèves ({results.students.length})
                  </div>
                  {results.students.map(s => (
                    <div
                      key={s.id}
                      onClick={() => handleSelectStudent(s)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        gap: '8px'
                      }}
                      className="global-search-item"
                    >
                      <div style={{ display: 'flex', alignItems: 'center', gap: '10px', minWidth: 0, flex: 1 }}>
                        {s.photo_url ? (
                          <img src={s.photo_url} alt="" style={{ width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover' }} />
                        ) : (
                          <div style={{ width: '32px', height: '32px', borderRadius: '50%', background: 'linear-gradient(135deg, #4F46E5, #7C3AED)', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                            {(s.first_name?.[0] || 'E').toUpperCase()}
                          </div>
                        )}
                        <div style={{ minWidth: 0, flex: 1 }}>
                          <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-color, #1F2937)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                            {s.first_name} {s.last_name}
                          </div>
                          <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6B7280)', display: 'flex', gap: '6px', alignItems: 'center' }}>
                            {s.matricule && <span style={{ fontWeight: 500 }}>{s.matricule}</span>}
                            {s.classes?.name && <span>• {s.classes.name}</span>}
                          </div>
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: 'var(--primary-color, #4F46E5)', background: 'rgba(79, 70, 229, 0.08)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        Dossier
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Parents */}
              {results.parents.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #6B7280)', padding: '6px 8px 4px' }}>
                    👨‍👩‍👧 Parents & Tuteurs ({results.parents.length})
                  </div>
                  {results.parents.map(p => (
                    <div
                      key={p.id}
                      onClick={() => handleSelectParent(p)}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        gap: '8px'
                      }}
                      className="global-search-item"
                    >
                      <div style={{ minWidth: 0, flex: 1 }}>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-color, #1F2937)' }}>
                          {p.first_name} {p.last_name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6B7280)' }}>
                          {p.phone || p.profession || 'Parent'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#059669', background: 'rgba(16, 185, 129, 0.1)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        Voir profil
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Enseignants */}
              {results.teachers.length > 0 && (
                <div style={{ marginBottom: '8px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #6B7280)', padding: '6px 8px 4px' }}>
                    👨‍🏫 Enseignants ({results.teachers.length})
                  </div>
                  {results.teachers.map(t => (
                    <div
                      key={t.id}
                      onClick={handleSelectTeacher}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        gap: '8px'
                      }}
                      className="global-search-item"
                    >
                      <div>
                        <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-color, #1F2937)' }}>
                          {t.name}
                        </div>
                        <div style={{ fontSize: '0.75rem', color: 'var(--text-muted, #6B7280)' }}>
                          {t.subject || 'Enseignant'}
                        </div>
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#D97706', background: 'rgba(217, 119, 6, 0.1)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        Enseignants
                      </span>
                    </div>
                  ))}
                </div>
              )}

              {/* Category: Classes */}
              {results.classes.length > 0 && (
                <div style={{ marginBottom: '4px' }}>
                  <div style={{ fontSize: '0.72rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.05em', color: 'var(--text-muted, #6B7280)', padding: '6px 8px 4px' }}>
                    🏫 Classes ({results.classes.length})
                  </div>
                  {results.classes.map(c => (
                    <div
                      key={c.id}
                      onClick={handleSelectClass}
                      style={{
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'space-between',
                        padding: '8px 10px',
                        borderRadius: '8px',
                        cursor: 'pointer',
                        gap: '8px'
                      }}
                      className="global-search-item"
                    >
                      <div style={{ fontWeight: 600, fontSize: '0.875rem', color: 'var(--text-color, #1F2937)' }}>
                        {c.name} {c.level ? `(${c.level})` : ''}
                      </div>
                      <span style={{ fontSize: '0.7rem', color: '#6366F1', background: 'rgba(99, 102, 241, 0.1)', padding: '2px 8px', borderRadius: '4px', whiteSpace: 'nowrap' }}>
                        Pédagogie
                      </span>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Search Footer info */}
          <div 
            style={{
              marginTop: '6px',
              paddingTop: '6px',
              borderTop: '1px solid var(--border-color, #E5E7EB)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.72rem',
              color: 'var(--text-muted, #9CA3AF)',
              paddingLeft: '6px',
              paddingRight: '6px'
            }}
          >
            <span>Navigation rapide</span>
            <span><kbd style={{ padding: '1px 4px', background: 'var(--bg-secondary, #F3F4F6)', borderRadius: '3px', border: '1px solid var(--border-color, #E5E7EB)' }}>Échap</kbd> pour fermer</span>
          </div>
        </div>
      )}

      {/* Hover styling for dropdown items */}
      <style>{`
        .global-search-item:hover {
          background-color: var(--surface-color-hover, rgba(0, 0, 0, 0.04)) !important;
        }
      `}</style>
    </div>
  );
};
