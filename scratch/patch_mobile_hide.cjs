const fs = require('fs');

// 1. Update index.css to add hide-on-mobile class
let css = fs.readFileSync('src/index.css', 'utf8');
if (!css.includes('.hide-on-mobile')) {
  css += `\n\n@media (max-width: 768px) {\n  .hide-on-mobile { display: none !important; }\n}\n`;
  fs.writeFileSync('src/index.css', css);
  console.log("Added .hide-on-mobile to index.css");
}

// 2. Update App.tsx to apply hide-on-mobile
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tableRegex = /(<div className="table-responsive">\s*<table style=\{\{width: '100%', borderCollapse: 'collapse', marginTop: 10\}\}>\s*<thead>\s*<tr style=\{\{borderBottom: '1px solid var\(--border-color\)', textAlign: 'left', color: 'var\(--text-secondary\)'\}\}>)([\s\S]*?)(<\/tr>\s*<\/thead>\s*<tbody>)([\s\S]*?)(<\/tbody>\s*<\/table>\s*<\/div>)/;

if (tableRegex.test(code)) {
  let match = code.match(tableRegex);
  let thead = match[2];
  let tbody = match[4];

  // Apply to thead
  thead = thead.replace(
    /<th style=\{\{padding: '12px 0', fontWeight: 500\}\}>\{t\('admin\.students\.col_matricule', 'Matricule'\)\}<\/th>/g,
    `<th className="hide-on-mobile" style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_matricule', 'Matricule')}</th>`
  );
  thead = thead.replace(
    /<th style=\{\{padding: '12px 0', fontWeight: 500\}\}>\{t\('admin\.students\.col_class', 'Classe'\)\}<\/th>/g,
    `<th className="hide-on-mobile" style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_class', 'Classe')}</th>`
  );
  thead = thead.replace(
    /<th style=\{\{padding: '12px 0', fontWeight: 500\}\}>\{t\('admin\.students\.col_status', 'Statut'\)\}<\/th>/g,
    `<th className="hide-on-mobile" style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_status', 'Statut')}</th>`
  );

  // Apply to tbody
  tbody = tbody.replace(
    /<td style=\{\{padding: '16px 0', fontFamily: 'monospace', color: 'var\(--primary-color\)'\}\}>\{row\.matricule\}<\/td>/g,
    `<td className="hide-on-mobile" style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{row.matricule}</td>`
  );
  tbody = tbody.replace(
    /<td style=\{\{padding: '16px 0'\}\}>\{row\.classes\?\.name \|\| t\('admin\.students\.unassigned', 'Non assigné'\)\}<\/td>/g,
    `<td className="hide-on-mobile" style={{padding: '16px 0'}}>{row.classes?.name || t('admin.students.unassigned', 'Non assigné')}</td>`
  );
  tbody = tbody.replace(
    /<td style=\{\{padding: '16px 0'\}\}><span className=\{\`badge \$\{row\.status === 'Inscrit' \? 'badge-success' : 'badge-warning'\}\`\}>\{row\.status\}<\/span><\/td>/g,
    `<td className="hide-on-mobile" style={{padding: '16px 0'}}><span className={\`badge \${row.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`}>{row.status}</span></td>`
  );

  code = code.replace(tableRegex, `$1${thead}$3${tbody}$5`);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched App.tsx for true mobile fit!");
} else {
  console.log("Regex not matched!");
}
