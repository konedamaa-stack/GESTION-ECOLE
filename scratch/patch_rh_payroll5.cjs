const fs = require('fs');

const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

// Normalize line endings
content = content.replace(/\r\n/g, '\n');

// 1. Add employeePaymentsData state
if (!content.includes('const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);')) {
    content = content.replace(
        'const [invoicesData, setInvoicesData] = useState<any[]>([]);',
        `const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);`
    );
}

// 2. Add fetchEmployeePayments
if (!content.includes('const fetchEmployeePayments = async () => {')) {
    content = content.replace(
        '  const fetchInvoices = async () => {',
        `  const fetchEmployeePayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase
        .from('employee_payments')
        .select('*, employees(first_name, last_name, role)')
        .eq('school_id', currentSchoolId)
        .order('payment_date', { ascending: false });
      if (error) throw error;
      setEmployeePaymentsData(data || []);
    } catch (error: any) {
      console.error("Error fetching employee payments:", error);
    }
  };

  const fetchInvoices = async () => {`
    );
}

// 3. Call fetchEmployeePayments
if (!content.includes('fetchEmployeePayments();')) {
    content = content.replace(
        '        fetchInvoices();',
        `        fetchInvoices();
        fetchEmployeePayments();`
    );
}

// 4. Import SalaryReceiptPreview
if (!content.includes('SalaryReceiptPreview')) {
    content = content.replace(
        "import { ReceiptPreview } from './components/ReceiptPreview';",
        `import { ReceiptPreview } from './components/ReceiptPreview';
import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';`
    );
}

// Convert line endings back
content = content.replace(/\n/g, '\r\n');

// Save
fs.writeFileSync(appPath, content);
console.log('App.tsx patched steps 1-4 correctly.');
