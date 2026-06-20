const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/index.css');
let code = fs.readFileSync(filePath, 'utf8');

const mobileCSS = \`

/* Added Mobile Responsiveness */
@media (max-width: 768px) {
  .table-responsive {
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }
  .table {
    min-width: 600px;
  }
  .dashboard-grid {
    grid-template-columns: 1fr;
  }
  .modal-content {
    width: 95% !important;
    max-width: 100% !important;
    margin: 10px auto;
  }
  .form-grid {
    grid-template-columns: 1fr;
  }
  .sidebar {
    width: 250px;
  }
  .app-layout {
    flex-direction: column;
  }
  .page-header {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
}\`;

if (!code.includes('/* Added Mobile Responsiveness */')) {
  fs.appendFileSync(filePath, mobileCSS);
  console.log("Mobile CSS appended.");
} else {
  console.log("Mobile CSS already exists.");
}
