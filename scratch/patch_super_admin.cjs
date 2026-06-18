const fs = require('fs');

let appTxt = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Patch showSuperAdmin initial state
const targetState = `const [showSuperAdmin, setShowSuperAdmin] = useState(false);`;
const replacementState = `const [showSuperAdmin, setShowSuperAdmin] = useState(() => localStorage.getItem('sges_super_admin_mode') === 'true');`;

if (appTxt.includes(targetState)) {
  appTxt = appTxt.replace(targetState, replacementState);
}

// 2. Patch setShowSuperAdmin calls
const targetTrue = `setShowSuperAdmin(true);`;
const replacementTrue = `setShowSuperAdmin(true);\n        localStorage.setItem('sges_super_admin_mode', 'true');`;

// We have to be careful with replaceAll vs replace. It's safer to just replace all occurrences of setShowSuperAdmin(true) to include localStorage, except there's only one.
if (appTxt.includes(targetTrue)) {
  appTxt = appTxt.replace(targetTrue, replacementTrue);
}

const targetFalseExit = `onExit={() => setShowSuperAdmin(false)}`;
const replacementFalseExit = `onExit={() => { setShowSuperAdmin(false); localStorage.removeItem('sges_super_admin_mode'); }}`;

if (appTxt.includes(targetFalseExit)) {
  appTxt = appTxt.replace(targetFalseExit, replacementFalseExit);
}

const targetFalseSwitch = `onSwitchToSchool={(id) => { setCurrentSchoolId(id); setShowSuperAdmin(false); }}`;
const replacementFalseSwitch = `onSwitchToSchool={(id) => { setCurrentSchoolId(id); setShowSuperAdmin(false); localStorage.removeItem('sges_super_admin_mode'); }}`;

if (appTxt.includes(targetFalseSwitch)) {
  appTxt = appTxt.replace(targetFalseSwitch, replacementFalseSwitch);
}

fs.writeFileSync('src/App.tsx', appTxt);


// Now patch AdminList.tsx to add the upgrade button
let adminTxt = fs.readFileSync('src/components/AdminList.tsx', 'utf8');

const handleUpgradeTarget = `const handleDeleteSchool = async`;
const handleUpgradeReplacement = `const handleUpgradePro = async (schoolId: string, currentPlan: string) => {
    const newPlan = currentPlan === 'Pro' ? 'Standard' : 'Pro';
    if (window.confirm(\`Voulez-vous passer cet établissement en plan \${newPlan} ?\`)) {
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

  const handleDeleteSchool = async`;

if (adminTxt.includes(handleUpgradeTarget) && !adminTxt.includes('handleUpgradePro')) {
  adminTxt = adminTxt.replace(handleUpgradeTarget, handleUpgradeReplacement);
}

const buttonTarget = `{onSwitchToSchool && (
                          <button 
                            className="btn btn-primary btn-sm" 
                            onClick={() => onSwitchToSchool(admin.school_id)}
                            style={{ padding: '6px 12px', fontSize: '0.85rem' }}
                          >
                            Accéder
                          </button>
                        )}`;

const buttonReplacement = `{onSwitchToSchool && (
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
                        </button>`;

if (adminTxt.includes(buttonTarget) && !adminTxt.includes('handleUpgradePro(')) {
  adminTxt = adminTxt.replace(buttonTarget, buttonReplacement);
}

fs.writeFileSync('src/components/AdminList.tsx', adminTxt);

console.log('Patch complete');
