const fs = require('fs');
const path = require('path');

let appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');

// 1. Add state for loans
if (!appCode.includes('const [loansData, setLoansData]')) {
  appCode = appCode.replace(
    'const [expensesData, setExpensesData] = useState<any[]>([]);',
    'const [expensesData, setExpensesData] = useState<any[]>([]);\n  const [loansData, setLoansData] = useState<any[]>([]);'
  );
}

// 2. Add fetchLoans
if (!appCode.includes('const fetchLoans = async ()')) {
  const fetchLoansFunc = `
  const fetchLoans = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('school_id', currentSchoolId)
        .order('loan_date', { ascending: false });
      if (error) throw error;
      setLoansData(data || []);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };
`;
  appCode = appCode.replace('const fetchExpenses = async () => {', fetchLoansFunc + '\n  const fetchExpenses = async () => {');
}

// 3. Call fetchLoans inside fetchAdminData or wherever fetchExpenses is called
appCode = appCode.replace('fetchExpenses();', 'fetchExpenses();\n      fetchLoans();');

// 4. Update the currentBalance logic
// The balance calculation is repeated in multiple places. Let's find and replace them all.
const newBalanceCalc = `
    const currentLoans = loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0;
    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                           currentLoans -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);
`;

const oldBalanceCalc = `    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);`;

appCode = appCode.split(oldBalanceCalc).join(newBalanceCalc);

// 5. Update UI rendering of balance in the admin dashboard (Total in red/green)
// There are multiple instances of this inline calculation.
const oldInlineBalanceCalc = `color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'`;
const newInlineBalanceCalc = `color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'`;
appCode = appCode.split(oldInlineBalanceCalc).join(newInlineBalanceCalc);

const oldInlineBalanceValue = `
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
`;
const newInlineBalanceValue = `
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
`;
appCode = appCode.split(oldInlineBalanceValue).join(newInlineBalanceValue);

const oldInlineBalanceValue2 = `            {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} F`;
const newInlineBalanceValue2 = `            {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} F`;
appCode = appCode.split(oldInlineBalanceValue2).join(newInlineBalanceValue2);

fs.writeFileSync(appPath, appCode);
console.log('App.tsx partially patched with Loans state and calculations.');
