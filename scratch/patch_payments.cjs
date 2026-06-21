const fs = require('fs');
const path = require('path');

let appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

const balanceCalcCode = `
    const parsedAmount = parseFloat(amount);

    // Calculate current available balance
    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);

    if (parsedAmount > currentBalance) {
      alert(\`Fonds insuffisants dans la caisse. Solde disponible : \${currentBalance} F.\`);
      return;
    }
`;

// Employee payment check
let employeePaymentBlock = `  const handleEmployeePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;`;

let newEmployeePaymentBlock = employeePaymentBlock + balanceCalcCode;

appCode = appCode.replace(employeePaymentBlock, newEmployeePaymentBlock);

// Employee payment replace parseFloat
appCode = appCode.replace(
  `        employee_id: editEntity.id,
        amount: parseFloat(amount),
        month,`,
  `        employee_id: editEntity.id,
        amount: parsedAmount,
        month,`
);

// Teacher payment check
let teacherPaymentBlock = `  const handleTeacherPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;`;

let newTeacherPaymentBlock = teacherPaymentBlock + balanceCalcCode;

appCode = appCode.replace(teacherPaymentBlock, newTeacherPaymentBlock);

// Teacher payment replace parseFloat
appCode = appCode.replace(
  `        teacher_id: editEntity.id,
        amount: parseFloat(amount),
        month,`,
  `        teacher_id: editEntity.id,
        amount: parsedAmount,
        month,`
);

fs.writeFileSync(appPath, appCode);

console.log("Patch applied successfully.");
