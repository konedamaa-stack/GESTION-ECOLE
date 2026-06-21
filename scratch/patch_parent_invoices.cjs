const fs = require('fs');
let code = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add title
const titleRegex = /\{activeModal === 'parent' && t\('admin\.modals\.parent', "Ajouter un Parent"\)\}/;
code = code.replace(titleRegex, `{activeModal === 'parent' && t('admin.modals.parent', "Ajouter un Parent")}\n                {activeModal === 'parent_invoices' && "Factures du Parent"}`);

// 2. Add Modal Body
const bodyRegex = /\{\/\* Evaluation Form \*\/\}/;
const newBody = `{activeModal === 'parent_invoices' && editEntity && (() => {
                const studentIds = editEntity.student_parents?.map((sp) => sp.student_id) || [];
                const parentInvoices = invoicesData?.filter(inv => studentIds.includes(inv.student_id)) || [];

                return (
                  <div>
                    {parentInvoices.length > 0 ? (
                      <table className="table" style={{width: '100%', marginBottom: '20px'}}>
                        <thead>
                          <tr>
                            <th>Date</th>
                            <th>Élève</th>
                            <th>Type</th>
                            <th>Montant</th>
                            <th>Reste à Payer</th>
                            <th>Statut</th>
                          </tr>
                        </thead>
                        <tbody>
                          {parentInvoices.map((inv) => (
                            <tr key={inv.id}>
                              <td>{new Date(inv.issue_date).toLocaleDateString('fr-FR')}</td>
                              <td>{inv.students?.first_name} {inv.students?.last_name}</td>
                              <td>{inv.type}</td>
                              <td>{formatNum(inv.amount)} F</td>
                              <td style={{color: 'var(--error-color)', fontWeight: 'bold'}}>{formatNum(Number(inv.amount) - Number(inv.paid_amount || 0))} F</td>
                              <td>
                                <span className={\`badge \${inv.status === 'Payée' ? 'badge-success' : inv.status === 'Partielle' ? 'badge-warning' : 'badge-danger'}\`}>
                                  {inv.status}
                                </span>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                        <tfoot>
                          <tr>
                            <th colSpan={4} style={{textAlign: 'right'}}>Total Dû par le parent:</th>
                            <th colSpan={2} style={{fontSize: '1.1rem', color: 'var(--error-color)'}}>
                              {formatNum(parentInvoices.filter(i => i.status !== 'Payée').reduce((sum, i) => sum + Number(i.amount) - Number(i.paid_amount || 0), 0))} F
                            </th>
                          </tr>
                        </tfoot>
                      </table>
                    ) : (
                      <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px'}}>Aucune facture trouvée pour les enfants de ce parent.</p>
                    )}
                    <div style={{display: 'flex', justifyContent: 'flex-end'}}>
                      <button type="button" className="btn btn-primary" onClick={closeModal}>Fermer</button>
                    </div>
                  </div>
                );
              })()}
              
              {/* Evaluation Form */}`;
code = code.replace(bodyRegex, newBody);

// 3. Add the Button
const btnRegex = /<button className="btn btn-outline" style=\{\{padding: '6px 12px', marginRight: '8px'\}\} onClick=\{\(\) => \{ setEditEntity\(row\); setActiveModal\('parent'\); \}\}>✏️ Modifier<\/button>/;
const newBtn = `<button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px', color: '#6366f1', borderColor: '#6366f1'}} onClick={() => { setEditEntity(row); setActiveModal('parent_invoices'); }}>🧾 Voir Factures</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('parent'); }}>✏️ Modifier</button>`;
code = code.replace(btnRegex, newBtn);

fs.writeFileSync('src/App.tsx', code);
console.log("Patched correctly!");
