import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AdminList({ onSwitchToSchool }: { onSwitchToSchool?: (schoolId: string) => void }) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorSQL, setErrorSQL] = useState(false);

  // Search, Filter & Sort States
  const [searchQuery, setSearchQuery] = useState('');
  const [schoolFilter, setSchoolFilter] = useState<string>('all');
  const [dateFilter, setDateFilter] = useState<'all' | 'today' | 'this_week' | 'this_month' | 'custom'>('all');
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
  const [sortBy, setSortBy] = useState<'date' | 'school' | 'email'>('date');
  const [sortOrder, setSortOrder] = useState<'desc' | 'asc'>('desc');

  // Edit Modal state
  const [editingSchool, setEditingSchool] = useState<{ id: string; name: string; subdomain: string } | null>(null);
  const [newSubdomainInput, setNewSubdomainInput] = useState('');
  const [newNameInput, setNewNameInput] = useState('');

  // Create School Modal state
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [createSchoolName, setCreateSchoolName] = useState('');
  const [createSubdomain, setCreateSubdomain] = useState('');
  const [createPlan, setCreatePlan] = useState('Pro');
  const [createAdminFirstName, setCreateAdminFirstName] = useState('');
  const [createAdminLastName, setCreateAdminLastName] = useState('');
  const [createAdminEmail, setCreateAdminEmail] = useState('');
  const [createAdminPhone, setCreateAdminPhone] = useState('');
  const [createAdminPassword, setCreateAdminPassword] = useState('passer123');
  const [isCreatingSchool, setIsCreatingSchool] = useState(false);

  const sqlScript = `alter table public.schools add column if not exists subscription_plan varchar(50) default 'Standard';

create or replace function public.get_all_admins()
returns table (
  user_id uuid,
  email varchar,
  school_id uuid,
  school_name varchar,
  subscription_plan varchar,
  created_at timestamptz
)
security definer
language sql
as $$
  select 
    u.id as user_id,
    u.email::varchar,
    s.id as school_id,
    s.name::varchar as school_name,
    s.subscription_plan::varchar as subscription_plan,
    u.created_at
  from auth.users u
  left join public.school_admins sa on sa.user_id = u.id
  left join public.schools s on s.id = sa.school_id;
$$;

create or replace function public.delete_admin_account(target_user_id uuid)
returns void
security definer
language plpgsql
as $$
begin
  -- Nettoyage des références orphelines
  delete from public.support_tickets where user_id = target_user_id;
  delete from public.admin_invitations where invited_by = target_user_id;
  delete from public.school_admins where user_id = target_user_id;
  
  -- Suppression de l'utilisateur
  delete from auth.users where id = target_user_id;
end;
$$;`;

  useEffect(() => {
    fetchAdmins();
  }, []);

  const fetchAdmins = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase.rpc('get_all_admins');
      
      if (!error && data && data.length > 0) {
        setAdmins(data);
      } else {
        // Direct table fallback
        const { data: schoolsData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (schoolsData && schoolsData.length > 0) {
          const formatted = schoolsData.map((s: any) => ({
            school_id: s.id,
            school_name: s.name,
            subscription_plan: s.subscription_plan || 'Standard',
            created_at: s.created_at,
            email: s.contact_email || s.name?.toLowerCase().replace(/\s+/g, '') + '@ecole.com',
            user_id: s.id
          }));
          setAdmins(formatted);
        } else {
          setAdmins(data || []);
        }
      }
    } catch (err) {
      console.error(err);
      try {
        const { data: schoolsData } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
        if (schoolsData) {
          setAdmins(schoolsData.map((s: any) => ({
            school_id: s.id,
            school_name: s.name,
            subscription_plan: s.subscription_plan || 'Standard',
            created_at: s.created_at,
            email: s.contact_email || 'admin@ecole.com',
            user_id: s.id
          })));
        } else {
          setErrorSQL(true);
        }
      } catch (e) {
        setErrorSQL(true);
      }
    }
    setIsLoading(false);
  };

  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte sans établissement (${email}) ?`)) {
      try {
        const { error } = await supabase.rpc('delete_admin_account', { target_user_id: userId });
        if (error) {
          console.error("Erreur:", error);
          setErrorSQL(true);
        } else {
          alert("Compte supprimé avec succès.");
          fetchAdmins();
        }
      } catch (err: any) {
        console.error(err);
        alert("Erreur inattendue: " + (err.message || ""));
      }
    }
  };

  const handleUpgradePro = async (schoolId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'Pro' ? 'Standard' : 'Pro';
    if (window.confirm(`Voulez-vous passer cet établissement en plan ${newPlan} ?`)) {
      try {
        const { error } = await supabase
          .from('schools')
          .update({ subscription_plan: newPlan })
          .eq('id', schoolId);
        
        if (error) {
          alert("Erreur lors de la mise à jour : " + error.message);
        } else {
          alert(`Établissement passé en plan ${newPlan} avec succès.`);
          fetchAdmins();
        }
      } catch (err: any) {
        alert("Erreur: " + err.message);
      }
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (window.confirm(`⚠️ ATTENTION : Êtes-vous sûr de vouloir supprimer définitivement l'établissement "${schoolName}" ainsi que TOUTES ses données (élèves, notes, payements, etc.) ?`)) {
      try {
        const { error } = await supabase.from('schools').delete().eq('id', schoolId);
        if (error) {
          alert("Erreur lors de la suppression : " + error.message);
        } else {
          alert(`L'établissement "${schoolName}" a été supprimé.`);
          fetchAdmins();
        }
      } catch (err: any) {
        alert("Erreur: " + err.message);
      }
    }
  };

  const handleOpenEditSubdomain = async (schoolId: string, currentName: string) => {
    try {
      const { data } = await supabase.from('schools').select('name, subdomain').eq('id', schoolId).single();
      const currentSub = data?.subdomain || (currentName ? currentName.toLowerCase().replace(/[^a-z0-9-]/g, '') : '');
      setEditingSchool({ id: schoolId, name: data?.name || currentName, subdomain: currentSub });
      setNewNameInput(data?.name || currentName || '');
      setNewSubdomainInput(currentSub);
    } catch (err: any) {
      alert("Erreur lors de la récupération : " + err.message);
    }
  };

  const handleSaveSubdomain = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingSchool) return;
    const cleanSub = newSubdomainInput.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (!cleanSub) {
      alert("Veuillez saisir un sous-domaine valide.");
      return;
    }
    try {
      const { error } = await supabase
        .from('schools')
        .update({ name: newNameInput.trim(), subdomain: cleanSub })
        .eq('id', editingSchool.id);
      
      if (error) {
        alert("Erreur lors de la mise à jour : " + error.message);
      } else {
        alert(`Établissement mis à jour avec succès !\n\nNouvelle URL : https://${cleanSub}.solutionecoles.com`);
        setEditingSchool(null);
        fetchAdmins();
      }
    } catch (err: any) {
      alert("Erreur: " + err.message);
    }
  };

  const handleCreateSchoolNameChange = (val: string) => {
    setCreateSchoolName(val);
    const slug = val.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    setCreateSubdomain(slug);
  };

  const handleCreateSchoolSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const cleanSub = createSubdomain.toLowerCase().replace(/[^a-z0-9-]/g, '').trim();
    if (!createSchoolName.trim() || !cleanSub) {
      alert("Veuillez remplir le nom de l'établissement et le sous-domaine.");
      return;
    }

    setIsCreatingSchool(true);
    try {
      // 1. Check if subdomain exists
      const { data: existing } = await supabase.from('schools').select('id').eq('subdomain', cleanSub).maybeSingle();
      if (existing) {
        alert(`Le sous-domaine "${cleanSub}" est déjà utilisé. Veuillez en choisir un autre.`);
        setIsCreatingSchool(false);
        return;
      }

      // 2. Insert school
      const { data: school, error: schoolErr } = await supabase
        .from('schools')
        .insert([{
          name: createSchoolName.trim(),
          subdomain: cleanSub,
          subscription_plan: createPlan
        }])
        .select()
        .single();

      if (schoolErr) throw schoolErr;

      // 3. Insert Director Employee if name/email is provided
      if (createAdminFirstName || createAdminEmail) {
        const { error: empErr } = await supabase.from('employees').insert([{
          school_id: school.id,
          first_name: createAdminFirstName.trim() || 'Directeur',
          last_name: createAdminLastName.trim() || createSchoolName.trim(),
          email: createAdminEmail.trim() || cleanSub,
          phone: createAdminPhone.trim() || null,
          role: 'Director',
          password: createAdminPassword.trim() || 'passer123'
        }]);
        if (empErr) console.warn("Note creation employé:", empErr.message);
      }

      alert(`🎉 Établissement "${createSchoolName}" créé avec succès !\n\n` +
            `🌐 URL unique : https://${cleanSub}.solutionecoles.com\n` +
            `👤 Administrateur : ${createAdminFirstName} ${createAdminLastName} (${createAdminEmail || cleanSub})\n` +
            `🔑 Mot de passe : ${createAdminPassword}`);

      setIsCreateModalOpen(false);
      setCreateSchoolName('');
      setCreateSubdomain('');
      setCreateAdminFirstName('');
      setCreateAdminLastName('');
      setCreateAdminEmail('');
      setCreateAdminPhone('');
      setCreateAdminPassword('passer123');
      fetchAdmins();
    } catch (err: any) {
      alert("Erreur lors de la création : " + (err.message || err));
    } finally {
      setIsCreatingSchool(false);
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert("Script SQL copié dans le presse-papier !");
  };

  // Get list of distinct school names for the school dropdown filter
  const uniqueSchoolNames = Array.from(
    new Set(admins.map(a => a.school_name).filter(Boolean))
  ).sort();

  // Column Sort Toggle Handler
  const handleColumnSort = (column: 'date' | 'school' | 'email') => {
    if (sortBy === column) {
      setSortOrder(sortOrder === 'desc' ? 'asc' : 'desc');
    } else {
      setSortBy(column);
      setSortOrder(column === 'date' ? 'desc' : 'asc');
    }
  };

  // Filter & Sort Logic
  const filteredAndSortedAdmins = admins.filter(admin => {
    // 1. Search Query filter
    const matchesSearch = 
      (admin.email || '').toLowerCase().includes(searchQuery.toLowerCase()) ||
      (admin.school_name || '').toLowerCase().includes(searchQuery.toLowerCase());
    if (!matchesSearch) return false;

    // 2. School filter
    if (schoolFilter === 'no_school' && admin.school_name) return false;
    if (schoolFilter !== 'all' && schoolFilter !== 'no_school' && admin.school_name !== schoolFilter) return false;

    // 3. Date filter
    if (!admin.created_at) return true;
    const adminDate = new Date(admin.created_at);
    
    if (dateFilter === 'today') {
      const today = new Date();
      return adminDate.toDateString() === today.toDateString();
    }
    if (dateFilter === 'this_week') {
      const now = new Date();
      const startOfWeek = new Date(now.setDate(now.getDate() - now.getDay()));
      startOfWeek.setHours(0,0,0,0);
      return adminDate >= startOfWeek;
    }
    if (dateFilter === 'this_month') {
      const today = new Date();
      return adminDate.getMonth() === today.getMonth() && adminDate.getFullYear() === today.getFullYear();
    }
    if (dateFilter === 'custom') {
      if (startDate) {
        const start = new Date(startDate);
        start.setHours(0,0,0,0);
        if (adminDate < start) return false;
      }
      if (endDate) {
        const end = new Date(endDate);
        end.setHours(23,59,59,999);
        if (adminDate > end) return false;
      }
    }
    return true;
  }).sort((a, b) => {
    if (sortBy === 'school') {
      const nameA = a.school_name || 'ZZZ';
      const nameB = b.school_name || 'ZZZ';
      return sortOrder === 'desc' ? nameB.localeCompare(nameA) : nameA.localeCompare(nameB);
    } else if (sortBy === 'email') {
      const emailA = a.email || '';
      const emailB = b.email || '';
      return sortOrder === 'desc' ? emailB.localeCompare(emailA) : emailA.localeCompare(emailB);
    } else {
      const dateA = new Date(a.created_at || 0).getTime();
      const dateB = new Date(b.created_at || 0).getTime();
      return sortOrder === 'desc' ? dateB - dateA : dateA - dateB;
    }
  });

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center' }}>Chargement des administrateurs...</div>;
  }

  if (errorSQL) {
    return (
      <div style={{ padding: '24px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: '#FEF2F2', border: '1px solid #FCA5A5', borderRadius: '12px', padding: '24px', color: '#991B1B' }}>
          <h3 style={{ marginTop: 0 }}>Configuration Supabase Requise</h3>
          <p>
            Pour afficher la liste complète des comptes inscrits et gérer leurs établissements, vous devez exécuter le script SQL de mise à jour dans votre base de données Supabase.
          </p>
          <ol style={{ paddingLeft: '20px', marginBottom: '24px', color: 'var(--text-secondary)' }}>
            <li style={{ marginBottom: '8px' }}>Copiez le code SQL ci-dessous.</li>
            <li style={{ marginBottom: '8px' }}>Allez sur votre tableau de bord <b>Supabase</b> {'>'} <b>SQL Editor</b>.</li>
            <li style={{ marginBottom: '8px' }}>Collez le code et cliquez sur <b>RUN</b>.</li>
            <li>Revenez sur cette page et rafraîchissez.</li>
          </ol>
          <div style={{ position: 'relative' }}>
            <pre style={{ background: '#111827', color: '#fff', padding: '16px', borderRadius: '8px', overflowX: 'auto', fontSize: '0.85rem' }}>
              {sqlScript}
            </pre>
            <button 
              onClick={copyToClipboard}
              style={{ position: 'absolute', top: '12px', right: '12px', background: 'rgba(255,255,255,0.1)', color: '#fff', border: 'none', padding: '6px 12px', borderRadius: '4px', cursor: 'pointer' }}
            >
              Copier le SQL
            </button>
          </div>
          <button 
            className="btn btn-primary" 
            style={{ marginTop: '24px' }}
            onClick={() => { setErrorSQL(false); fetchAdmins(); }}
          >
            J'ai exécuté le code, réessayer
          </button>
        </div>
      </div>
    );
  }

  return (
    <div style={{ padding: '24px', maxWidth: '1200px', margin: '0 auto' }}>
      {/* Title & Counter */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        <h1 className="page-title" style={{ margin: 0 }}>Administrateurs Inscrits</h1>
        <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
          <button 
            onClick={() => setIsCreateModalOpen(true)}
            style={{ padding: '8px 16px', background: '#10B981', color: '#fff', border: 'none', borderRadius: '8px', fontWeight: 600, cursor: 'pointer', fontSize: '0.9rem', display: 'flex', alignItems: 'center', gap: '6px', boxShadow: '0 2px 4px rgba(16, 185, 129, 0.2)' }}
          >
            ➕ Créer un Établissement
          </button>
          <div style={{ background: 'var(--surface-color)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
            Total : {filteredAndSortedAdmins.length} comptes {filteredAndSortedAdmins.length !== admins.length && `(sur ${admins.length})`}
          </div>
        </div>
      </div>

      {/* Filter Toolbar */}
      <div style={{ background: 'var(--surface-color)', padding: '16px 20px', borderRadius: '12px', border: '1px solid var(--border-color)', marginBottom: '20px', display: 'flex', flexDirection: 'column', gap: '16px' }}>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between' }}>
          {/* Search Bar */}
          <div style={{ flex: '1', minWidth: '240px' }}>
            <input
              type="text"
              placeholder="🔍 Rechercher par email ou établissement..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              style={{ width: '100%', padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '0.9rem', outline: 'none' }}
            />
          </div>

          {/* School Filter Dropdown */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
              🏫 Établissement :
            </label>
            <select
              value={schoolFilter}
              onChange={(e) => setSchoolFilter(e.target.value)}
              style={{ padding: '10px 14px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '0.9rem', cursor: 'pointer', outline: 'none', maxWidth: '220px' }}
            >
              <option value="all">Tous les établissements</option>
              <option value="no_school">Sans établissement (Comptes orphelins)</option>
              {uniqueSchoolNames.map((sName: any) => (
                <option key={sName} value={sName}>{sName}</option>
              ))}
            </select>
          </div>
        </div>

        {/* Date Filter Toolbar & Order Switcher */}
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: '16px', alignItems: 'center', justifyContent: 'space-between', borderTop: '1px solid var(--border-color)', paddingTop: '14px' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flexWrap: 'wrap' }}>
            <label style={{ fontSize: '0.88rem', fontWeight: 600, color: 'var(--text-secondary)' }}>
              📅 Date d'inscription :
            </label>
            <select
              value={dateFilter}
              onChange={(e) => setDateFilter(e.target.value as any)}
              style={{ padding: '8px 12px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '0.88rem', cursor: 'pointer', outline: 'none' }}
            >
              <option value="all">Toutes les dates</option>
              <option value="today">Aujourd'hui</option>
              <option value="this_week">Cette semaine</option>
              <option value="this_month">Ce mois-ci</option>
              <option value="custom">Période personnalisée</option>
            </select>

            {/* Custom Date Range */}
            {dateFilter === 'custom' && (
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <input
                  type="date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '0.85rem' }}
                  title="Date de début"
                />
                <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>à</span>
                <input
                  type="date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  style={{ padding: '7px 10px', borderRadius: '8px', border: '1px solid var(--border-color)', background: 'var(--background-color)', color: 'var(--text-color)', fontSize: '0.85rem' }}
                  title="Date de fin"
                />
              </div>
            )}
          </div>

          {/* Quick Reset Filters Button */}
          {(searchQuery || schoolFilter !== 'all' || dateFilter !== 'all') && (
            <button
              onClick={() => { setSearchQuery(''); setSchoolFilter('all'); setDateFilter('all'); setStartDate(''); setEndDate(''); }}
              style={{ padding: '6px 12px', borderRadius: '6px', border: '1px solid var(--border-color)', background: 'transparent', color: 'var(--text-secondary)', fontSize: '0.82rem', cursor: 'pointer' }}
            >
              🔄 Réinitialiser filtres
            </button>
          )}
        </div>
      </div>

      {/* Data Table */}
      <div className="table-container" style={{ background: 'var(--surface-color)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-color-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th 
                style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleColumnSort('email')}
                title="Cliquer pour trier par email"
              >
                Email Administrateur {sortBy === 'email' && (sortOrder === 'desc' ? '⬇️' : '⬆️')}
              </th>
              <th 
                style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleColumnSort('school')}
                title="Cliquer pour trier par établissement"
              >
                Établissement {sortBy === 'school' && (sortOrder === 'desc' ? '⬇️' : '⬆️')}
              </th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Plan Actuel</th>
              <th 
                style={{ padding: '16px', textAlign: 'left', cursor: 'pointer', userSelect: 'none' }}
                onClick={() => handleColumnSort('date')}
                title="Cliquer pour trier par date d'inscription"
              >
                Date d'inscription {sortBy === 'date' && (sortOrder === 'desc' ? '⬇️' : '⬆️')}
              </th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredAndSortedAdmins.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  {admins.length === 0 ? "Aucun administrateur trouvé." : "Aucun résultat ne correspond aux filtres d'établissement et de recherche."}
                </td>
              </tr>
            ) : (
              filteredAndSortedAdmins.map((admin, idx) => (
                <tr key={`${admin.user_id}-${idx}`} style={{ borderBottom: '1px solid var(--border-color)' }}>
                  <td style={{ padding: '16px', fontWeight: 500 }}>{admin.email}</td>
                  <td style={{ padding: '16px' }}>
                    {admin.school_name ? (
                      <span style={{ background: 'var(--surface-color-hover)', padding: '4px 8px', borderRadius: '4px' }}>{admin.school_name}</span>
                    ) : (
                      <span style={{ color: 'var(--text-secondary)' }}>Aucun établissement lié</span>
                    )}
                  </td>
                  <td style={{ padding: '16px' }}>
                    {admin.subscription_plan === 'Pro' ? (
                      <span className="badge" style={{ background: 'rgba(139, 92, 246, 0.1)', color: '#8B5CF6' }}>Pro</span>
                    ) : admin.subscription_plan ? (
                      <span className="badge badge-info">Standard</span>
                    ) : (
                      '-'
                    )}
                  </td>
                  <td style={{ padding: '16px', color: 'var(--text-secondary)' }}>
                    {admin.created_at ? new Date(admin.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' }) : '-'}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {admin.school_id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {onSwitchToSchool && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => onSwitchToSchool(admin.school_id)}
                            style={{ padding: '6px 14px', fontSize: '0.85rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', fontWeight: 600, cursor: 'pointer', display: 'inline-flex', alignItems: 'center', gap: '4px', boxShadow: '0 2px 6px rgba(37,99,235,0.3)' }}
                          >
                            🚀 Accéder
                          </button>
                        )}
                        <button 
                          onClick={() => handleOpenEditSubdomain(admin.school_id, admin.school_name)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#2563EB', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                          title="Modifier le sous-domaine unique"
                        >
                          ✏️ Éditer
                        </button>
                        <button 
                          onClick={() => handleUpgradePro(admin.school_id, admin.subscription_plan)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: admin.subscription_plan === 'Pro' ? '#F59E0B' : '#10B981', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          {admin.subscription_plan === 'Pro' ? 'Rétrograder (Standard)' : 'Passer en Pro'}
                        </button>
                        <button 
                          onClick={() => handleDeleteSchool(admin.school_id, admin.school_name || 'Inconnu')}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Supprimer
                        </button>
                      </div>
                    ) : (
                      <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                        <button 
                          onClick={() => handleDeleteAdmin(admin.user_id, admin.email)}
                          style={{ padding: '6px 12px', fontSize: '0.85rem', background: '#EF4444', color: 'white', border: 'none', borderRadius: '4px', cursor: 'pointer' }}
                        >
                          Supprimer le compte
                        </button>
                      </div>
                    )}
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      {editingSchool && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '24px', borderRadius: '12px', width: '420px', maxWidth: '90%', boxShadow: '0 20px 25px -5px rgba(0, 0, 0, 0.1)', color: '#111827' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.25rem' }}>Gérer l'Établissement & Sous-domaine</h3>
            <form onSubmit={handleSaveSubdomain}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nom de l'établissement</label>
                <input 
                  type="text" 
                  value={newNameInput} 
                  onChange={(e) => setNewNameInput(e.target.value)} 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                  required
                />
              </div>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Sous-domaine unique</label>
                <input 
                  type="text" 
                  value={newSubdomainInput} 
                  onChange={(e) => setNewSubdomainInput(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                  placeholder="ex: saint-joseph" 
                  style={{ width: '100%', padding: '10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                  required
                />
                <small style={{ color: '#6B7280', display: 'block', marginTop: '6px' }}>
                  URL finale : <strong>https://{newSubdomainInput || 'sous-domaine'}.solutionecoles.com</strong>
                </small>
              </div>
              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '20px' }}>
                <button type="button" onClick={() => setEditingSchool(null)} style={{ padding: '8px 16px', background: 'transparent', border: '1px solid #D1D5DB', borderRadius: '6px', cursor: 'pointer' }}>Annuler</button>
                <button type="submit" style={{ padding: '8px 16px', background: '#2563EB', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', fontWeight: 600 }}>Sauvegarder</button>
              </div>
            </form>
          </div>
        </div>
      )}
      {/* Modal Créer Établissement */}
      {isCreateModalOpen && (
        <div style={{ position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ background: '#fff', padding: '28px', borderRadius: '16px', width: '520px', maxWidth: '92%', maxHeight: '90vh', overflowY: 'auto', boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)', color: '#111827' }}>
            <h3 style={{ marginTop: 0, fontSize: '1.3rem', borderBottom: '1px solid #E5E7EB', paddingBottom: '12px', color: '#111827' }}>➕ Créer un Nouvel Établissement</h3>
            <form onSubmit={handleCreateSchoolSubmit}>
              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Nom de l'Établissement *</label>
                <input 
                  type="text" 
                  value={createSchoolName} 
                  onChange={(e) => handleCreateSchoolNameChange(e.target.value)} 
                  placeholder="ex: Lycée Excellence de Dakar" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }} 
                  required
                />
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Sous-domaine Unique *</label>
                <input 
                  type="text" 
                  value={createSubdomain} 
                  onChange={(e) => setCreateSubdomain(e.target.value.toLowerCase().replace(/[^a-z0-9-]/g, ''))} 
                  placeholder="ex: lycee-excellence" 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }} 
                  required
                />
                <small style={{ color: '#2563EB', display: 'block', marginTop: '4px', fontWeight: 500 }}>
                  🌐 URL finale : <strong>https://{createSubdomain || 'sous-domaine'}.solutionecoles.com</strong>
                </small>
              </div>

              <div style={{ marginBottom: '16px' }}>
                <label style={{ display: 'block', marginBottom: '6px', fontWeight: 600 }}>Plan d'abonnement</label>
                <select 
                  value={createPlan} 
                  onChange={(e) => setCreatePlan(e.target.value)} 
                  style={{ width: '100%', padding: '10px 12px', borderRadius: '8px', border: '1px solid #D1D5DB', fontSize: '0.95rem' }}
                >
                  <option value="Pro">Pro (Illimité)</option>
                  <option value="Standard">Standard (Limité à 20 élèves)</option>
                </select>
              </div>

              <div style={{ borderTop: '1px solid #E5E7EB', paddingTop: '16px', marginTop: '16px' }}>
                <h4 style={{ margin: '0 0 12px 0', color: '#374151', fontSize: '1rem' }}>👤 Compte Administrateur / Directeur Principal</h4>
                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Prénom</label>
                    <input 
                      type="text" 
                      value={createAdminFirstName} 
                      onChange={(e) => setCreateAdminFirstName(e.target.value)} 
                      placeholder="Mamadou" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Nom</label>
                    <input 
                      type="text" 
                      value={createAdminLastName} 
                      onChange={(e) => setCreateAdminLastName(e.target.value)} 
                      placeholder="KONE" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                    />
                  </div>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px', marginBottom: '12px' }}>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Email ou Identifiant</label>
                    <input 
                      type="text" 
                      value={createAdminEmail} 
                      onChange={(e) => setCreateAdminEmail(e.target.value)} 
                      placeholder="directeur@ecole.com ou KONE" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                    />
                  </div>
                  <div>
                    <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Téléphone</label>
                    <input 
                      type="tel" 
                      value={createAdminPhone} 
                      onChange={(e) => setCreateAdminPhone(e.target.value)} 
                      placeholder="+221 77 000 00 00" 
                      style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                    />
                  </div>
                </div>

                <div>
                  <label style={{ display: 'block', marginBottom: '4px', fontSize: '0.85rem', fontWeight: 600 }}>Mot de passe *</label>
                  <input 
                    type="text" 
                    value={createAdminPassword} 
                    onChange={(e) => setCreateAdminPassword(e.target.value)} 
                    placeholder="passer123" 
                    style={{ width: '100%', padding: '8px 10px', borderRadius: '6px', border: '1px solid #D1D5DB' }} 
                    required
                  />
                </div>
              </div>

              <div style={{ display: 'flex', justifyContent: 'flex-end', gap: '12px', marginTop: '24px' }}>
                <button type="button" onClick={() => setIsCreateModalOpen(false)} style={{ padding: '10px 18px', background: 'transparent', border: '1px solid #D1D5DB', borderRadius: '8px', cursor: 'pointer', fontWeight: 500 }}>Annuler</button>
                <button type="submit" disabled={isCreatingSchool} style={{ padding: '10px 20px', background: '#10B981', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}>
                  {isCreatingSchool ? 'Création...' : 'Créer l\'Établissement'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
