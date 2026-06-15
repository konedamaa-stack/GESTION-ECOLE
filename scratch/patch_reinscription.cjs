const fs = require('fs');

let content = fs.readFileSync('src/App.tsx', 'utf8');

// 1. Add RefreshCw icon to Icons
if (!content.includes('RefreshCw: () =>')) {
  content = content.replace(
    '  Printer: () => <svg',
    '  RefreshCw: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,\n  Printer: () => <svg'
  );
}

// 2. Add activeModal === 'reinscription' in handleSaveEntity
const reinscriptionSubmitLogic = `
      if (activeModal === 'reinscription') {
        const studentUpdate = {
          class_id: formData.get('class_id'),
          status: 'Inscrit'
        };
        const { error: updateError } = await supabase.from('students').update(studentUpdate).eq('id', editEntity.id);
        if (updateError) throw updateError;

        if (formData.get('reg_fee_amount')) {
          const invoice = {
            student_id: editEntity.id,
            amount: formData.get('reg_fee_amount'),
            motif: 'Frais de Réinscription',
            payment_method: formData.get('reg_fee_method'),
            status: formData.get('reg_fee_status'),
            invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
            school_id: currentSchoolId
          };
          await supabase.from('invoices').insert([invoice]);
        }
        alert("Réinscription effectuée avec succès !");
        fetchStudents();
        closeModal();
        return;
      }
`;

if (!content.includes("activeModal === 'reinscription'")) {
  content = content.replace(
    "if (activeModal === 'student') {",
    reinscriptionSubmitLogic + "\n      if (activeModal === 'student') {"
  );
}

// 3. Update student logic to include status
if (!content.includes("status: formData.get('status')")) {
  content = content.replace(
    "birth_date: formData.get('birth_date'),",
    "birth_date: formData.get('birth_date'),\n            status: formData.get('status') || 'Inscrit',"
  );
}

// 4. Add 'reinscription' modal title
if (!content.includes("Réinscription de l'élève")) {
  content = content.replace(
    "{activeModal === 'student' && t('admin.modals.student', \"Nouvelle Inscription\")}",
    "{activeModal === 'student' && (editEntity ? \"Modifier l'Élève\" : t('admin.modals.student', \"Nouvelle Inscription\"))}\n                {activeModal === 'reinscription' && \"Réinscription de l'élève\"}"
  );
}

// 5. Add status field to student edit modal
const statusField = `
                    <div className="form-group">
                      <label>Statut</label>
                      <select name="status" className="form-select" required defaultValue={editEntity?.status || "Inscrit"}>
                        <option value="Inscrit">Inscrit</option>
                        <option value="Inactif">Inactif</option>
                        <option value="Ancien élève">Ancien élève</option>
                        <option value="Renvoyé">Renvoyé</option>
                      </select>
                    </div>
`;

if (content.includes("className=\"form-group\"\>\n                      \<label\>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}")) {
  if (!content.includes("<option value=\"Inactif\">Inactif</option>")) {
    content = content.replace(
      "<div className=\"form-group\">\n                      <label>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}</label>",
      statusField + "\n                    <div className=\"form-group\">\n                      <label>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}</label>"
    );
  }
}

// 6. Add reinscription form
const reinscriptionForm = `
              {activeModal === 'reinscription' && editEntity && (
                <form onSubmit={handleFormSubmit}>
                  <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                    <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                    <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                  </div>

                  <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                  <div className="form-group">
                    <label>Nouvelle Classe</label>
                    <select name="class_id" className="form-select" required defaultValue={editEntity.class_id}>
                      <option value="">Choisir une classe...</option>
                      {classesData.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>

                  <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>2. Frais de Réinscription</h3>
                  <div className="form-group">
                    <label>Montant des frais de réinscription (CFA)</label>
                    <input type="number" name="reg_fee_amount" className="form-input" placeholder="Ex: 25000" />
                    <small style={{color: 'var(--text-secondary)'}}>Laissez vide si l'élève n'a pas de frais à payer.</small>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Mode de paiement</label>
                      <select name="reg_fee_method" className="form-select">
                        <option value="Espèces">Espèces</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Virement">Virement</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>Statut du paiement</label>
                      <select name="reg_fee_status" className="form-select">
                        <option value="Payée">Payée (Immédiatement)</option>
                        <option value="En attente">En attente (Paiement ultérieur)</option>
                      </select>
                    </div>
                  </div>

                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">Valider la Réinscription</button>
                  </div>
                </form>
              )}
`;

if (!content.includes("Valider la Réinscription")) {
  content = content.replace(
    "{/* Class Form */}",
    reinscriptionForm + "\n              {/* Class Form */}"
  );
}

// 7. Add Reinscrire button in the table
const reinscrireBtn = `
                    <button className="icon-btn" onClick={() => {
                      setEditEntity(student);
                      setActiveModal('reinscription');
                    }} title="Réinscrire" style={{color: 'var(--accent-color)'}}>
                      <Icons.RefreshCw />
                    </button>`;

if (!content.includes("title=\"Réinscrire\"")) {
  content = content.replace(
    "<button className=\"icon-btn\" onClick={() => { setEditEntity(student); setActiveModal('student'); }} title=\"Modifier\">",
    reinscrireBtn + "\n                    <button className=\"icon-btn\" onClick={() => { setEditEntity(student); setActiveModal('student'); }} title=\"Modifier\">"
  );
}

fs.writeFileSync('src/App.tsx', content);
console.log('Patch successfully applied!');
