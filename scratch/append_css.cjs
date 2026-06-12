const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '../src/index.css');
let content = fs.readFileSync(cssPath, 'utf8');

const newCss = `
/* --- Bulletin Styles --- */
.bulletins-container {
  display: flex;
  flex-direction: column;
  gap: 40px;
  background: #f1f5f9;
  padding: 20px;
}

.bulletin-page {
  background: white;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 20mm;
  box-shadow: 0 4px 12px rgba(0,0,0,0.1);
  color: #1e293b;
  font-family: 'Inter', sans-serif;
  box-sizing: border-box;
}

.bulletin-header {
  display: flex;
  justify-content: space-between;
  align-items: flex-start;
  margin-bottom: 30px;
  border-bottom: 2px solid #e2e8f0;
  padding-bottom: 20px;
}

.school-info h2 {
  font-size: 1.5rem;
  margin-bottom: 5px;
  color: #0f172a;
}

.bulletin-title-box {
  text-align: right;
}

.bulletin-title-box h1 {
  font-size: 1.8rem;
  color: #3b82f6;
  margin-bottom: 5px;
}

.student-info-box {
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 15px;
  margin-bottom: 30px;
}

.info-row {
  display: flex;
  justify-content: space-between;
  margin-bottom: 10px;
}
.info-row:last-child {
  margin-bottom: 0;
}

.bulletin-table {
  width: 100%;
  border-collapse: collapse;
  margin-bottom: 30px;
}

.bulletin-table th, .bulletin-table td {
  border: 1px solid #cbd5e1;
  padding: 10px 15px;
  text-align: left;
}

.bulletin-table th {
  background: #f1f5f9;
  font-weight: 600;
}

.bulletin-summary {
  display: flex;
  justify-content: space-between;
  background: #f8fafc;
  border: 1px solid #e2e8f0;
  border-radius: 8px;
  padding: 20px;
  margin-bottom: 40px;
}

.summary-left p, .summary-right p {
  margin-bottom: 10px;
}
.summary-left p:last-child, .summary-right p:last-child {
  margin-bottom: 0;
}

.general-avg {
  font-size: 1.5rem;
  font-weight: bold;
  color: #3b82f6;
}

.bulletin-signatures {
  display: flex;
  justify-content: space-between;
  margin-top: 20px;
}

.signature-box {
  width: 40%;
  height: 100px;
  border: 1px dashed #cbd5e1;
  border-radius: 8px;
  padding: 10px;
  text-align: center;
  color: #64748b;
}

/* Print Styles */
@media print {
  body * {
    visibility: hidden;
  }
  .bulletins-container, .bulletins-container * {
    visibility: visible;
  }
  .bulletins-container {
    position: absolute;
    left: 0;
    top: 0;
    padding: 0;
    margin: 0;
    background: white;
  }
  .bulletin-page {
    box-shadow: none;
    margin: 0;
    padding: 15mm;
    page-break-after: always;
  }
  /* Hide close button and print button during print */
  .print-controls {
    display: none !important;
  }
}
`;

if (!content.includes('bulletins-container')) {
  fs.writeFileSync(cssPath, content + '\n' + newCss);
  console.log('CSS added');
} else {
  console.log('CSS already exists');
}
