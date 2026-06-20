const fs = require('fs');
const path = require('path');
const filePath = path.join(__dirname, '../src/App.tsx');
let code = fs.readFileSync(filePath, 'utf8');

// 1. Import ExpenseReceiptPreview
if (!code.includes('ExpenseReceiptPreview')) {
  code = code.replace(
    `import { TeacherReceiptPreview } from './components/TeacherReceiptPreview';`,
    `import { TeacherReceiptPreview } from './components/TeacherReceiptPreview';\nimport { ExpenseReceiptPreview } from './components/ExpenseReceiptPreview';`
  );
}

// 2. Add print button in renderDepenses table
if (!code.includes("setActiveModal('expense_receipt_preview')")) {
  code = code.replace(
    `<button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(expense); setActiveModal('expense'); }}>✏️</button>`,
    `<button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} title="Imprimer le reçu" onClick={() => { setEditEntity(expense); setActiveModal('expense_receipt_preview'); }}>🖨️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(expense); setActiveModal('expense'); }}>✏️</button>`
  );
}

// 3. Add ExpenseReceiptPreview modal
if (!code.includes(`activeModal === 'expense_receipt_preview'`)) {
  code = code.replace(
    `{activeModal === 'teacher_receipt_preview' &&`,
    `{activeModal === 'expense_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu (Dépense)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              <ExpenseReceiptPreview 
                expense={editEntity} 
                schoolInfo={settingsData} 
              />
            </div>
          </div>
        )}

        {activeModal === 'teacher_receipt_preview' &&`
  );
}

// Add handleAddExpense to open receipt on success
if (!code.includes("setActiveModal('expense_receipt_preview');")) {
  code = code.replace(
    `await fetchExpenses();
      closeModal();
    } catch (err: any) {`,
    `await fetchExpenses();
      // Only show receipt for new expenses (not edit) to avoid annoyance, or maybe show always
      if (!editEntity) {
        // Find the newly created expense by order (first one)
        const { data: newData } = await supabase.from('expenses').select('*').eq('school_id', currentSchoolId).order('created_at', { ascending: false }).limit(1);
        if (newData && newData.length > 0) {
          setEditEntity(newData[0]);
          setActiveModal('expense_receipt_preview');
        } else {
          closeModal();
        }
      } else {
        closeModal();
      }
    } catch (err: any) {`
  );
}


fs.writeFileSync(filePath, code);
console.log("Expense Receipts patched into App.tsx successfully.");
