const fs = require('fs');
let appTxt = fs.readFileSync('src/App.tsx', 'utf8');

const targetBtn = `<button className="btn btn-primary" style={{width: '100%', background: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={async () => {
                      if (currentSchoolId) {
                        await supabase.from('schools').update({ subscription_plan: 'Pro' }).eq('id', currentSchoolId);
                      }
                      setCurrentSchoolPlan('Pro');
                      alert('Félicitations ! Vous avez débloqué le plan Pro. Vous avez désormais accès à la Comptabilité et aux Ressources Humaines.');
                    }}>{t('admin.settings.sub_btn_upgrade', 'Passer en Pro')}</button>`;

const replacementBtn = `<button className="btn btn-primary" style={{width: '100%', background: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={async () => {
                      const isSuperAdmin = session?.user?.email === 'konedamaa@gmail.com';
                      if (!isSuperAdmin) {
                        alert("Votre demande a été enregistrée. Veuillez contacter l'administrateur pour activer la version Pro.");
                        return;
                      }
                      if (currentSchoolId) {
                        await supabase.from('schools').update({ subscription_plan: 'Pro' }).eq('id', currentSchoolId);
                      }
                      setCurrentSchoolPlan('Pro');
                      alert('Félicitations ! Vous avez débloqué le plan Pro. Vous avez désormais accès à la Comptabilité et aux Ressources Humaines.');
                    }}>{session?.user?.email === 'konedamaa@gmail.com' ? t('admin.settings.sub_btn_upgrade', 'Passer en Pro (Admin)') : 'Demander la version Pro'}</button>`;

if (appTxt.includes(targetBtn)) {
  appTxt = appTxt.replace(targetBtn, replacementBtn);
  fs.writeFileSync('src/App.tsx', appTxt);
  console.log('Patch success');
} else {
  console.log('Target not found');
}
