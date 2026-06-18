const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');

// 1. Add handleToggleTeacherStatus
const anchorDeleteParent = `  const handleDeleteParent = async (id: string) => {
    if (window.confirm(t('admin.parents.confirm_delete', 'Voulez-vous vraiment supprimer ce parent ?'))) {
      const { error } = await supabase.from('parents').delete().eq('id', id);
      if (error) alert(error.message);
      else fetchParents();
    }
  };`;

const insertToggleTeacher = `
  const handleToggleTeacherStatus = async (id: string, currentStatus: string) => {
    const newStatus = (currentStatus === 'Présent' || currentStatus === 'Actif') ? 'Suspendu' : 'Présent';
    if (window.confirm(\`Voulez-vous vraiment changer le statut de cet enseignant en "\${newStatus}" ?\`)) {
      const { error } = await supabase.from('teachers').update({ status: newStatus }).eq('id', id);
      if (error) alert(error.message);
      else fetchTeachers();
    }
  };`;

if (content.includes(anchorDeleteParent) && !content.includes('handleToggleTeacherStatus')) {
  content = content.replace(anchorDeleteParent, anchorDeleteParent + '\n' + insertToggleTeacher);
}

// 2. Replace the duplicate button and add status badge
const rowSubject = `<td style={{padding: '16px 0'}}><span className="badge badge-primary" style={{background: 'transparent', border: '1px solid var(--border-color)'}}>{row.subject}</span></td>`;
const newRowSubject = `<td style={{padding: '16px 0'}}>
                  <span className="badge badge-primary" style={{background: 'transparent', border: '1px solid var(--border-color)'}}>{row.subject}</span>
                  <span className={\`badge \${row.status === 'Suspendu' ? 'badge-warning' : 'badge-success'}\`} style={{marginLeft: '8px'}}>{row.status || 'Présent'}</span>
                </td>`;

content = content.replace(rowSubject, newRowSubject);

const buttonsSearch = `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('teacher'); }}>✏️</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('teacher'); }}>✏️</button>`;

const buttonsReplace = `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} title="Modifier" onClick={() => { setEditEntity(row); setActiveModal('teacher'); }}>✏️</button>
                  <button className="btn btn-outline" title={row.status === 'Suspendu' ? 'Activer' : 'Suspendre'} style={{padding: '6px 12px', marginRight: '8px', color: row.status === 'Suspendu' ? 'var(--success-color)' : 'var(--error-color)', borderColor: row.status === 'Suspendu' ? 'var(--success-color)' : 'var(--error-color)'}} onClick={() => handleToggleTeacherStatus(row.id, row.status || 'Présent')}>{row.status === 'Suspendu' ? '✅' : '🚫'}</button>`;

if (content.includes(buttonsSearch)) {
  content = content.replace(buttonsSearch, buttonsReplace);
  console.log('Replaced duplicate teacher buttons!');
}

fs.writeFileSync(targetFile, content);
console.log('App.tsx saved!');
