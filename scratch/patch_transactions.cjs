const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');
content = content.replace(/\r\n/g, '\n');
let changed = false;

const findMapStart = `{filteredInvoices.length > 0 ? filteredInvoices.map((row, i) => (`;
const replaceMapStart = `{filteredInvoices.length > 0 ? filteredInvoices.map((row, i) => {
                const studentInvs = invoicesData.filter(inv => inv.student_id === row.student_id);
                let verse = 0;
                studentInvs.forEach(inv => { if(inv.status === 'Payée') verse += Number(inv.amount); });
                let reste = Math.max(0, (row.students?.tuition_fee || 0) - verse);
                return (`;

const findRow = `<td style={{padding: '16px 0', fontWeight: 'bold'}}>{formatNum(row.amount)} FCFA</td>
                <td style={{padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{new Date(row.issue_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={\`badge \${row.status === 'Payée' ? 'badge-success' : 'badge-warning'}\`}>{row.status}</span>
                </td>
              </tr>
            )) : (`;

const replaceRow = `<td style={{padding: '16px 0'}}>
                  <div style={{fontWeight: 'bold'}}>{formatNum(row.amount)} FCFA</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    Total versé: {formatNum(verse)} <br/> Reste: <span style={{color: reste > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 600}}>{formatNum(reste)}</span>
                  </div>
                </td>
                <td style={{padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{new Date(row.issue_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={\`badge \${row.status === 'Payée' ? 'badge-success' : 'badge-warning'}\`}>{row.status}</span>
                </td>
              </tr>
            );
            }) : (`;

if (content.includes(findMapStart) && content.includes(findRow)) {
    content = content.replace(findMapStart, replaceMapStart);
    content = content.replace(findRow, replaceRow);
    changed = true;
    console.log("Successfully patched Dernières Transactions table!");
} else {
    console.log("Could not find the exact strings to replace. Let's do a more robust approach.");
    
    // Backup approach using regex or partials
    const backupFind = `)) : (
              <tr><td colSpan={6}`;
    if (content.includes(backupFind)) {
        console.log("Found backup location");
    }
}

if (changed) {
    fs.writeFileSync(targetFile, content);
    console.log("App.tsx saved!");
} else {
    console.log("Nothing changed");
}
