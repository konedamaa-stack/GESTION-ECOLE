const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let lines = fs.readFileSync(file, 'utf8').split('\n');

const missingCode = `
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_name', 'Nom du Parent')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_child', 'Enfant(s) Associé(s)')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_phone', 'Téléphone')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_access', 'Accès ENT')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.parents.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {parentsData.length > 0 ? parentsData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.first_name} {row.last_name}</td>
                <td style={{padding: '16px 0'}}>-</td>
                <td style={{padding: '16px 0'}}>{row.phone || '-'}</td>
                <td style={{padding: '16px 0'}}>{row.email ? 'Actif' : 'Non configuré'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('parent'); }}>✏️ Modifier</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.parents.empty_state', 'Aucun parent enregistré.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
`;

const newLines = [];
for (let i = 0; i < lines.length; i++) {
  if (lines[i].includes('          <thead>') && lines[i+2] && lines[i+2].includes('const renderSchedules = () => {')) {
    newLines.push(lines[i]);
    newLines.push(missingCode);
    i++; // skip empty line 1181
  } else {
    newLines.push(lines[i]);
  }
}

fs.writeFileSync(file, newLines.join('\n'));
console.log("Fixed!");
