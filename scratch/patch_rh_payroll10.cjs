const fs = require('fs');
const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
let content = fs.readFileSync(appPath, 'utf8');

const regex1 = /\['global_grades', 'bulletin_preview', 'receipt_preview'\]/;
const replacement1 = `['global_grades', 'bulletin_preview', 'receipt_preview', 'employee_payment_preview']`;

const regex2 = /\{activeModal === 'receipt_preview' && "Re[^"]+"\}/;
const replacement2 = `{activeModal === 'receipt_preview' && "Reçu de Paiement"}\n                  {activeModal === 'employee_payment_preview' && "Reçu de Paiement Salaire"}`;

if (regex1.test(content) && regex2.test(content)) {
    content = content.replace(regex1, replacement1);
    content = content.replace(regex2, replacement2);
    fs.writeFileSync(appPath, content);
    console.log("Patched modal headers successfully.");
} else {
    console.error("Could not find targets for modal headers patch!");
    console.log("regex1 found?", regex1.test(content));
    console.log("regex2 found?", regex2.test(content));
}
