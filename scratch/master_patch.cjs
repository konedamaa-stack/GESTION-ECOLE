const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. ADD PARENT INVOICES MODAL
const invoiceTarget = `{activeModal === 'message' && t('admin.modals.message', "Nouveau Message")}`;
const invoiceReplacement = `{activeModal === 'parent_invoices' && "Factures du Parent"}
                {activeModal === 'parent_children' && "Gestion des enfants"}
                ${invoiceTarget}`;
if (code.includes(invoiceTarget)) {
  code = code.replace(invoiceTarget, invoiceReplacement);
}

const formStartMarker = `{/* Evaluation Form */}`;
const formInsertion = `{activeModal === 'parent_invoices' && editEntity && (() => {
                const studentIds = editEntity.student_parents?.map((sp) => sp.student_id) || [];
                const parentInvoices = invoicesData?.filter(inv => studentIds.includes(inv.student_id)) || [];

                const realResteTotal = (editEntity.student_parents || []).reduce((sum, sp) => {
                  const student = studentsData?.find(s => s.id === sp.student_id);
                  if (!student) return sum;
                  const studentTotal = Number(student.tuition_fee) || Number(student.classes?.tuition_fee) || 0;
                  const studentInvs = invoicesData?.filter(inv => inv.student_id === student.id) || [];
                  const studentPaye = studentInvs.reduce((acc, inv) => {
                    if (inv.status === 'Payée') return acc + (Number(inv.paid_amount !== undefined && inv.paid_amount !== null ? inv.paid_amount : inv.amount) || 0);
                    if (inv.status === 'Partielle') return acc + (Number(inv.paid_amount) || 0);
                    return acc;
                  }, 0);
                  return sum + Math.max(0, studentTotal - studentPaye);
                }, 0);

                return (
                  <div>
                    {parentInvoices.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table" style={{width: '100%', marginBottom: '20px', borderCollapse: 'collapse'}}>
                          <thead>
                            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left'}}>
                              <th style={{padding: '12px 8px'}}>Date</th>
                              <th style={{padding: '12px 8px'}}>Élève</th>
                              <th style={{padding: '12px 8px'}}>Description</th>
                              <th style={{padding: '12px 8px', textAlign: 'right'}}>Montant</th>
                              <th style={{padding: '12px 8px', textAlign: 'right'}}>Reste à Payer</th>
                              <th style={{padding: '12px 8px', textAlign: 'center'}}>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentInvoices.map((inv) => {
                              const reste = inv.status === 'Payée' ? 0 : (Number(inv.amount) - Number(inv.paid_amount || 0));
                              return (
                                <tr key={inv.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                  <td style={{padding: '12px 8px'}}>{new Date(inv.issue_date).toLocaleDateString('fr-FR')}</td>
                                  <td style={{padding: '12px 8px', fontWeight: 500}}>{inv.students?.first_name} {inv.students?.last_name}</td>
                                  <td style={{padding: '12px 8px'}}>{inv.title || inv.type || 'Frais de scolarité'}</td>
                                  <td style={{padding: '12px 8px', textAlign: 'right', fontWeight: 'bold'}}>{formatNum(inv.amount)} F</td>
                                  <td style={{padding: '12px 8px', textAlign: 'right', color: reste > 0 ? 'var(--error-color)' : 'var(--text-color)', fontWeight: 'bold'}}>
                                    {formatNum(reste)} F
                                  </td>
                                  <td style={{padding: '12px 8px', textAlign: 'center'}}>
                                    <span className={\`badge \${inv.status === 'Payée' ? 'badge-success' : inv.status === 'Partielle' ? 'badge-warning' : 'badge-danger'}\`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th colSpan={4} style={{textAlign: 'right', padding: '16px 8px', borderTop: '2px solid var(--border-color)', fontSize: '1.1rem'}}>Reste Total de la Scolarité :</th>
                              <th colSpan={2} style={{textAlign: 'left', padding: '16px 16px', borderTop: '2px solid var(--border-color)', fontSize: '1.2rem', color: realResteTotal > 0 ? 'var(--error-color)' : 'var(--success-color)'}}>
                                {formatNum(realResteTotal)} F
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px'}}>Aucune facture trouvée pour les enfants de ce parent.</p>
                    )}
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                      <button type="button" className="btn btn-primary" onClick={closeModal}>Fermer</button>
                    </div>
                  </div>
                );
              })()}
              
              {/* Evaluation Form */}`;
if (code.includes(formStartMarker) && !code.includes('activeModal === \'parent_invoices\' && editEntity')) {
  code = code.replace(formStartMarker, formInsertion);
}

