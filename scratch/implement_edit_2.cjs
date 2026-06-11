const fs = require('fs');
const path = require('path');
const file = path.join(__dirname, '../src/App.tsx');
let content = fs.readFileSync(file, 'utf8');

// Modals - Student
content = content.replace(
  '<input type="text" name="last_name" className="form-input" required />',
  '<input type="text" name="last_name" className="form-input" required defaultValue={editEntity?.last_name || ""} />'
);
content = content.replace(
  '<input type="text" name="first_name" className="form-input" required />',
  '<input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />'
);
content = content.replace(
  '<input type="date" name="birth_date" className="form-input" required />',
  '<input type="date" name="birth_date" className="form-input" required defaultValue={editEntity?.birth_date || ""} />'
);
content = content.replace(
  '<select name="class_id" className="form-select" required>',
  '<select name="class_id" className="form-select" required defaultValue={editEntity?.class_id || ""}>'
);
content = content.replace(
  '<input type="text" name="password" className="form-input" placeholder="passer123" />',
  '<input type="text" name="password" className="form-input" placeholder={editEntity ? "Laisser vide pour ne pas changer" : "passer123"} />'
);
content = content.replace(
  '<h3 style={{marginTop: \'24px\', marginBottom: \'16px\', color: \'var(--primary-color)\', fontSize: \'1.1rem\', borderBottom: \'1px solid var(--border-color)\', paddingBottom: \'8px\'}}>{t(\'admin.modals.parent_info\', \'2. Informations du Parent / Tuteur\')}</h3>',
  '{!editEntity && (<><h3 style={{marginTop: \'24px\', marginBottom: \'16px\', color: \'var(--primary-color)\', fontSize: \'1.1rem\', borderBottom: \'1px solid var(--border-color)\', paddingBottom: \'8px\'}}>{t(\'admin.modals.parent_info\', \'2. Informations du Parent / Tuteur\')}</h3>'
);
content = content.replace(
  '<div style={{marginTop: \'32px\', display: \'flex\', justifyContent: \'flex-end\', gap: \'12px\'}}>',
  '</>)}\n                  <div style={{marginTop: \'32px\', display: \'flex\', justifyContent: \'flex-end\', gap: \'12px\'}}>'
);
content = content.replace(
  '<button type="submit" className="btn btn-primary">{t(\'admin.modals.complete_registration\', "Valider l\'inscription complète")}</button>',
  '<button type="submit" className="btn btn-primary">{editEntity ? \'Mettre à jour\' : t(\'admin.modals.complete_registration\', "Valider l\'inscription complète")}</button>'
);

// Modals - Teachers / Parents / Employees
content = content.replace(
  '{[\'employee\', \'teacher\', \'parent\'].includes(activeModal) && (\n                <form onSubmit={handleFormSubmit}>\n                  <div style={{display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'16px\'}}>\n                    <div className="form-group">\n                      <label>{t(\'admin.modals.last_name\', \'Nom\')}</label>\n                      <input type="text" name="last_name" className="form-input" required />\n                    </div>\n                    <div className="form-group">\n                      <label>{t(\'admin.modals.first_name\', \'Prénom(s)\')}</label>\n                      <input type="text" name="first_name" className="form-input" required />\n                    </div>',
  '{[\'employee\', \'teacher\', \'parent\'].includes(activeModal) && (\n                <form onSubmit={handleFormSubmit}>\n                  <div style={{display: \'grid\', gridTemplateColumns: \'1fr 1fr\', gap: \'16px\'}}>\n                    <div className="form-group">\n                      <label>{t(\'admin.modals.last_name\', \'Nom\')}</label>\n                      <input type="text" name="last_name" className="form-input" required defaultValue={editEntity?.last_name || ""} />\n                    </div>\n                    <div className="form-group">\n                      <label>{t(\'admin.modals.first_name\', \'Prénom(s)\')}</label>\n                      <input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />\n                    </div>'
);
content = content.replace(
  '<input type="tel" name="phone" className="form-input" placeholder="+221 77 000 00 00" required />',
  '<input type="tel" name="phone" className="form-input" placeholder="+221 77 000 00 00" required defaultValue={editEntity?.phone || ""} />'
);
content = content.replace(
  '<input type="email" name="email" className="form-input" required={activeModal === \'teacher\'} />',
  '<input type="email" name="email" className="form-input" required={activeModal === \'teacher\'} defaultValue={editEntity?.email || ""} />'
);
content = content.replace(
  '<input type="text" name="password" className="form-input" placeholder="Généré automatiquement" />',
  '<input type="text" name="password" className="form-input" placeholder={editEntity ? "Laisser vide pour ne pas changer" : "Généré automatiquement"} />'
);
content = content.replace(
  '<input type="text" name="subject" className="form-input" required />',
  '<input type="text" name="subject" className="form-input" required defaultValue={editEntity?.subject || ""} />'
);
content = content.replace(
  '<button type="submit" className="btn btn-primary">{t(\'admin.modals.create_profile\', \'Créer le profil\')}</button>',
  '<button type="submit" className="btn btn-primary">{editEntity ? \'Mettre à jour\' : t(\'admin.modals.create_profile\', \'Créer le profil\')}</button>'
);


fs.writeFileSync(file, content);
console.log('Script 2 done');
