import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';

export function AdminList({ onSwitchToSchool }: { onSwitchToSchool?: (schoolId: string) => void }) {
  const [admins, setAdmins] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [errorSQL, setErrorSQL] = useState(false);

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
      
      if (error) {
        // Si la fonction n'existe pas encore
        console.error("RPC Error:", error);
        setErrorSQL(true);
      } else {
        setAdmins(data || []);
      }
    } catch (err) {
      console.error(err);
      setErrorSQL(true);
    }
    setIsLoading(false);
  };

  const handleDeleteAdmin = async (userId: string, email: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer définitivement le compte sans établissement (${email}) ?`)) {
      try {
        const { error } = await supabase.rpc('delete_admin_account', { target_user_id: userId });
        if (error) {
          console.error("Erreur:", error);
          if (error.message.includes("could not find") || error.message.includes("function")) {
            setErrorSQL(true);
          } else {
            alert("Erreur: " + error.message);
            // Afficher quand même le SQL au cas où le script doit être mis à jour
            setErrorSQL(true);
          }
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
        const { error } = await supabase.from('schools').update({ subscription_plan: newPlan }).eq('id', schoolId);
        if (error) {
          console.error(error);
          alert("Erreur lors du changement de plan.");
        } else {
          fetchAdmins();
        }
      } catch (err) {
        console.error(err);
      }
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {
    if (window.confirm(`Êtes-vous sûr de vouloir supprimer DÉFINITIVEMENT l'établissement "${schoolName}" ? Cette action supprimera toutes les données associées (classes, élèves, notes, etc.).`)) {
      try {
        // Delete related records manually to bypass foreign key constraint errors
        const tables = [
          'admin_invitations', 'school_admins', 'employee_payments', 'teacher_payments',
          'loans', 'expenses', 'invoices', 'attendance', 'absences', 'grades', 'evaluations',
          'teacher_subjects', 'schedules', 'class_subjects', 'teachers', 'employees',
          'subjects', 'classes', 'settings', 'school_settings', 'sms_history', 'support_tickets',
          'parents'
        ];
        
        // Handle student_parents specifically because it links to student_id
        const { data: students } = await supabase.from('students').select('id').eq('school_id', schoolId);
        if (students && students.length > 0) {
          const studentIds = students.map(s => s.id);
          // Delete in chunks if there are too many (Supabase usually allows up to 1000 items in .in())
          for (let i = 0; i < studentIds.length; i += 500) {
            await supabase.from('student_parents').delete().in('student_id', studentIds.slice(i, i + 500));
          }
        }
        await supabase.from('students').delete().eq('school_id', schoolId);

        // Delete all other related records
        for (const table of tables) {
          try {
            const { error: tableError } = await supabase.from(table).delete().eq('school_id', schoolId);
            if (tableError) console.warn(`Failed to delete from ${table}:`, tableError);
          } catch (e) {
            console.warn(`Error deleting from ${table}:`, e);
          }
        }

        // Finally delete the school
        const { error } = await supabase.from('schools').delete().eq('id', schoolId);
        if (error) {
          console.error("Erreur lors de la suppression:", error);
          alert("Erreur lors de la suppression de l'établissement: " + error.message);
        } else {
          alert("Établissement supprimé avec succès.");
          fetchAdmins();
        }
      } catch (err: any) {
        console.error(err);
        alert("Erreur inattendue: " + (err.message || ""));
      }
    }
  };

  const copyToClipboard = () => {
    navigator.clipboard.writeText(sqlScript);
    alert('Code SQL copié ! Collez-le dans le SQL Editor de Supabase et cliquez sur RUN.');
  };

  if (isLoading) {
    return <div style={{ padding: '40px', textAlign: 'center', color: 'var(--text-secondary)' }}>Chargement de la liste des administrateurs...</div>;
  }

  if (errorSQL) {
    return (
      <div style={{ padding: '40px', maxWidth: '800px', margin: '0 auto' }}>
        <div style={{ background: 'var(--surface-color)', padding: '24px', borderRadius: '16px', border: '1px solid var(--danger-color, #ef4444)' }}>
          <h2 style={{ color: 'var(--danger-color, #ef4444)', marginTop: 0 }}>Action Requise</h2>
          <p style={{ color: 'var(--text-secondary)', marginBottom: '16px' }}>
            Pour afficher la liste complète des utilisateurs (emails), nous devons créer une fonction sécurisée dans votre base de données Supabase.
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
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px' }}>
        <h1 className="page-title">Administrateurs Inscrits</h1>
        <div style={{ background: 'var(--surface-color)', padding: '8px 16px', borderRadius: '8px', border: '1px solid var(--border-color)', fontWeight: 600 }}>
          Total : {admins.length} comptes
        </div>
      </div>

      <div className="table-container" style={{ background: 'var(--surface-color)', borderRadius: '16px', overflow: 'hidden', border: '1px solid var(--border-color)' }}>
        <table className="data-table" style={{ width: '100%', borderCollapse: 'collapse' }}>
          <thead>
            <tr style={{ background: 'var(--surface-color-hover)', borderBottom: '1px solid var(--border-color)' }}>
              <th style={{ padding: '16px', textAlign: 'left' }}>Email Administrateur</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Établissement</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Plan Actuel</th>
              <th style={{ padding: '16px', textAlign: 'left' }}>Date d'inscription</th>
              <th style={{ padding: '16px', textAlign: 'right' }}>Action</th>
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
                  Aucun administrateur trouvé.
                </td>
              </tr>
            ) : (
              admins.map((admin, idx) => (
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
                    {new Date(admin.created_at).toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' })}
                  </td>
                  <td style={{ padding: '16px', textAlign: 'right' }}>
                    {admin.school_id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {onSwitchToSchool && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => onSwitchToSchool(admin.school_id)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            Accéder
                          </button>
                        )}
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
    </div>
  );
}
