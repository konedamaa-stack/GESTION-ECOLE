const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const targetStr = `                              studentReste={
                                Math.max(0, (Number(selectedStudent.tuition_fee) || Number(selectedStudent.classes?.tuition_fee) || 0) - 
                                invoicesData.filter((inv: any) => inv.student_id === selectedStudent.id && inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0))
                              }`;

const replaceStr = `                              studentReste={
                                (() => {
                                  const total = Number(selectedStudent.tuition_fee) || Number(selectedStudent.classes?.tuition_fee) || 0;
                                  let paye = invoicesData.filter((inv: any) => inv.student_id === selectedStudent.id && inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
                                  if (selectedInvoice && selectedInvoice.status === 'Payée' && !invoicesData.some((i: any) => i.id === selectedInvoice.id)) {
                                    paye += Number(selectedInvoice.amount) || 0;
                                  }
                                  return Math.max(0, total - paye);
                                })()
                              }`;

if (content.includes(targetStr)) {
  content = content.replace(targetStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced studentReste computation block.");
} else {
  console.log("Could not find exact target string. Attempting regex...");
  
  // Regex approach for robustness
  const regexStr = /studentReste=\{\s*Math\.max\(0,\s*\(Number\(selectedStudent\.tuition_fee\)\s*\|\|\s*Number\(selectedStudent\.classes\?\.tuition_fee\)\s*\|\|\s*0\)\s*-\s*invoicesData\.filter\(\(inv:\s*any\)\s*=>\s*inv\.student_id\s*===\s*selectedStudent\.id\s*&&\s*inv\.status\s*===\s*'Payée'\)\.reduce\(\(sum:\s*number,\s*inv:\s*any\)\s*=>\s*sum\s*\+\s*\(Number\(inv\.amount\)\s*\|\|\s*0\),\s*0\)\)\s*\}/s;
  
  if (regexStr.test(content)) {
    content = content.replace(regexStr, replaceStr);
    fs.writeFileSync(filePath, content, 'utf8');
    console.log("Successfully replaced using regex.");
  } else {
    console.log("Regex also failed to match.");
  }
}
