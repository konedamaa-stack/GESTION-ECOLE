const fs = require('fs');
const path = require('path');

const targetFile = path.resolve(__dirname, '../src/App.tsx');
let content = fs.readFileSync(targetFile, 'utf8');

// 1. Add RefreshCw icon
if (!content.includes('RefreshCw: () =>')) {
  content = content.replace(
    'Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,',
    'Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,\n  RefreshCw: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,'
  );
}

// 2. Add activeModal === 'reinscription' logic
if (!content.includes("activeModal === 'reinscription'")) {
  const submitLogic = `      if (activeModal === 'reinscription') {
        const studentUpdate: any = {
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

      if (activeModal === 'student') {`;
  
  content = content.replace("      if (activeModal === 'student') {", submitLogic);
}

// 3. Update student status saving
if (!content.includes("status: formData.get('status') || 'Inscrit'")) {
  content = content.replace(
    "birth_date: formData.get('birth_date'),\n            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null",
    "birth_date: formData.get('birth_date'),\n            status: formData.get('status') || 'Inscrit',\n            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null"
  );
}

// 4. Add Reinscrire button
if (!content.includes("title=\"Réinscrire\"")) {
  content = content.replace(
    '<button className="btn btn-outline" title="Modifier" style={{padding: \'6px 12px\', marginRight: \'8px\'}} onClick={() => { setEditEntity(row); setActiveModal(\'student\'); }}>✏️</button>',
    '<button className="btn btn-outline" title="Réinscrire" style={{padding: \'6px 12px\', marginRight: \'8px\', color: \'var(--accent-color)\', borderColor: \'var(--accent-color)\'}} onClick={() => { setEditEntity(row); setActiveModal(\'reinscription\'); }}><Icons.RefreshCw /></button>\n                  <button className="btn btn-outline" title="Modifier" style={{padding: \'6px 12px\', marginRight: \'8px\'}} onClick={() => { setEditEntity(row); setActiveModal(\'student\'); }}>✏️</button>'
  );
}

// 5. Update student modal title
if (content.includes("{activeModal === 'student' && t('admin.modals.student', \"Nouvelle Inscription\")}")) {
  content = content.replace(
    "{activeModal === 'student' && t('admin.modals.student', \"Nouvelle Inscription\")}",
    "{activeModal === 'student' && (editEntity ? \"Modifier l'Élève\" : t('admin.modals.student', \"Nouvelle Inscription\"))}\n                {activeModal === 'reinscription' && \"Réinscription de l'élève\"}"
  );
}

// 6. Add status field in student edit form
if (!content.includes('<option value="Ancien élève">Ancien élève</option>')) {
  content = content.replace(
    '<div className="form-group">\n                      <label>{t(\'admin.modals.password_default\', \'Mot de passe (par défaut: passer123)\')}</label>',
    `<div className="form-group">
                      <label>Statut</label>
                      <select name="status" className="form-select" required defaultValue={editEntity?.status || "Inscrit"}>
                        <option value="Inscrit">Inscrit</option>
                        <option value="Inactif">Inactif</option>
                        <option value="Ancien élève">Ancien élève</option>
                        <option value="Renvoyé">Renvoyé</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}</label>`
  );
}

// 7. Add reinscription form
if (!content.includes("Valider la Réinscription")) {
  const formStr = `              {/* Reinscription Form */}
              {activeModal === 'reinscription' && editEntity && (
                <form onSubmit={handleFormSubmit}>
                  <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                    <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                    <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                  </div>

                  <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                  <div className="form-group">
                    <label>Nouvelle Classe</label>
                    <select name="class_id" className="form-select" required defaultValue={editEntity.class_id || ""}>
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

              {/* General Form for Employees/Teachers/Parents */}`;
  content = content.replace(
    "{/* General Form for Employees/Teachers/Parents */}",
    formStr
  );
}

fs.writeFileSync(targetFile, content);
console.log('App.tsx patched successfully');
