const fs = require('fs');

const cssToAppend = `

/* --- CLASSIC BULLETIN (IVORIAN FORMAT) --- */
.bulletin-classic-container {
  display: flex;
  flex-direction: column;
  gap: 20px;
  background-color: #f1f5f9;
  padding: 20px;
  font-family: Arial, Helvetica, sans-serif;
  color: #000;
}

.bulletin-classic-page {
  background: white;
  width: 210mm;
  min-height: 297mm;
  margin: 0 auto;
  padding: 10mm;
  box-shadow: 0 4px 6px -1px rgb(0 0 0 / 0.1);
  box-sizing: border-box;
  font-size: 0.85rem;
  line-height: 1.3;
  border: 1px solid #ccc;
}

.bulletin-classic-header {
  display: flex;
  justify-content: space-between;
  text-align: center;
  margin-bottom: 5px;
}

.header-left, .header-right {
  font-size: 0.75rem;
  width: 25%;
}

.header-center {
  width: 50%;
}

.header-center h2 {
  font-size: 1.1rem;
  margin: 0;
  text-transform: uppercase;
  font-weight: bold;
}

.header-center h3 {
  font-size: 0.9rem;
  margin: 2px 0 0 0;
}

.bulletin-classic-school {
  display: flex;
  border: 2px solid black;
  margin-bottom: 5px;
}

.school-logo {
  width: 20%;
  border-right: 1px solid black;
  display: flex;
  align-items: center;
  justify-content: center;
  padding: 5px;
}

.school-details {
  width: 55%;
  border-right: 1px solid black;
  padding: 10px;
}

.school-details p {
  margin: 0;
}

.school-statut {
  width: 25%;
  display: flex;
  padding: 5px;
  gap: 10px;
  align-items: center;
}

.photo-placeholder {
  width: 50px;
  height: 60px;
  border: 1px solid #ccc;
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 0.7rem;
  color: #888;
}

.school-statut p {
  margin: 0;
  font-size: 0.8rem;
}

.bulletin-classic-student {
  display: flex;
  border: 2px solid black;
  margin-bottom: 5px;
}

.bulletin-classic-student > div {
  padding: 5px 10px;
}

.bulletin-classic-student p {
  margin: 2px 0;
}

.bulletin-classic-student .col1 { width: 40%; }
.bulletin-classic-student .col2 { width: 35%; }
.bulletin-classic-student .col3 { width: 25%; }

.bulletin-classic-table {
  width: 100%;
  border-collapse: collapse;
  border: 2px solid black;
  margin-bottom: 5px;
}

.bulletin-classic-table th, .bulletin-classic-table td {
  border: 1px solid black;
  padding: 3px 2px;
  text-align: center;
}

.bulletin-classic-table th {
  font-size: 0.7rem;
  background-color: #f8f9fa;
}

.bulletin-group-header td {
  background-color: #e9ecef;
  font-weight: bold;
  text-align: center;
}

.bulletin-classic-totaux td {
  font-weight: bold;
}

.bulletin-classic-bottom-table {
  border-top: none;
}

@media print {
  body {
    background-color: white !important;
  }
  .sidebar, .top-nav, .btn, .modal-close {
    display: none !important;
  }
  .main-content {
    margin: 0 !important;
    padding: 0 !important;
  }
  .bulletins-container, .bulletin-classic-container {
    background: transparent !important;
    padding: 0 !important;
    gap: 0 !important;
  }
  .bulletin-classic-page {
    box-shadow: none !important;
    border: none !important;
    width: 210mm !important;
    height: 297mm !important;
    page-break-after: always;
  }
  .modal-overlay {
    background: white !important;
    position: static !important;
    padding: 0 !important;
  }
  .modal-content {
    background: transparent !important;
    box-shadow: none !important;
    padding: 0 !important;
    max-width: none !important;
    width: 100% !important;
  }
}
`;

fs.appendFileSync('src/index.css', cssToAppend);
console.log("CSS appended.");
