const fs = require('fs');

const frPath = './src/locales/fr.json';
const arPath = './src/locales/ar.json';

const fr = JSON.parse(fs.readFileSync(frPath, 'utf8'));
const ar = JSON.parse(fs.readFileSync(arPath, 'utf8'));

fr.admin.modals.dossier_title_infos = "Informations & Planning";
fr.admin.modals.dossier_title_docs = "Documents & Annexes";
fr.admin.modals.school_infos = "Informations Scolaires";
fr.admin.modals.current_class = "Classe Actuelle";
fr.admin.modals.birth_date_title = "Date de naissance";
fr.admin.modals.class_schedule = "Emploi du temps";
fr.admin.modals.no_schedule = "Aucun emploi du temps n'a encore été configuré pour cette classe.";
fr.admin.modals.add_doc = "Ajouter un document";
fr.admin.modals.doc_type_admin = "Administratif (Exeat, Naissance)";
fr.admin.modals.doc_type_med = "Médical (Vaccin, Certificat)";
fr.admin.modals.doc_type_pedag = "Pédagogique (Bulletins)";
fr.admin.modals.doc_type_other = "Autre (Autorisations)";
fr.admin.modals.upload_btn = "Ajouter le document";
fr.admin.modals.files_attached = "Fichiers joints";
fr.admin.modals.added_on = "Ajouté le";
fr.admin.modals.unassigned = "Non assigné";

ar.admin.modals.dossier_title_infos = "المعلومات والجدول الزمني";
ar.admin.modals.dossier_title_docs = "المستندات والملحقات";
ar.admin.modals.school_infos = "المعلومات المدرسية";
ar.admin.modals.current_class = "القسم الحالي";
ar.admin.modals.birth_date_title = "تاريخ الميلاد";
ar.admin.modals.class_schedule = "الجدول الزمني";
ar.admin.modals.no_schedule = "لم يتم إعداد جدول زمني لهذا القسم بعد.";
ar.admin.modals.add_doc = "إضافة مستند";
ar.admin.modals.doc_type_admin = "إداري (شهادة مغادرة، ميلاد)";
ar.admin.modals.doc_type_med = "طبي (لقاح، شهادة)";
ar.admin.modals.doc_type_pedag = "تربوي (كشوف درجات)";
ar.admin.modals.doc_type_other = "أخرى (تراخيص)";
ar.admin.modals.upload_btn = "إضافة المستند";
ar.admin.modals.files_attached = "الملفات المرفقة";
ar.admin.modals.added_on = "أضيف في";
ar.admin.modals.unassigned = "غير معين";


fs.writeFileSync(frPath, JSON.stringify(fr, null, 2));
fs.writeFileSync(arPath, JSON.stringify(ar, null, 2));
