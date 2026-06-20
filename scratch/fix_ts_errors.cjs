const fs = require('fs');
const path = require('path');

// Fix App.tsx
const appPath = path.join(__dirname, '../src/App.tsx');
let appCode = fs.readFileSync(appPath, 'utf8');
appCode = appCode.replace(
  `        </div>
      </div>
      </div>

      <div className="panel delay-200">`,
  `        </div>
      </div>

      <div className="panel delay-200">`
);
fs.writeFileSync(appPath, appCode);

// Fix ExpenseReceiptPreview.tsx
const previewPath = path.join(__dirname, '../src/components/ExpenseReceiptPreview.tsx');
let previewCode = fs.readFileSync(previewPath, 'utf8');

// I'll just rewrite the style tag part
previewCode = previewCode.replace(
  `      {/* Styles for printing */}
      <style dangerouslySetInnerHTML={{__html: \\\`
        @media print {
          body * {
            visibility: hidden;
          }
          .receipt-container, .receipt-container * {
            visibility: visible;
          }
          .receipt-container {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
            padding: 20px !important;
            box-shadow: none !important;
          }
          .hide-print {
            display: none !important;
          }
        }
      \\\`}} />
    </div>`,
  `      {/* Styles for printing */}
      <style dangerouslySetInnerHTML={{__html: \`
        @media print {
          body * { visibility: hidden; }
          .receipt-container, .receipt-container * { visibility: visible; }
          .receipt-container { position: absolute; left: 0; top: 0; width: 100%; padding: 20px !important; box-shadow: none !important; }
          .hide-print { display: none !important; }
        }
      \`}} />
    </div>`
);

// I must be careful about backticks and escapes since I wrote it through node previously. Let me rewrite the whole ExpenseReceiptPreview.tsx correctly.
