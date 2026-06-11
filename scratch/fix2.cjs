const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

const tableStart = "<table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>";
const nextFuncStart = "const renderSchedules = () => {";

const idx1 = content.indexOf(tableStart);
const idx2 = content.indexOf(nextFuncStart);

if (idx1 !== -1 && idx2 !== -1) {
  const newTable = `<table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_name', 'Nom du Parent')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_child', 'Enfant(s) Associé(s)')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_phone', 'Téléphone')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_access', 'Accès ENT')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.parents.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
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
          </tbody>
        </table>
      </div>
    </div>
  );

  `;
  content = content.substring(0, idx1) + newTable + content.substring(idx2);
  fs.writeFileSync(file, content);
  console.log("Fixed App.tsx table!");
} else {
  console.log("Could not find bounds.");
}
