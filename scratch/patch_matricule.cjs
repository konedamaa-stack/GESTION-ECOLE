const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add matricule to studentsDetails
const targetDetails = `          return {
            id: s.id,
            name: \`\${s.first_name} \${s.last_name}\`,`;

const replacementDetails = `          return {
            id: s.id,
            matricule: s.matricule,
            name: \`\${s.first_name} \${s.last_name}\`,`;

if (content.includes(targetDetails)) {
  content = content.replace(targetDetails, replacementDetails);
}

// 2. Add Matricule column to table header
const targetHeader = `              <th style={{padding: '12px 0', fontWeight: 500}}>Élève</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>`;

const replacementHeader = `              <th style={{padding: '12px 0', fontWeight: 500}}>Matricule</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Élève</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>`;

if (content.includes(targetHeader)) {
  content = content.replace(targetHeader, replacementHeader);
}

// 3. Add Matricule column to table body
const targetBodyRow = `                    <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                      <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                      <td style={{padding: '16px 0'}}>{st.className}</td>`;

const replacementBodyRow = `                    <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                      <td style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{st.matricule}</td>
                      <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                      <td style={{padding: '16px 0'}}>{st.className}</td>`;

if (content.includes(targetBodyRow)) {
  content = content.replace(targetBodyRow, replacementBodyRow);
}

// 4. Update colSpan in TOTAL row
const targetTotal = `<td colSpan={2} style={{padding: '16px 0', textAlign: 'right', paddingRight: '24px'}}>TOTAL :</td>`;
const replacementTotal = `<td colSpan={3} style={{padding: '16px 0', textAlign: 'right', paddingRight: '24px'}}>TOTAL :</td>`;

if (content.includes(targetTotal)) {
  content = content.replace(targetTotal, replacementTotal);
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patch complete');
