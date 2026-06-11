const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// 1. Add Edit button to students
content = content.replace(
  '<button className="btn btn-outline" style={{padding: \'6px 12px\'}} onClick={() => { setSelectedStudent(row); setActiveModal(\'studentDossier\'); }}>{t(\'admin.students.btn_dossier\', \'Dossier\')}</button>',
  '<button className="btn btn-outline" style={{padding: \'6px 12px\', marginRight: \'8px\'}} onClick={() => { setEditEntity(row); setActiveModal(\'student\'); }}>✏️</button>\n                  <button className="btn btn-outline" style={{padding: \'6px 12px\'}} onClick={() => { setSelectedStudent(row); setActiveModal(\'studentDossier\'); }}>{t(\'admin.students.btn_dossier\', \'Dossier\')}</button>'
);

// 2. Add Edit button to teachers
content = content.replace(
  '<button className="btn btn-outline" style={{padding: \'6px 12px\', fontSize: \'0.8rem\'}} onClick={() => alert(`Identifiants pour ${row.first_name} ${row.last_name}:\\n\\nMatricule: ${row.matricule}\\nMot de passe: ${row.password}`)}>{t(\'admin.teachers.btn_view_ids\', \'Voir les identifiants\')}</button>',
  '<button className="btn btn-outline" style={{padding: \'6px 12px\', marginRight: \'8px\'}} onClick={() => { setEditEntity(row); setActiveModal(\'teacher\'); }}>✏️</button>\n                  <button className="btn btn-outline" style={{padding: \'6px 12px\', fontSize: \'0.8rem\'}} onClick={() => alert(`Identifiants pour ${row.first_name} ${row.last_name}:\\n\\nMatricule: ${row.matricule}\\nMot de passe: ${row.password}`)}>{t(\'admin.teachers.btn_view_ids\', \'Voir les identifiants\')}</button>'
);

// 3. Update parents table to render actual data
const emptyStateParents = `          <tbody>
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.parents.empty_state', 'Aucun parent enregistré.')}</td></tr>
          </tbody>`;

const fullStateParents = `          <tbody>
            {parentsData && parentsData.length > 0 ? parentsData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.first_name} {row.last_name}</td>
                <td style={{padding: '16px 0'}}>-</td>
                <td style={{padding: '16px 0'}}>{row.phone || '-'}</td>
                <td style={{padding: '16px 0'}}>{row.email ? 'Actif' : 'Non configuré'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('parent'); }}>✏️</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.parents.empty_state', 'Aucun parent enregistré.')}</td></tr>
            )}
          </tbody>`;

content = content.replace(emptyStateParents, fullStateParents);

fs.writeFileSync(file, content);
console.log('Script 5 done');
