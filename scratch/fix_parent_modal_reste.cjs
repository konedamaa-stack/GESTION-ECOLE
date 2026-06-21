const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

const startMarker = `{activeModal === 'parent_invoices' && editEntity && (() => {`;
const endMarker = `              {/* Evaluation Form */}`;

const startIndex = code.indexOf(startMarker);
const endIndex = code.indexOf(endMarker);

if (startIndex === -1 || endIndex === -1) {
  console.error("Markers not found");
  process.exit(1);
}

const newBlock = `{activeModal === 'parent_invoices' && editEntity && (() => {
                const studentIds = editEntity.student_parents?.map((sp) => sp.student_id) || [];
                const parentInvoices = invoicesData?.filter(inv => studentIds.includes(inv.student_id)) || [];

                // Calcul du VRAI reste total basé sur la scolarité globale de chaque enfant
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
                              <th colSpan={2} style={{textAlign: 'left', padding: '16px 16px', borderTop: '2px solid var(--border-color)', fontSize: '1.2rem', color: 'var(--error-color)'}}>
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
              
`;

code = code.slice(0, startIndex) + newBlock + code.slice(endIndex);
fs.writeFileSync('src/App.tsx', code);
console.log("Patched!");
