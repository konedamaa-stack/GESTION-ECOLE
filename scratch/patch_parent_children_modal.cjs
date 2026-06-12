const fs = require('fs');
let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Update fetchParents to include IDs
content = content.replace(
  "const { data } = await supabase.from('parents').select('*, student_parents(students(first_name, last_name))').eq('school_id', currentSchoolId || '');",
  "const { data } = await supabase.from('parents').select('*, student_parents(student_id, parent_id, students(id, first_name, last_name))').eq('school_id', currentSchoolId || '');"
);

// 2. Add handleRemoveChild function before renderModals
const removeChildFunc = `
  const handleRemoveChild = async (studentId: string, parentId: string) => {
    if (window.confirm("Voulez-vous vraiment retirer cet enfant de ce parent ?")) {
      try {
        const { error } = await supabase.from('student_parents').delete().match({ student_id: studentId, parent_id: parentId });
        if (error) throw error;
        fetchParents();
        // Optimistic update of editEntity to refresh modal
        if (editEntity && editEntity.id === parentId) {
           setEditEntity({
             ...editEntity,
             student_parents: editEntity.student_parents.filter((sp: any) => sp.student_id !== studentId)
           });
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const renderModals = () => {`;
content = content.replace("  const renderModals = () => {", removeChildFunc);

// 3. Add the new modal UI
const parentChildrenModal = `
              {activeModal === 'parent_children' && editEntity && (
                <div className="modal-content" style={{maxWidth: '500px'}}>
                  <div className="modal-header">
                    <h3>Enfants de {editEntity.first_name} {editEntity.last_name}</h3>
                    <button className="btn-close" onClick={closeModal}><Icons.X /></button>
                  </div>
                  <div className="modal-body">
                    {editEntity.student_parents && editEntity.student_parents.length > 0 ? (
                      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {editEntity.student_parents.map((sp: any, idx: number) => (
                          <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)'}}>
                            <span style={{fontWeight: 500}}>{sp.students?.first_name} {sp.students?.last_name}</span>
                            <button className="btn" style={{backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', fontSize: '0.85rem'}} onClick={() => handleRemoveChild(sp.student_id, sp.parent_id)}>
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0'}}>Aucun enfant associé.</p>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={closeModal}>Fermer</button>
                  </div>
                </div>
              )}
`;
// Insert right after {activeModal === 'parent' && (
// Wait, safer to replace a known modal declaration.
content = content.replace(
  "{activeModal === 'parent' && (", 
  parentChildrenModal + "\n              {activeModal === 'parent' && ("
);

// 4. Update the Table button
const oldTableChildCol = `<span className="badge badge-primary">{row.student_parents.length} {row.student_parents.length > 1 ? 'élèves' : 'élève'}</span>
                      <span>{row.student_parents.map((sp: any) => sp.students?.first_name + ' ' + sp.students?.last_name).filter(Boolean).join(', ')}</span>`;
const newTableChildCol = `<span className="badge badge-primary">{row.student_parents.length} {row.student_parents.length > 1 ? 'élèves' : 'élève'}</span>
                      <button className="btn btn-outline" style={{padding: '2px 8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(row); setActiveModal('parent_children'); }}>👁️ Voir / Gérer</button>`;
content = content.replace(oldTableChildCol, newTableChildCol);

// 5. Update modal header
content = content.replace(
  `{activeModal === 'parent' && t('admin.modals.parent', "Ajouter un Parent")}`,
  `{activeModal === 'parent' && t('admin.modals.parent', "Ajouter un Parent")}
                {activeModal === 'parent_children' && "Enfants du parent"}`
);

fs.writeFileSync('src/App.tsx', content);
console.log('Patch done.');
