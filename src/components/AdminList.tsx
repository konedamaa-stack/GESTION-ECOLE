import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export function AdminList() {
  const { t } = useTranslation();
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
            </tr>
          </thead>
          <tbody>
            {admins.length === 0 ? (
              <tr>
                <td colSpan={4} style={{ padding: '32px', textAlign: 'center', color: 'var(--text-secondary)' }}>
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
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
