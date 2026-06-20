const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../src/components/ReceiptPreview.tsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  '<span style={{ color: \'#475569\' }}>Montant Dû:</span>',
  `{studentReste !== undefined && (
              <div style={{ display: 'flex', justifyContent: 'space-between', padding: '8px 0', borderTop: '1px solid #e2e8f0' }}>
                <span style={{ color: '#ef4444', fontSize: '14px' }}>Reste à Payer:</span>
                <span style={{ fontWeight: '500', color: '#ef4444', fontSize: '14px' }}>{formatCurrency(studentReste)}</span>
              </div>
            )}
            <span style={{ color: '#475569' }}>Montant Dû:</span>`
);

fs.writeFileSync(p, c);
