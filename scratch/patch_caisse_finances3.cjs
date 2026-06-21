const fs = require('fs');
const path = require('path');

const appPath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(appPath, 'utf8');

const caisseWidget = `
        <div className="stat-card delay-400">
          <div className="stat-header">
            <span className="stat-label">Solde Caisse</span>
            <Icons.Database />
          </div>
          <div className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
            {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )}
          </div>
          <div className="stat-trend trend-up">
            F
          </div>
        </div>
`;

// Insert the widget right before the closing </div> of the stats-grid
const searchStr = `          <div className="stat-value">{formatNum(tauxRecouvrementGlobal)}%</div>
          <div className="stat-trend trend-up">
            Global
          </div>
        </div>
      </div>`;

if (code.includes(searchStr)) {
  code = code.replace(searchStr, searchStr.replace('      </div>', caisseWidget + '      </div>'));
  fs.writeFileSync(appPath, code);
  console.log("Caisse widget added successfully!");
} else {
  console.log("Search string not found.");
}
