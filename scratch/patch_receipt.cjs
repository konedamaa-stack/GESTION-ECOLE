const fs = require('fs');
const path = require('path');
const p = path.join(__dirname, '../src/components/ReceiptPreview.tsx');
let c = fs.readFileSync(p, 'utf8');

c = c.replace(
  'interface ReceiptPreviewProps {\n  invoice: any;\n  student: any;\n  schoolInfo: any;\n}',
  'interface ReceiptPreviewProps {\n  invoice: any;\n  student: any;\n  schoolInfo: any;\n  studentReste?: number;\n}'
);

c = c.replace(
  'export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ invoice, student, schoolInfo }) => {',
  'export const ReceiptPreview: React.FC<ReceiptPreviewProps> = ({ invoice, student, schoolInfo, studentReste }) => {'
);

fs.writeFileSync(p, c);