// 2. CLASS FORM NEXT_CLASS_ID
const classFormRegex = /<div className="form-group">\s*<label>Scolarité annuelle par défaut \(F\)<\/label>\s*<input type="number" name="tuition_fee" className="form-input" placeholder="Ex: 500000" defaultValue=\{editEntity\?\.tuition_fee \|\| ''\} \/>\s*<\/div>/;
const classFormReplace = `<div className="form-group">
                    <label>Scolarité annuelle par défaut (F)</label>
                    <input type="number" name="tuition_fee" className="form-input" placeholder="Ex: 500000" defaultValue={editEntity?.tuition_fee || ''} />
                  </div>
                  <div className="form-group">
                    <label>Classe Supérieure (Progression automatique)</label>
                    <select name="next_class_id" className="form-select" defaultValue={editEntity?.next_class_id || ''}>
                      <option value="">Aucune (Dernière classe)</option>
                      {classesData.filter(c => c.id !== editEntity?.id).map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    <small style={{color: 'var(--text-secondary)'}}>Sera utilisée automatiquement lors de la réinscription si l'élève a la moyenne d'admission.</small>
                  </div>`;
if (classFormRegex.test(code)) {
  code = code.replace(classFormRegex, classFormReplace);
}

// 3. REINSCRIPTION FORM WITH AUTO SELECT
const reinscriptionRegex = /\{activeModal === 'reinscription' && editEntity && \([\s\S]*?<button type="submit" className="btn btn-primary">Encaisser & Voir Reçu<\/button>\s*<\/div>\s*<\/form>\s*\)\}/;

const newReinscriptionBlock = `{activeModal === 'reinscription' && editEntity && (() => {
                // Determine automatic class progression
                let autoClassId = editEntity.class_id;
                let message = "";
                
                const studentEvals = evaluationsData?.filter(e => e.student_id === editEntity.id) || [];
                const globalEvals = studentEvals.filter(e => e.type === "Moyenne Globale");
                let studentMoyenne = 0;
                
                if (globalEvals.length > 0) {
                  studentMoyenne = globalEvals.reduce((sum, e) => sum + (Number(e.score) || 0), 0) / globalEvals.length;
                } else if (studentEvals.length > 0) {
                  studentMoyenne = studentEvals.reduce((sum, e) => sum + (Number(e.score) || 0), 0) / studentEvals.length;
                }

                if (studentMoyenne >= 10) {
                  const currentClass = classesData.find(c => c.id === editEntity.class_id);
                  if (currentClass && currentClass.next_class_id) {
                    autoClassId = currentClass.next_class_id;
                    const nextClass = classesData.find(c => c.id === autoClassId);
                    message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20). Passage automatique en \${nextClass?.name || 'Classe Supérieure'}.\`;
                  } else {
                    message = \`Moyenne d'admission atteinte (\${studentMoyenne.toFixed(2)}/20) mais aucune classe supérieure définie.\`;
                  }
                } else if (studentEvals.length > 0) {
                  message = \`Moyenne insuffisante (\${studentMoyenne.toFixed(2)}/20). Redoublement conseillé.\`;
                }

                return (
                  <form key={editEntity.id} onSubmit={handleFormSubmit}>
                    <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                      <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                    
                    {message && (
                      <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: \`1px solid \${studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}\`, color: studentMoyenne >= 10 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500}}>
                        {message}
                      </div>
                    )}

                    <div className="form-group">
                      <label>Nouvelle Classe</label>
                      <select name="class_id" className="form-select" required defaultValue={autoClassId}>
                        <option value="">Choisir une classe...</option>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>2. Frais de Réinscription</h3>
                    <div className="form-group">
                      <label>Montant des frais de réinscription (CFA)</label>
                      <input type="number" name="reg_fee_amount" className="form-input" placeholder="Ex: 25000" />
                      <small style={{color: 'var(--text-secondary)'}}>Laissez vide si l'élève n'a pas de frais à payer.</small>
                    </div>
                    <div className="form-grid">
                      <div className="form-group">
                        <label>Mode de paiement</label>
                        <select name="reg_fee_method" className="form-select">
                          <option value="Espèces">Espèces</option>
                          <option value="Chèque">Chèque</option>
                          <option value="Virement">Virement</option>
                          <option value="Mobile Money">Mobile Money</option>
                        </select>
                      </div>
                      <div className="form-group">
                        <label>Statut du paiement</label>
                        <select name="reg_fee_status" className="form-select">
                          <option value="Payée">Payée (Immédiatement)</option>
                          <option value="En attente">En attente (Paiement ultérieur)</option>
                        </select>
                      </div>
                    </div>

                    <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                      <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                      <button type="submit" className="btn btn-primary">Encaisser & Voir Reçu</button>
                    </div>
                  </form>
                );
              })()}`;

if (reinscriptionRegex.test(code)) {
  code = code.replace(reinscriptionRegex, newReinscriptionBlock);
} else {
  console.log("Could not find reinscription block!");
  process.exit(1);
}

// 4. FIX TEXT COLOR ON STUDENT RESTE
code = code.replace(
  `color: 'var(--danger-color)'}}>{formatNum(studentReste)} F`,
  `color: studentReste > 0 ? 'var(--danger-color)' : 'var(--success-color)'}}>{formatNum(studentReste)} F`
);

fs.writeFileSync('src/App.tsx', code);
console.log("All patches applied successfully!");
