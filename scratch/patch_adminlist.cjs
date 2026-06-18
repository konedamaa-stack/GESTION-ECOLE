const fs = require('fs');
let content = fs.readFileSync('src/components/AdminList.tsx', 'utf8');

const sqlTarget = `$$;`;
const sqlReplacement = `$$;

create or replace function public.delete_admin_account(target_user_id uuid)
returns void
security definer
language plpgsql
as $$
begin
  if exists (select 1 from public.school_admins where user_id = target_user_id) then
    raise exception 'Cet utilisateur est lié à un établissement et ne peut pas être supprimé.';
  end if;
  
  delete from auth.users where id = target_user_id;
end;
$$;`;

if (content.includes(sqlTarget) && !content.includes('delete_admin_account')) {
  // Replace only the first occurrence within the template literal
  const index = content.indexOf(sqlTarget);
  content = content.substring(0, index) + sqlReplacement + content.substring(index + sqlTarget.length);
}

const funcTarget = `const handleDeleteSchool = async (schoolId: string, schoolName: string) => {`;
const funcReplacement = `const handleDeleteAdmin = async (userId: string, email: string) => {
    if (window.confirm(\`Êtes-vous sûr de vouloir supprimer définitivement le compte sans établissement (\${email}) ?\`)) {
      try {
        const { error } = await supabase.rpc('delete_admin_account', { target_user_id: userId });
        if (error) {
          console.error("Erreur:", error);
          setErrorSQL(true);
        } else {
          alert("Compte supprimé avec succès.");
          fetchAdmins();
        }
      } catch (err) {
        console.error(err);
        alert("Erreur inattendue.");
      }
    }
  };

  const handleDeleteSchool = async (schoolId: string, schoolName: string) => {`;

if (content.includes(funcTarget) && !content.includes('handleDeleteAdmin')) {
  content = content.replace(funcTarget, funcReplacement);
}

const uiTarget = `                    {admin.school_id && (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {onSwitchToSchool && (`;
const uiReplacement = `                    {admin.school_id ? (
                      <div style={{ display: 'flex', gap: '8px', justifyContent: 'flex-end' }}>
                        {onSwitchToSchool && (`;

const uiTarget2 = `                        </button>
                      </div>
                    )}`;
const uiReplacement2 = `                        </button>
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
                    )}`;

if (content.includes(uiTarget)) {
  content = content.replace(uiTarget, uiReplacement);
}
if (content.includes(uiTarget2)) {
  content = content.replace(uiTarget2, uiReplacement2);
}

fs.writeFileSync('src/components/AdminList.tsx', content);
console.log('Patch complete');
