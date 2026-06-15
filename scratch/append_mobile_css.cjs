const fs = require('fs');
const path = require('path');

const cssPath = path.join(__dirname, '..', 'src', 'index.css');

const mobileCSS = `

/* MOBILE RESPONSIVENESS ADDITIONS */
@media screen and (max-width: 768px) {
  /* Make all tables scrollable horizontally without breaking internal layout */
  table {
    display: block !important;
    overflow-x: auto !important;
    white-space: nowrap !important;
    width: 100% !important;
    -webkit-overflow-scrolling: touch;
  }
  
  /* Ensure modals don't overflow the screen */
  .modal-content, [style*="background: white"][style*="border-radius: 24px"], [style*="background: white"][style*="border-radius: 16px"] {
    width: 95% !important;
    margin: 10px auto !important;
    max-height: 90vh !important;
    overflow-y: auto !important;
  }
  
  /* Ensure grids stack nicely on mobile */
  [style*="display: grid"] {
    grid-template-columns: 1fr !important;
  }
  
  /* Fix header actions overflowing */
  .header-actions {
    gap: 8px !important;
  }
  
  .header-actions button {
    padding: 6px !important;
    font-size: 0.8rem !important;
  }
}
`;

fs.appendFileSync(cssPath, mobileCSS);
console.log('Mobile CSS appended successfully.');
