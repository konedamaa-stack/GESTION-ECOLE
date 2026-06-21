const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const tableRegex = /(<div className="header-search" style=\{\{width: 250\}\}>[\s\S]*?<\/div>\s*<\/div>\s*<\/div>)\s*(<table style=\{\{width: '100%', borderCollapse: 'collapse', marginTop: 10\}\}>[\s\S]*?<\/table>)/;

if (tableRegex.test(code)) {
  let tableCode = code.match(tableRegex)[2];
  
  // Make the name clickable
  tableCode = tableCode.replace(
    /<td style=\{\{padding: '16px 0', fontWeight: 600\}\}>\{row\.first_name\} \{row\.last_name\}<\/td>/g,
    `<td style={{padding: '16px 0', fontWeight: 600}}>
                  <div style={{cursor: 'pointer', color: 'var(--primary-color)'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>
                    {row.first_name} {row.last_name}
                  </div>
                </td>`
  );

  // Shrink the actions column
  const oldActions = `<td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" title="Réinscrire" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={() => { setEditEntity(row); setActiveModal('reinscription'); }}><Icons.RefreshCw /></button>
                  <button className="btn btn-outline" title="Modifier" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('student'); }}>✏️</button>
                  <button className="btn btn-outline" title="Supprimer" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--error-color)', borderColor: 'var(--error-color)'}} onClick={() => handleDeleteStudent(row.id)}>🗑️</button>
                  <button className="btn btn-outline" title="Emploi du temps" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { 
                    if(row.class_id) {
                      setSelectedClassForSchedule(row.class_id);
                      setActiveTab('schedules');
                    } else {
                      alert(t('admin.students.msg_no_class', "Cet élève n'est assigné à aucune classe."));
                    }
                  }}><Icons.Calendar /> Voir l'emploi du temps</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>{t('admin.students.btn_dossier', 'Dossier')}</button>
                </td>`;

  const newActions = `<td style={{padding: '16px 0', textAlign: 'right', whiteSpace: 'nowrap'}}>
                  <button className="btn btn-outline" title="Réinscrire" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={() => { setEditEntity(row); setActiveModal('reinscription'); }}><Icons.RefreshCw /></button>
                  <button className="btn btn-outline" title="Modifier" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('student'); }}>✏️</button>
                  <button className="btn btn-outline" title="Supprimer" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--error-color)', borderColor: 'var(--error-color)'}} onClick={() => handleDeleteStudent(row.id)}>🗑️</button>
                  <button className="btn btn-outline" title="Emploi du temps" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { 
                    if(row.class_id) {
                      setSelectedClassForSchedule(row.class_id);
                      setActiveTab('schedules');
                    } else {
                      alert(t('admin.students.msg_no_class', "Cet élève n'est assigné à aucune classe."));
                    }
                  }}><Icons.Calendar /></button>
                  <button className="btn btn-outline" title="Dossier" style={{padding: '6px 12px'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}><Icons.FileText /></button>
                </td>`;

  tableCode = tableCode.replace(oldActions, newActions);

  // Wrap in table-responsive
  const wrappedTable = `<div className="table-responsive">\n        ${tableCode}\n      </div>`;

  code = code.replace(tableRegex, `$1\n      ${wrappedTable}`);
  fs.writeFileSync('src/App.tsx', code);
  console.log("Patched student table for mobile!");
} else {
  console.log("Could not find table regex!");
}
