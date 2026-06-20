const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const target = `<li className={\`nav-item \${activeTab === 'rh' ? 'active' : ''}\`} onClick={() => { setActiveTab('rh'); setIsMobileMenuOpen(false); }}>
              <Icons.Briefcase /> {t('admin.sidebar.rh', 'RH & Admin')}
            </li>`;

const replacement = `<li className={\`nav-item \${activeTab === 'rh' ? 'active' : ''}\`} onClick={() => { setActiveTab('rh'); setIsMobileMenuOpen(false); }}>
              <Icons.Briefcase /> {t('admin.sidebar.rh', 'RH & Admin')}
            </li>
            <li className={\`nav-item \${activeTab === 'depenses' ? 'active' : ''}\`} onClick={() => { setActiveTab('depenses'); setIsMobileMenuOpen(false); }}>
              📉 {t('admin.sidebar.expenses', 'Dépenses')}
            </li>`;

if (code.includes("t('admin.sidebar.rh', 'RH & Admin')") && !code.includes("t('admin.sidebar.expenses', 'Dépenses')")) {
  code = code.replace(target, replacement);
  fs.writeFileSync(filePath, code);
  console.log("Sidebar patched!");
} else {
  console.log("Could not find the target or it's already patched.");
}
