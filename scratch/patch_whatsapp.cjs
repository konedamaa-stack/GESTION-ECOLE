const fs = require('fs');
const path = require('path');

const targetPath = path.resolve('src/App.tsx');
let content = fs.readFileSync(targetPath, 'utf8');

const targetBlock = `<span className={\`badge \${selectedStudent.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`} style={{marginTop: '8px', display: 'inline-block'}}>
                        {selectedStudent.status}
                      </span>`;

const replacement = `<div style={{ display: 'flex', gap: '8px', alignItems: 'center', marginTop: '8px' }}>
                        <span className={\`badge \${selectedStudent.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`} style={{display: 'inline-block'}}>
                          {selectedStudent.status}
                        </span>
                        {(() => {
                          const parent = parentsData?.find(p => p.student_parents?.some((sp) => sp.student_id === selectedStudent.id));
                          if (parent && parent.phone) {
                            const cleanPhone = parent.phone.replace(/\\D/g, '');
                            const finalPhone = cleanPhone.length === 10 ? '225' + cleanPhone : cleanPhone;
                            const msg = \`Bonjour, voici un message de la Direction concernant \${selectedStudent.first_name} \${selectedStudent.last_name}.\`;
                            return (
                               <a href={\`https://wa.me/\${finalPhone}?text=\${encodeURIComponent(msg)}\`} target="_blank" rel="noreferrer" className="btn btn-outline" style={{ display: 'inline-flex', alignItems: 'center', gap: '4px', padding: '4px 8px', fontSize: '0.8rem', color: '#25D366', borderColor: '#25D366', background: 'rgba(37, 211, 102, 0.1)' }}>
                                  <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                                  Message WhatsApp ({parent.phone})
                               </a>
                            );
                          }
                          return null;
                        })()}
                      </div>`;

if (content.includes(targetBlock)) {
  content = content.replace(targetBlock, replacement);
  fs.writeFileSync(targetPath, content, 'utf8');
  console.log("Patched successfully with WhatsApp button!");
} else {
  console.log("Failed to find target block in App.tsx");
}
