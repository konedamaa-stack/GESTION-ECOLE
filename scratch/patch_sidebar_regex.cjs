const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

const targetRegex = /<li className=\{\`nav-item \$\{activeTab === 'communication' \? 'active' : ''\}\`\} onClick=\{\(\) => \{ setActiveTab\('communication'\); setIsMobileMenuOpen\(false\); \}\}>\s*<Icons\.MessageSquare \/> \{t\('admin\.sidebar\.communication', 'Communication'\)\}\s*<\/li>/;

const replacement = `<li className={\`nav-item \${activeTab === 'communication' ? 'active' : ''}\`} onClick={() => { setActiveTab('communication'); setIsMobileMenuOpen(false); }}>
            <Icons.MessageSquare /> {t('admin.sidebar.communication', 'Communication')}
          </li>
          <li className={\`nav-item \${activeTab === 'depenses' ? 'active' : ''}\`} onClick={() => { setActiveTab('depenses'); setIsMobileMenuOpen(false); }}>
            <Icons.CreditCard /> {t('admin.sidebar.expenses', 'Dépenses')}
          </li>`;

if (targetRegex.test(code) && !code.includes("t('admin.sidebar.expenses', 'Dépenses')")) {
  code = code.replace(targetRegex, replacement);
  fs.writeFileSync(filePath, code);
  console.log("Successfully inserted Dépenses under Communication!");
} else {
  console.log("Could not find the target regex or it's already patched.");
  console.log("Regex Match:", targetRegex.test(code));
  console.log("Already patched:", code.includes("t('admin.sidebar.expenses', 'Dépenses')"));
}
