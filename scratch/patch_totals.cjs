const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

const targetCode = `{scolariteParClasse.flatMap(c => 
              (c.studentsDetails || []).map(s => ({...s, className: c.className, classId: c.id}))
            ).filter(s => {
               const matchClass = financeClassFilter === 'all' || s.classId === financeClassFilter;
               const matchStatus = financeStatusFilter === 'all' || s.status === financeStatusFilter;
               return matchClass && matchStatus;
            }).map((st, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                <td style={{padding: '16px 0'}}>{st.className}</td>
                <td style={{padding: '16px 0'}}>{formatNum(st.total)} FCFA</td>
                <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--success-color)'}}>{formatNum(st.paye)} FCFA</td>
                <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--danger-color)'}}>{formatNum(st.nonPaye)} FCFA</td>
                <td style={{padding: '16px 0'}}>
                  <span className={\`badge \${st.status === 'Soldé' ? 'badge-success' : 'badge-warning'}\`}>{st.status}</span>
                </td>
              </tr>
            ))}`;

const replacementCode = `{(() => {
              const filteredStudents = scolariteParClasse.flatMap(c => 
                (c.studentsDetails || []).map(s => ({...s, className: c.className, classId: c.id}))
              ).filter(s => {
                 const matchClass = financeClassFilter === 'all' || s.classId === financeClassFilter;
                 const matchStatus = financeStatusFilter === 'all' || s.status === financeStatusFilter;
                 return matchClass && matchStatus;
              });
              
              const totalAttendu = filteredStudents.reduce((sum, st) => sum + (st.total || 0), 0);
              const totalPaye = filteredStudents.reduce((sum, st) => sum + (st.paye || 0), 0);
              const totalReste = filteredStudents.reduce((sum, st) => sum + (st.nonPaye || 0), 0);

              return (
                <>
                  {filteredStudents.map((st, i) => (
                    <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                      <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                      <td style={{padding: '16px 0'}}>{st.className}</td>
                      <td style={{padding: '16px 0'}}>{formatNum(st.total)} FCFA</td>
                      <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--success-color)'}}>{formatNum(st.paye)} FCFA</td>
                      <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--danger-color)'}}>{formatNum(st.nonPaye)} FCFA</td>
                      <td style={{padding: '16px 0'}}>
                        <span className={\`badge \${st.status === 'Soldé' ? 'badge-success' : 'badge-warning'}\`}>{st.status}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length > 0 && (
                    <tr className="finance-totals-row" style={{fontWeight: 'bold', borderTop: '2px solid var(--border-color)'}}>
                      <td colSpan={2} style={{padding: '16px 0', textAlign: 'right', paddingRight: '24px'}}>TOTAL :</td>
                      <td style={{padding: '16px 0'}}>{formatNum(totalAttendu)} FCFA</td>
                      <td style={{padding: '16px 0', color: 'var(--success-color)'}}>{formatNum(totalPaye)} FCFA</td>
                      <td style={{padding: '16px 0', color: 'var(--danger-color)'}}>{formatNum(totalReste)} FCFA</td>
                      <td></td>
                    </tr>
                  )}
                </>
              );
            })()}`;

if (content.includes(targetCode)) {
  content = content.replace(targetCode, replacementCode);
  fs.writeFileSync('src/App.tsx', content);
  console.log('Patch complete');
} else {
  console.error('Target code not found in App.tsx');
}
