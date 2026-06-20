const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Add states for teacher_payments and employee_payments
if (!code.includes('teacherPaymentsData')) {
  code = code.replace(
    'const [expensesData, setExpensesData] = useState<any[]>([]);',
    `const [expensesData, setExpensesData] = useState<any[]>([]);
  const [teacherPaymentsData, setTeacherPaymentsData] = useState<any[]>([]);
  const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);`
  );
}

// 2. Add fetch logic
if (!code.includes('fetchTeacherPayments = async')) {
  code = code.replace(
    'const fetchExpenses = async () => {',
    `const fetchTeacherPayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase.from('teacher_payments').select('*').eq('school_id', currentSchoolId).order('payment_date', { ascending: false });
      if (!error && data) setTeacherPaymentsData(data);
    } catch (err) { console.error('Error fetching teacher payments:', err); }
  };
  
  const fetchEmployeePayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase.from('employee_payments').select('*').eq('school_id', currentSchoolId).order('payment_date', { ascending: false });
      if (!error && data) setEmployeePaymentsData(data);
    } catch (err) { console.error('Error fetching employee payments:', err); }
  };

  const fetchExpenses = async () => {`
  );
}

// 3. Call fetch in useEffect
if (!code.includes('fetchTeacherPayments();')) {
  code = code.replace(
    'fetchExpenses();',
    `fetchExpenses();
      fetchTeacherPayments();
      fetchEmployeePayments();`
  );
}

// 4. Add Rentabilite calc in renderDepenses
if (code.includes('renderDepenses = () =>')) {
  const rentabiliteSnippet = `
      <div className="dashboard-grid" style={{marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>{t('admin.expenses.total', 'Total Dépenses Courantes')}</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>
          <div className="stat-info">
            <h3>Salaires Payés</h3>
            <p className="stat-value">{formatNum(
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>💰</div>
          <div className="stat-info">
            <h3>Total Rentrées (Factures)</h3>
            <p className="stat-value">{formatNum(invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0)} FCFA</p>
          </div>
        </div>
        <div className="stat-card delay-300">
          <div className="stat-icon" style={{backgroundColor: '#e0e7ff', color: '#6366f1'}}>🏦</div>
          <div className="stat-info">
            <h3>Solde Caisse (Rentabilité)</h3>
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payé').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} FCFA
            </p>
          </div>
        </div>
      </div>`;

  code = code.replace(
    /<div className="dashboard-grid" style=\{\{marginBottom: '24px'\}\}>[\s\S]*?<\/div>\s*<\/div>/,
    rentabiliteSnippet
  );
}

fs.writeFileSync(filePath, code);
console.log("App.tsx Rentabilite and State patched successfully.");
