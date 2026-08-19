import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';
import { sanitizeText, sanitizeMatricule } from '../lib/security';
import './Auth.css';

type AuthMode = 'login' | 'register' | 'forgot_password' | 'student_login' | 'teacher_login' | 'accept_invite' | 'parent_login';
type AuthRole = 'Supervisor' | 'Director' | 'Secretary' | 'Accountant' | 'Teacher' | 'Student' | 'Parent';

const ROLES_CONFIG: { role: AuthRole; label: string; icon: string; color: string; bg: string; glow: string; desc: string }[] = [
  { role: 'Director', label: 'Administration', icon: '👑', color: '#A855F7', bg: 'rgba(168, 85, 247, 0.15)', glow: 'rgba(168, 85, 247, 0.4)', desc: 'Directeur, Secrétaire, Comptable, Superviseur' },
  { role: 'Teacher', label: 'Enseignant', icon: '🧑‍🏫', color: '#10B981', bg: 'rgba(16, 185, 129, 0.15)', glow: 'rgba(16, 185, 129, 0.4)', desc: 'Notes & Évaluations' },
  { role: 'Student', label: 'Élève', icon: '🎓', color: '#0D9488', bg: 'rgba(13, 148, 136, 0.15)', glow: 'rgba(13, 148, 136, 0.4)', desc: 'Espace Élève' },
  { role: 'Parent', label: 'Parent d\'élève', icon: '👨‍👩‍👧‍👦', color: '#3B82F6', bg: 'rgba(59, 130, 246, 0.15)', glow: 'rgba(59, 130, 246, 0.4)', desc: 'Suivi Enfant' },
];

