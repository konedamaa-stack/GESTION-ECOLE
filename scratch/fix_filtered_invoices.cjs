const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(filePath, 'utf8');

const regexStr = /const filteredInvoices = \(invoicesData \|\| \[\]\)\.filter\(inv => \{\s*const q = invoiceSearchQuery\.toLowerCase\(\);\s*if \(!q\) return true;\s*return \(inv\.invoice_number\?\.toLowerCase\(\)\.includes\(q\)\) \|\|\s*\(inv\.students\?\.first_name\?\.toLowerCase\(\)\.includes\(q\)\) \|\|\s*\(inv\.students\?\.last_name\?\.toLowerCase\(\)\.includes\(q\)\) \|\|\s*\(inv\.motif\?\.toLowerCase\(\)\.includes\(q\)\);\s*\}\);/s;

const replaceStr = `    const filteredInvoices = (invoicesData || []).filter(inv => {
        const q = invoiceSearchQuery.toLowerCase();
        if (!q) return true;
        return (inv.invoice_number?.toLowerCase().includes(q)) || 
               (inv.students?.first_name?.toLowerCase().includes(q)) ||
               (inv.students?.last_name?.toLowerCase().includes(q)) ||
               (inv.motif?.toLowerCase().includes(q));
      }).sort((a: any, b: any) => new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime());`;

if (regexStr.test(content)) {
  content = content.replace(regexStr, replaceStr);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log("Successfully replaced filteredInvoices using regex.");
} else {
  console.log("Regex failed to match.");
}