export default function Auth({ 
  onStudentLogin, 
  onTeacherLogin, 
  onEmployeeLogin, 
  onBack, 
  schoolId,
  schoolInfo 
}: { 
  onStudentLogin?: (student: any) => void, 
  onTeacherLogin?: (teacher: any) => void, 
  onEmployeeLogin?: (employee: any) => void, 
  onBack?: () => void, 
  schoolId?: string | null,
  schoolInfo?: any 
}) {
  const { t } = useTranslation();
  const [currentSchool, setCurrentSchool] = useState<any>(schoolInfo || null);
  const [mode, setMode] = useState<AuthMode>('login');
  const [selectedRole, setSelectedRole] = useState<AuthRole>('Director');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const [pendingProfiles, setPendingProfiles] = useState<any[] | null>(null);
  const [pendingMode, setPendingMode] = useState<AuthMode | null>(null);
  const [inviteDetails, setInviteDetails] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    if (schoolInfo) {
      setCurrentSchool(schoolInfo);
    } else if (schoolId) {
      supabase.from('schools').select('*').eq('id', schoolId).single().then(({ data }) => {
        if (isMounted && data) {
          setCurrentSchool(data);
        }
      });
    } else {
      setCurrentSchool(null);
    }
    return () => {
      isMounted = false;
    };
  }, [schoolId, schoolInfo]);

  // Security: Rate limiting (3 failed attempts -> 2 minutes lockout)
  const MAX_ATTEMPTS = 3;
  const LOCKOUT_DURATION_MS = 2 * 60 * 1000; // 2 minutes

  const [failedAttempts, setFailedAttempts] = useState<number>(() => {
    return parseInt(localStorage.getItem('sges_auth_failed_attempts') || '0', 10);
  });
  const [lockoutUntil, setLockoutUntil] = useState<number | null>(() => {
    const stored = localStorage.getItem('sges_auth_lockout_until');
    if (stored) {
      const time = parseInt(stored, 10);
      if (time > Date.now()) return time;
    }
    return null;
  });
  const [remainingSeconds, setRemainingSeconds] = useState<number>(0);

  useEffect(() => {
    if (!lockoutUntil) {
      setRemainingSeconds(0);
      return;
    }
    const updateCountdown = () => {
      const diff = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setRemainingSeconds(diff);
      if (diff <= 0) {
        setLockoutUntil(null);
        setFailedAttempts(0);
        localStorage.removeItem('sges_auth_lockout_until');
        localStorage.removeItem('sges_auth_failed_attempts');
        setError(null);
      }
    };
    updateCountdown();
    const interval = setInterval(updateCountdown, 1000);
    return () => clearInterval(interval);
  }, [lockoutUntil]);

  const formatRemainingTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs < 10 ? '0' : ''}${secs}`;
  };

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
    if (newMode === 'login') {
      setSelectedRole('Director');
    } else if (newMode === 'teacher_login') {
      setSelectedRole('Teacher');
    } else if (newMode === 'student_login') {
      setSelectedRole('Student');
    } else if (newMode === 'parent_login') {
      setSelectedRole('Parent');
    }
  };

  const handleRoleChange = (role: AuthRole) => {
    setSelectedRole(role);
    setError(null);
    setMessage(null);
    setEmail('');
    setPassword('');
    
    if (['Supervisor', 'Director', 'Secretary', 'Accountant'].includes(role)) {
      setMode('login');
    } else if (role === 'Teacher') {
      setMode('teacher_login');
    } else if (role === 'Student') {
      setMode('student_login');
    } else if (role === 'Parent') {
      setMode('parent_login');
    }
  };

  const handleAuth = async (e: React.FormEvent) => {
    e.preventDefault();

    if (lockoutUntil && Date.now() < lockoutUntil) {
      const diff = Math.max(0, Math.ceil((lockoutUntil - Date.now()) / 1000));
      setError(`⚠️ Accès temporairement bloqué suite à 3 tentatives erronées. Veuillez patienter encore ${formatRemainingTime(diff)}.`);
      return;
    }

    setLoading(true);
    setError(null);
    setMessage(null);

    try {
      if (mode === 'student_login') {
        const identifier = sanitizeMatricule(email);
        let studentQuery = supabase
          .from('students')
          .select('*, schools(name)')
          .eq('matricule', identifier)
          .eq('password', password);
        if (schoolId) studentQuery = studentQuery.eq('school_id', schoolId);
        
        const { data: students, error } = await studentQuery;
        
        if (error) throw error;
        if (!students || students.length === 0) {
          if (schoolId) {
            const { data: otherStu } = await supabase
              .from('students')
              .select('id, school_id')
              .eq('matricule', identifier)
              .limit(1);
            if (otherStu && otherStu.length > 0) {
              throw new Error("Accès refusé. Cet élève n'est pas inscrit dans cet établissement.");
            }
          }
          throw new Error(t('auth.invalid_credentials', "Matricule ou mot de passe incorrect."));
        }

        // Reset failed attempts on success
        localStorage.removeItem('sges_auth_failed_attempts');
        localStorage.removeItem('sges_auth_lockout_until');
        setFailedAttempts(0);
        setLockoutUntil(null);

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
        const rawIdentifier = sanitizeText(email);
        const cleanIdent = rawIdentifier.replace(/[^a-zA-Z0-9@._\-]/g, '');
        let teacherQuery = supabase
          .from('teachers')
          .select('*, schools(name)')
          .or(`email.eq.${cleanIdent},matricule.eq.${cleanIdent.toUpperCase()}`)
          .eq('password', password);
        if (schoolId) teacherQuery = teacherQuery.eq('school_id', schoolId);
        
        const { data: teachers, error } = await teacherQuery;
        
        if (error) throw error;
        if (!teachers || teachers.length === 0) {
          if (schoolId) {
            const { data: otherTeach } = await supabase
              .from('teachers')
              .select('id, school_id')
              .or(`email.eq.${cleanIdent},matricule.eq.${cleanIdent.toUpperCase()}`)
              .limit(1);
            if (otherTeach && otherTeach.length > 0) {
              throw new Error("Accès refusé. Cet enseignant n'appartient pas à cet établissement.");
            }
          }
          throw new Error(t('auth.invalid_credentials', "Identifiant ou mot de passe incorrect."));
        }

        // Reset failed attempts on success
        localStorage.removeItem('sges_auth_failed_attempts');
        localStorage.removeItem('sges_auth_lockout_until');
        setFailedAttempts(0);
        setLockoutUntil(null);

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
          email: sanitizeText(email).toLowerCase(),
          password,
        });
        if (authError) throw authError;

        setMessage(t('auth.register_success', 'Inscription réussie ! Veuillez vérifier votre boîte mail pour confirmer votre compte.'));
      } else if (mode === 'accept_invite') {
        if (!inviteDetails) throw new Error("Détails de l'invitation introuvables.");
        
        // Register the user
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: sanitizeText(email).toLowerCase(),
          password,
        });
        
        if (authError) {
          // If user already exists, they might just need to sign in
          if (authError.message.includes('User already registered') || authError.message.includes('already exists')) {
            const { error: signInError } = await supabase.auth.signInWithPassword({ email: sanitizeText(email).toLowerCase(), password });
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
      } else if (mode === 'parent_login') {
        const rawIdentifier = sanitizeText(email);
        const cleanIdent = rawIdentifier.replace(/[^a-zA-Z0-9@._\-\s]/g, '');
        let parentQuery = supabase
          .from('parents')
          .select('*')
          .or(`email.ilike.${cleanIdent},phone.eq.${cleanIdent},phone.ilike.%${cleanIdent}%,first_name.ilike.${cleanIdent},last_name.ilike.${cleanIdent}`)
          .eq('password', password);
        if (schoolId) parentQuery = parentQuery.eq('school_id', schoolId);
        
        const { data: parents, error } = await parentQuery;
        
        if (error) throw error;
        if (!parents || parents.length === 0) {
          if (schoolId) {
            const { data: otherParent } = await supabase
              .from('parents')
              .select('id, school_id')
              .or(`email.ilike.${cleanIdent},phone.eq.${cleanIdent},phone.ilike.%${cleanIdent}%,first_name.ilike.${cleanIdent},last_name.ilike.${cleanIdent}`)
              .limit(1);
            if (otherParent && otherParent.length > 0) {
              throw new Error("Accès refusé. Ce parent n'appartient pas à cet établissement.");
            }
          }
          throw new Error("Identifiant (Email ou Téléphone) ou mot de passe incorrect.");
        }
        
        // Fetch children
        let spQuery = supabase
          .from('student_parents')
          .select('*, students(*, schools(name))')
          .eq('parent_id', parents[0].id);
          
        const { data: spRelations, error: spError } = await spQuery;
          
        if (spError) throw spError;
        if (!spRelations || spRelations.length === 0) {
          throw new Error("Aucun élève n'est associé à ce compte parent.");
        }
        
        // Filter children by school if on school subdomain
        let children = spRelations.map((sp: any) => sp.students).filter(Boolean);
        if (schoolId) {
          children = children.filter((c: any) => c.school_id === schoolId);
          if (children.length === 0) {
            throw new Error("Aucun élève inscrit dans cet établissement n'est lié à ce parent.");
          }
        }

        // Reset failed attempts on success
        localStorage.removeItem('sges_auth_failed_attempts');
        localStorage.removeItem('sges_auth_lockout_until');
        setFailedAttempts(0);
        setLockoutUntil(null);

        localStorage.setItem('sges_is_parent', 'true');
        localStorage.setItem('sges_parent_data', JSON.stringify(parents[0]));
        
        if (children.length > 1) {
          setPendingProfiles(children);
          setPendingMode('student_login');
          setLoading(false);
          return;
        }
        
        if (onStudentLogin) {
          onStudentLogin(children[0]);
        }
      } else if (mode === 'login') {
        const identifier = email.trim().toLowerCase();

        // Super Admin login: verify password then open SuperAdmin portal
        if (identifier === 'konedamaa@gmail.com') {
          if (password === 'Madouu1966@@') {
            try {
              await supabase.auth.signInWithPassword({
                email: identifier,
                password,
              });
            } catch (e) {
              // Fallback if supabase user password differs
            }
            // Reset failed attempts on success
            localStorage.removeItem('sges_auth_failed_attempts');
            localStorage.removeItem('sges_auth_lockout_until');
            localStorage.setItem('sges_super_admin_mode', 'true');
            window.location.reload();
            return;
          }

          const { error: authErr } = await supabase.auth.signInWithPassword({
            email: identifier,
            password,
          });
          if (authErr) {
            throw new Error('Mot de passe incorrect pour le compte Super Admin.');
          }
          // Reset failed attempts on success
          localStorage.removeItem('sges_auth_failed_attempts');
          localStorage.removeItem('sges_auth_lockout_until');
          localStorage.setItem('sges_super_admin_mode', 'true');
          window.location.reload();
          return;
        }

        // Try direct Employee login for all collaborator roles (Director, Secretary, Accountant, Supervisor)
        if (['Director', 'Secretary', 'Accountant', 'Supervisor'].includes(selectedRole)) {
          // SECURITY: require school_id (from subdomain) to restrict login to current school only
          if (!schoolId) {
            throw new Error("Connexion impossible : vous devez accéder via l'adresse dédiée de votre établissement.");
          }

          const { data: employees, error: empError } = await supabase
            .from('employees')
            .select('*, schools(name)')
            .eq('school_id', schoolId)
            .or(`email.ilike.${identifier},phone.eq.${identifier},first_name.ilike.${identifier},last_name.ilike.${identifier}`)
            .eq('password', password);

          if (!empError && employees && employees.length > 0) {
            const userRole = employees[0].role || 'Director';
            localStorage.setItem('sges_login_role', userRole);

            // Reset failed attempts on success
            localStorage.removeItem('sges_auth_failed_attempts');
            localStorage.removeItem('sges_auth_lockout_until');
            setFailedAttempts(0);
            setLockoutUntil(null);

            if (onEmployeeLogin) {
              onEmployeeLogin(employees[0]);
            }
            setLoading(false);
            return;
          } else {
            // Check if this employee exists in another school
            const { data: otherEmp } = await supabase
              .from('employees')
              .select('id, school_id')
              .or(`email.ilike.${identifier},phone.eq.${identifier},first_name.ilike.${identifier},last_name.ilike.${identifier}`)
              .limit(1);
            if (otherEmp && otherEmp.length > 0) {
              throw new Error("Accès refusé. Cet employé n'appartient pas à cet établissement.");
            }
          }
        }

        const { data: authData, error } = await supabase.auth.signInWithPassword({
          email: identifier,
          password,
        });
        if (error) throw error;

        // Verify role mapping
        const SUPER_ADMIN_EMAILS = ['konedamaa@gmail.com'];
        const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(identifier);
        
        if (!isSuperAdmin && authData.user) {
          const { data: adminLinks, error: linkError } = await supabase
            .from('school_admins')
            .select('role, school_id')
            .eq('user_id', authData.user.id);
            
          if (linkError) throw linkError;
          
          if (!adminLinks || adminLinks.length === 0) {
            await supabase.auth.signOut();
            throw new Error("Ce compte n'est pas associé à un établissement.");
          }

          // If on a specific school domain, verify admin has access to this school!
          if (schoolId) {
            const hasSchoolAccess = adminLinks.some((link: any) => link.school_id === schoolId);
            if (!hasSchoolAccess) {
              await supabase.auth.signOut();
              throw new Error("Accès refusé. Ce compte administrateur n'est pas rattaché à cet établissement.");
            }
          }
          
          // Verify that the user has the selected admin role (or if they are logging in as Supervisor, any valid admin role is allowed)
          const targetLinks = schoolId ? adminLinks.filter((l: any) => l.school_id === schoolId) : adminLinks;
          const hasSelectedRole = targetLinks.some((link: any) => 
            link.role === selectedRole || 
            (selectedRole === 'Supervisor' && (link.role === 'Director' || link.role === 'Secretary' || link.role === 'Accountant' || link.role === 'Supervisor'))
          );
          
          if (!hasSelectedRole) {
            await supabase.auth.signOut();
            let roleFr = selectedRole === 'Director' ? 'Administrateur' : 
                         selectedRole === 'Secretary' ? 'Secrétaire' : 
                         selectedRole === 'Accountant' ? 'Comptable' : 'Superviseur';
            throw new Error(`Accès refusé. Vous n'avez pas le rôle ${roleFr} dans cet établissement.`);
          }
        }
        
        // Reset failed attempts on success
        localStorage.removeItem('sges_auth_failed_attempts');
        localStorage.removeItem('sges_auth_lockout_until');
        setFailedAttempts(0);
        setLockoutUntil(null);

        // Save the chosen role to localStorage so App.tsx can use it
        localStorage.setItem('sges_login_role', selectedRole);
      } else if (mode === 'forgot_password') {
        const { error } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: window.location.origin,
        });
        if (error) throw error;
        setMessage(t('auth.reset_link_sent', 'Un lien de réinitialisation a été envoyé à votre adresse email.'));
      }
    } catch (err: any) {
      if (mode === 'login' || mode === 'student_login' || mode === 'teacher_login' || mode === 'parent_login') {
        const nextAttempts = failedAttempts + 1;
        setFailedAttempts(nextAttempts);
        localStorage.setItem('sges_auth_failed_attempts', nextAttempts.toString());

        if (nextAttempts >= MAX_ATTEMPTS) {
          const lockUntil = Date.now() + LOCKOUT_DURATION_MS;
          setLockoutUntil(lockUntil);
          localStorage.setItem('sges_auth_lockout_until', lockUntil.toString());
          setError(`⛔ 3 tentatives incorrectes consécutives. Par mesure de sécurité, l'accès est bloqué pendant 2 minutes. Veuillez patienter 2:00.`);
        } else {
          const remaining = MAX_ATTEMPTS - nextAttempts;
          setError(`${err.message || t('auth.generic_error', 'Une erreur est survenue.')} (${remaining} tentative${remaining > 1 ? 's' : ''} restante${remaining > 1 ? 's' : ''} avant blocage de 2 min)`);
        }
      } else {
        setError(err.message || t('auth.generic_error', 'Une erreur est survenue.'));
      }
    } finally {
      setLoading(false);
    }
  };

  const renderContent = () => {
    if (mode === 'register') {
      return (
        <>
          <h1 className="auth-title">{t('auth.register_title', 'Créer un compte')}</h1>
          <p className="auth-subtitle">{t('auth.register_subtitle', "Rejoignez-nous dès aujourd'hui")}</p>
        </>
      );
    }
    if (mode === 'accept_invite') {
      return (
        <>
          <h1 className="auth-title">Invitation reçue !</h1>
          <p className="auth-subtitle">Vous avez été invité(e) à rejoindre l'école <strong>{inviteDetails?.schools?.name}</strong>. Créez votre mot de passe pour accepter.</p>
        </>
      );
    }
    if (mode === 'forgot_password') {
      return (
        <>
          <h1 className="auth-title">{t('auth.forgot_password_title', 'Mot de passe oublié ?')}</h1>
          <p className="auth-subtitle">{t('auth.forgot_password_subtitle', "Entrez votre email pour réinitialiser votre mot de passe")}</p>
        </>
      );
    }
    
    // Default roles login headers
    switch (selectedRole) {
      case 'Supervisor':
      case 'Director':
      case 'Secretary':
      case 'Accountant':
        return (
          <>
            <h1 className="auth-title">Espace Administration</h1>
            <p className="auth-subtitle">Accès Direction, Secrétariat, Comptabilité et Supervision</p>
          </>
        );
      case 'Teacher':
        return (
          <>
            <h1 className="auth-title">{t('auth.teacher_title', 'Espace Enseignant')}</h1>
            <p className="auth-subtitle">{t('auth.teacher_subtitle', "Saisissez vos notes et gérez vos classes.")}</p>
          </>
        );
      case 'Student':
        return (
          <>
            <h1 className="auth-title">{t('auth.student_title', 'Espace Élève')}</h1>
            <p className="auth-subtitle">{t('auth.student_subtitle', "Consultez votre bulletin et emploi du temps.")}</p>
          </>
        );
      case 'Parent':
        return (
          <>
            <h1 className="auth-title">Espace Parent d'élève</h1>
            <p className="auth-subtitle">Suivez la scolarité, les notes et reçus de votre enfant.</p>
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

  // Role-specific descriptions for the left banner
  const getWelcomeContent = () => {
    switch (selectedRole) {
      case 'Parent':
        return {
          title: 'Content de vous revoir !',
          desc: 'Entrez vos infos pour suivre la scolarité de votre enfant.'
        };
      case 'Student':
        return {
          title: 'Bienvenue cher élève !',
          desc: 'Connectez-vous pour consulter vos notes, bulletins et emplois du temps.'
        };
      case 'Teacher':
        return {
          title: 'Espace Enseignant !',
          desc: 'Accédez à votre cahier de notes, saisissez les évaluations et suivez vos classes.'
        };
      case 'Secretary':
        return {
          title: 'Portail Secrétariat !',
          desc: 'Gérez les inscriptions des élèves, la scolarité et les dossiers administratifs.'
        };
      case 'Accountant':
        return {
          title: 'Gestion Financière !',
          desc: 'Suivez la caisse, les dépenses, factures et règlements d\'écolage.'
        };
      case 'Supervisor':
        return {
          title: 'Supervision Globale !',
          desc: 'Espace de lecture seule, statistiques et impression des rapports.'
        };
      case 'Director':
      default:
        return {
          title: 'Direction & Administration !',
          desc: 'Pilotez l\'ensemble des activités et paramètres de votre établissement.'
        };
    }
  };

  const welcomeInfo = getWelcomeContent();
  const currentRoleCfg = ROLES_CONFIG.find(c => c.role === selectedRole) || ROLES_CONFIG[0];

  return (
    <div className="auth-container">
      {/* Top Header Bar Matching Landing Page */}
      <header className="auth-top-header">
        <a href="#" className="auth-header-logo" onClick={(e) => { e.preventDefault(); if (onBack) onBack(); }}>
          {currentSchool?.logo_url ? (
            <img 
              src={currentSchool.logo_url} 
              alt="Logo" 
              style={{ width: '44px', height: '44px', borderRadius: '10px', objectFit: 'cover', boxShadow: '0 2px 8px rgba(0,0,0,0.12)' }} 
            />
          ) : (
            <span className="auth-header-logo-badge" style={{ width: '42px', height: '42px', fontSize: '1.25rem' }}>
              {(currentSchool?.name || 'S').charAt(0).toUpperCase()}
            </span>
          )}
          <span style={{ color: '#2563eb', fontWeight: 800, fontSize: '1.35rem', letterSpacing: '0.02em', textTransform: 'uppercase' }}>
            {currentSchool?.name || 'GESTION ETABLISSEMENT SCOLAIRE'}
          </span>
        </a>
        <div className="auth-header-nav">
          {onBack && !currentSchool && (
            <a href="#" className="auth-header-link" onClick={(e) => { e.preventDefault(); onBack(); }}>Accueil</a>
          )}
          {onBack && (
            <button className="auth-header-btn" onClick={onBack}>← Retour à l'accueil</button>
          )}
        </div>
      </header>

      {/* Split-Screen Main Auth Card */}
      <div className="auth-split-card">
        {/* Left Blue Wave Panel */}
        <div className="auth-split-left">
          <div>
            {currentSchool?.name && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '10px',
                background: 'rgba(255, 255, 255, 0.25)',
                padding: '8px 18px',
                borderRadius: '24px',
                marginBottom: '18px',
                fontSize: '1.05rem',
                fontWeight: 700,
                color: 'white',
                backdropFilter: 'blur(10px)',
                boxShadow: '0 4px 14px rgba(0,0,0,0.1)'
              }}>
                🏫 {currentSchool.name}
              </div>
            )}
            <h2 className="auth-split-welcome-title">{welcomeInfo.title}</h2>
            <p className="auth-split-welcome-desc">{welcomeInfo.desc}</p>
          </div>

          <div className="auth-split-register-block">
            <p className="auth-split-register-question">Tu n'as pas de compte ?</p>
            <button 
              type="button" 
              className="auth-pill-outline-btn" 
              onClick={() => handleModeSwitch('register')}
            >
              S'inscrire
            </button>
          </div>
        </div>

        {/* Right Form Panel */}
        <div className="auth-split-right">
          <div className="auth-split-form-header">
            {currentSchool?.name && (
              <div style={{
                display: 'inline-flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '10px',
                background: 'linear-gradient(135deg, rgba(37, 99, 235, 0.1) 0%, rgba(59, 130, 246, 0.15) 100%)',
                border: '1.5px solid rgba(37, 99, 235, 0.25)',
                padding: '10px 22px',
                borderRadius: '30px',
                marginBottom: '16px',
                boxShadow: '0 2px 10px rgba(37, 99, 235, 0.08)',
                maxWidth: '100%'
              }}>
                {currentSchool.logo_url ? (
                  <img 
                    src={currentSchool.logo_url} 
                    alt="Logo" 
                    style={{ width: '28px', height: '28px', borderRadius: '8px', objectFit: 'cover' }} 
                  />
                ) : (
                  <span style={{ fontSize: '1.25rem' }}>🏫</span>
                )}
                <span style={{ 
                  color: '#1e40af', 
                  fontWeight: 800, 
                  fontSize: '1.18rem',
                  letterSpacing: '0.02em',
                  textTransform: 'uppercase',
                  textAlign: 'center'
                }}>
                  {currentSchool.name}
                </span>
              </div>
            )}
            <h2 className="auth-split-form-title">Se connecter</h2>
            <p className="auth-split-form-subtitle">
              connexion en tant que {currentRoleCfg.label.toLowerCase()}
            </p>
          </div>

          {/* Role selector mini grid (8 Roles) */}
          {mode !== 'accept_invite' && mode !== 'forgot_password' && mode !== 'register' && (
            <div className="roles-8-grid">
              {ROLES_CONFIG.map((cfg) => {
                const isActive = selectedRole === cfg.role;
                return (
                  <div
                    key={cfg.role}
                    className={`role-8-card ${isActive ? 'active' : ''}`}
                    onClick={() => handleRoleChange(cfg.role)}
                    title={cfg.label}
                  >
                    <div 
                      className="role-8-card-icon-wrapper" 
                      style={{ background: cfg.bg, color: cfg.color }}
                    >
                      {cfg.icon}
                    </div>
                    <span className="role-8-card-title">{cfg.label}</span>
                  </div>
                );
              })}
            </div>
          )}

          {renderContent()}

          {remainingSeconds > 0 && (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid #EF4444',
              borderRadius: '12px',
              padding: '14px 16px',
              marginBottom: '18px',
              display: 'flex',
              alignItems: 'center',
              gap: '12px',
              color: '#991B1B'
            }}>
              <span style={{ fontSize: '1.8rem' }}>⏳</span>
              <div>
                <div style={{ fontWeight: 700, color: '#DC2626', fontSize: '0.95rem' }}>Accès temporairement suspendu (3 échecs)</div>
                <div style={{ fontSize: '0.85rem', marginTop: '2px', color: '#4B5563' }}>
                  Par mesure de sécurité, vous pourrez réessayer dans : <strong style={{ color: '#DC2626', fontSize: '1.05rem', marginLeft: '4px' }}>{formatRemainingTime(remainingSeconds)}</strong>
                </div>
              </div>
            </div>
          )}

          {error && remainingSeconds === 0 && <div className="auth-error">{error}</div>}
          {message && <div className="auth-success">{message}</div>}

          <form onSubmit={handleAuth} className="auth-form">
            {mode !== 'forgot_password' && (
              <>
                {selectedRole === 'Parent' ? (
                  <div className="blue-input-group">
                    <label>numéro de téléphone ou email</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: 0707070707 ou parent@gmail.com"
                      disabled={remainingSeconds > 0}
                      required
                    />
                  </div>
                ) : selectedRole === 'Student' ? (
                  <div className="blue-input-group">
                    <label>matricule de l'élève</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: MAT-2024-001"
                      disabled={remainingSeconds > 0}
                      required
                    />
                  </div>
                ) : selectedRole === 'Teacher' ? (
                  <div className="blue-input-group">
                    <label>identifiant, login ou email</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: prof_maths ou prof@ecole.com"
                      disabled={remainingSeconds > 0}
                      required
                    />
                  </div>
                ) : (
                  <div className="blue-input-group">
                    <label>identifiant / login ou mail</label>
                    <input
                      type="text"
                      className="blue-input"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="ex: KONE ou admin@gmail.com"
                      disabled={mode === 'accept_invite' || remainingSeconds > 0}
                      style={mode === 'accept_invite' ? { background: '#e2e8f0', cursor: 'not-allowed' } : {}}
                      required
                    />
                  </div>
                )}

                <div className="blue-input-group">
                  <label>mot de passe</label>
                  <div className="blue-input-password-wrapper">
                    <input
                      type={showPassword ? "text" : "password"}
                      className="blue-input"
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      disabled={remainingSeconds > 0}
                      required
                    />
                    <button 
                      type="button" 
                      className="eye-toggle-btn" 
                      onClick={() => setShowPassword(!showPassword)}
                      title={showPassword ? "Masquer" : "Afficher"}
                    >
                      {showPassword ? "🙈" : "👁️"}
                    </button>
                  </div>
                </div>
              </>
            )}

            {mode === 'forgot_password' && (
              <div className="blue-input-group">
                <label>mail</label>
                <input
                  type="email"
                  className="blue-input"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="admin@ecole.com"
                  disabled={remainingSeconds > 0}
                  required
                />
              </div>
            )}

            <div className="auth-split-actions">
              <button 
                type="submit" 
                className="auth-pill-primary-btn" 
                disabled={loading || remainingSeconds > 0}
                style={remainingSeconds > 0 ? { background: '#9CA3AF', cursor: 'not-allowed', opacity: 0.7 } : {}}
              >
                {remainingSeconds > 0 ? `Bloqué (${formatRemainingTime(remainingSeconds)})` : (loading ? 'Chargement...' : 'connexion')}
              </button>
              {onBack && (
                <button type="button" className="auth-retour-link" onClick={onBack}>
                  Retour &rsaquo;
                </button>
              )}
            </div>
          </form>

          <div style={{ marginTop: '12px' }}>
            {mode === 'login' || mode === 'parent_login' || mode === 'student_login' || mode === 'teacher_login' ? (
              <button type="button" className="auth-forgot-link" onClick={() => handleModeSwitch('forgot_password')}>
                Mot de passe oublié
              </button>
            ) : mode === 'forgot_password' ? (
              <button type="button" className="auth-forgot-link" onClick={() => handleModeSwitch('login')}>
                Retour à la connexion
              </button>
            ) : null}
          </div>
        </div>
      </div>
    </div>
  );
}
