const fs = require('fs');

const appPath = 'c:\\Users\\koned\\Mon Drive\\SaaS\\ETABLISEMENT\\src\\App.tsx';
const lines = fs.readFileSync(appPath, 'utf8').split(/\r?\n/);

let outLines = [];
let i = 0;

while (i < lines.length) {
    let line = lines[i];

    // 4. Import
    if (line.includes("import { ReceiptPreview } from './components/ReceiptPreview';")) {
        outLines.push(line);
        outLines.push("import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';");
        i++; continue;
    }

    // 1. State
    if (line.includes('const [invoicesData, setInvoicesData] = useState<any[]>([]);')) {
        outLines.push(line);
        outLines.push('  const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);');
        i++; continue;
    }

    // 3. Call
    if (line.includes('        fetchInvoices();') && i > 300 && i < 400) {
        outLines.push(line);
        outLines.push('        fetchEmployeePayments();');
        i++; continue;
    }

    // 2. Fetch function AND sort invoices
    if (line.includes('const fetchInvoices = async () => {')) {
        outLines.push('  const fetchEmployeePayments = async () => {');
        outLines.push('    if (!currentSchoolId) return;');
        outLines.push('    try {');
        outLines.push('      const { data, error } = await supabase');
        outLines.push("        .from('employee_payments')");
        outLines.push("        .select('*, employees(first_name, last_name, role)')");
        outLines.push("        .eq('school_id', currentSchoolId)");
        outLines.push("        .order('payment_date', { ascending: false });");
        outLines.push('      if (error) throw error;');
        outLines.push('      setEmployeePaymentsData(data || []);');
        outLines.push('    } catch (error: any) {');
        outLines.push('      console.error("Error fetching employee payments:", error);');
        outLines.push('    }');
        outLines.push('  };');
        outLines.push('');
        outLines.push('  const fetchInvoices = async () => {');
        // also replace the next line which has the select
        i++;
        let nextLine = lines[i];
        nextLine = nextLine.replace(
            ".eq('school_id', currentSchoolId);",
            ".eq('school_id', currentSchoolId).order('payment_date', { ascending: false });"
        );
        outLines.push(nextLine);
        i++; continue;
    }

    // 9. Employee payload
    if (line.includes("const employee = {") && lines[i+1].includes("first_name")) {
        outLines.push(line);
        outLines.push(lines[i+1]); // first_name
        outLines.push(lines[i+2]); // last_name
        outLines.push(lines[i+3]); // role
        outLines.push("            salary: formData.get('salary') ? Number(formData.get('salary')) : 0,");
        i += 4; continue;
    }

    // 10. submit employee payment
    if (line.includes("else if (activeModal === 'absence') {") && i > 800 && i < 900) {
        outLines.push("        else if (activeModal === 'employee_payment') {");
        outLines.push("          const dateStr = formData.get('month') as string;");
        outLines.push("          const [year, monthNum] = dateStr.split('-');");
        outLines.push('          const monthNames = ["Janvier", "Février", "Mars", "Avril", "Mai", "Juin", "Juillet", "Août", "Septembre", "Octobre", "Novembre", "Décembre"];');
        outLines.push('          const monthText = monthNames[parseInt(monthNum)-1] + " " + year;');
        outLines.push("          ");
        outLines.push("          const payment = {");
        outLines.push("             employee_id: editEntity.id,");
        outLines.push("             amount: Number(formData.get('amount')),");
        outLines.push("             month: monthText,");
        outLines.push("             motif: formData.get('motif') || `Salaire ${monthText}`,");
        outLines.push("             payment_method: formData.get('payment_method')");
        outLines.push("          };");
        outLines.push("          const { data, error } = await supabase.from('employee_payments').insert([{...payment, school_id: currentSchoolId}]).select().single();");
        outLines.push("          if (error) throw error;");
        outLines.push("          fetchEmployeePayments();");
        outLines.push("          setSelectedInvoice(data);");
        outLines.push("          setActiveModal('employee_payment_preview');");
        outLines.push("          return;");
        outLines.push("        }");
        outLines.push(line);
        i++; continue;
    }

    // 11. renderRH
    if (line.includes("const renderRH = () => currentSchoolPlan !== 'Pro' ?")) {
        // Skip lines until the end of renderRH
        while (!lines[i].includes("const renderTeachers = () => (")) {
            i++;
        }
        
        const newRenderRH = `  const renderRH = () => currentSchoolPlan !== 'Pro' ? renderPremiumOverlay(t('admin.rh.premium_title', "Ressources Humaines"), t('admin.rh.premium_desc', "Gérez les contrats, salaires et plannings de vos employés avec le plan Pro.")) : (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.rh.title', 'Ressources Humaines')}</h1>
          <p className="page-subtitle">{t('admin.rh.subtitle', 'Gestion globale du personnel (Administratif, Survie, etc.).')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('employee')}>
          <Icons.Plus /> {t('admin.rh.btn_add', 'Ajouter Employé')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">{t('admin.rh.stat_admin', 'Personnel Admin.')}</span>
            <Icons.Briefcase />
          </div>
          <div className="stat-value">{formatNum(employeesData.length)}</div>
          <div className="stat-trend trend-up">{t('admin.rh.stat_admin_desc', 'Membres du personnel')}</div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.rh.stat_leave', 'Congés en cours')}</span>
            <Icons.Activity />
          </div>
          <div className="stat-value">{formatNum(0)}</div>
          <div className="stat-trend trend-down">{t('admin.rh.stat_leave_desc', 'Sur {{count}} personnels total', { count: employeesData.length })}</div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.rh.panel_title', 'Personnel Administratif')}</h3>
          <div className="header-search" style={{width: 250}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.rh.search_ph', 'Rechercher...')} />
          </div>
        </div>
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(250px, 1fr))', gap: '20px', marginTop: '20px'}}>
          {employeesData.length > 0 ? employeesData.map((staff, i) => (
            <div key={i} style={{border: '1px solid var(--border-color)', borderRadius: '12px', padding: '16px', display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center', background: 'var(--surface-color-hover)'}}>
              <div className="avatar" style={{width: 64, height: 64, fontSize: '1.5rem', marginBottom: 12}}>{staff.first_name.charAt(0)}{staff.last_name.charAt(0)}</div>
              <h4 style={{marginBottom: 4}}>{staff.first_name} {staff.last_name}</h4>
              <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 8}}>{staff.role}</span>
              <span style={{fontWeight: 'bold', fontSize: '1.1rem', color: 'var(--accent-color)', marginBottom: 12}}>{formatNum(staff.salary || 0)} FCFA</span>
              <span className={\`badge \${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}\`} style={{marginBottom: 16}}>{staff.status}</span>
              
              <div style={{display: 'flex', gap: '8px', width: '100%', marginTop: 'auto'}}>
                 <button className="btn btn-outline" style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={(e) => { e.stopPropagation(); setEditEntity(staff); setActiveModal('employee'); }}>Modifier</button>
                 <button className="btn btn-primary" style={{flex: 1, padding: '8px', fontSize: '0.9rem'}} onClick={(e) => { e.stopPropagation(); setEditEntity(staff); setActiveModal('employee_payment'); }}>Payer</button>
              </div>
            </div>
          )) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.rh.empty_state', 'Aucun employé trouvé. Cliquez sur Ajouter.')}</div>
          )}
        </div>
      </div>
      
      <div className="panel delay-400" style={{marginTop: '20px'}}>
         <div className="panel-header">
           <h3 className="panel-title">Derniers Salaires Payés</h3>
         </div>
         <div className="table-responsive">
           <table className="table">
             <thead>
               <tr>
                 <th>Date</th>
                 <th>Employé</th>
                 <th>Mois</th>
                 <th>Montant</th>
                 <th>Moyen</th>
                 <th>Action</th>
               </tr>
             </thead>
             <tbody>
               {employeePaymentsData && employeePaymentsData.slice(0, 10).map((pay: any, idx: number) => (
                 <tr key={pay.id || idx}>
                   <td>{new Date(pay.payment_date).toLocaleDateString('fr-FR')}</td>
                   <td>{pay.employees?.first_name} {pay.employees?.last_name}</td>
                   <td>{pay.month}</td>
                   <td style={{fontWeight: 'bold', color: 'var(--accent-color)'}}>{formatNum(pay.amount)} FCFA</td>
                   <td>{pay.payment_method}</td>
                   <td>
                     <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { setEditEntity(pay.employees); setSelectedInvoice(pay); setActiveModal('employee_payment_preview'); }}>
                       <Icons.FileText /> Reçu
                     </button>
                   </td>
                 </tr>
               ))}
               {(!employeePaymentsData || employeePaymentsData.length === 0) && (
                 <tr>
                   <td colSpan={6} style={{textAlign: 'center', color: 'var(--text-secondary)'}}>Aucun paiement enregistré</td>
                 </tr>
               )}
             </tbody>
           </table>
         </div>
      </div>
    </div>
  );
`;
        const renderLines = newRenderRH.split('\n');
        for (let l of renderLines) outLines.push(l);
        outLines.push("");
        // the next line is `const renderTeachers` which is matched in the while loop
        outLines.push(lines[i]);
        i++; continue;
    }

    // 5. Modal Headers
    if (line.includes("t('admin.modals.employee',") && i > 3100 && i < 3200) {
        outLines.push(line);
        outLines.push('                  {activeModal === \'employee_payment\' && "Payer Salaire"}');
        outLines.push('                  {activeModal === \'employee_payment_preview\' && "Reçu de Salaire"}');
        i++; continue;
    }

    // 6. employee form
    if (line.includes("activeModal === 'employee' && (") && i > 3200 && i < 3300) {
        outLines.push("                {activeModal === 'employee' && (");
        outLines.push("                      <>");
        outLines.push('                      <div className="form-group">');
        outLines.push("                        <label>{t('admin.modals.role', 'Poste / Rôle')}</label>");
        outLines.push('                        <input type="text" name="role" className="form-input" required defaultValue={editEntity?.role || \'\'} />');
        outLines.push("                      </div>");
        outLines.push('                      <div className="form-group">');
        outLines.push("                        <label>Salaire Mensuel (FCFA)</label>");
        outLines.push('                        <input type="number" name="salary" className="form-input" required defaultValue={editEntity?.salary || 0} />');
        outLines.push("                      </div>");
        outLines.push("                      </>");
        outLines.push("                    )}");
        i += 6; // skip the old block
        continue;
    }

    // 7. parent modal + employee payment modal
    if (line.includes("activeModal === 'parent' && (") && i > 3600 && i < 3700) {
        outLines.push(line);
        outLines.push(lines[i+1]);
        outLines.push(lines[i+2]);
        outLines.push(lines[i+3]);
        outLines.push(lines[i+4]);
        outLines.push(lines[i+5]); // this should be the end of parent modal
        
        outLines.push("                {activeModal === 'employee_payment' && editEntity && (");
        outLines.push('                    <div className="form-grid">');
        outLines.push('                      <div className="form-group" style={{gridColumn: \'1 / -1\'}}>');
        outLines.push("                        <label>Employé</label>");
        outLines.push('                        <input type="text" className="form-input" disabled value={editEntity.first_name + \' \' + editEntity.last_name + \' (\' + editEntity.role + \')\'} />');
        outLines.push("                      </div>");
        outLines.push('                      <div className="form-group">');
        outLines.push("                        <label>Mois payé</label>");
        outLines.push('                        <input type="month" name="month" className="form-input" required />');
        outLines.push("                      </div>");
        outLines.push('                      <div className="form-group">');
        outLines.push("                        <label>Montant (FCFA)</label>");
        outLines.push('                        <input type="number" name="amount" className="form-input" required defaultValue={editEntity.salary || 0} />');
        outLines.push("                      </div>");
        outLines.push('                      <div className="form-group" style={{gridColumn: \'1 / -1\'}}>');
        outLines.push("                        <label>Moyen de paiement</label>");
        outLines.push('                        <select name="payment_method" className="form-input">');
        outLines.push('                          <option value="Espèces">Espèces</option>');
        outLines.push('                          <option value="Virement">Virement</option>');
        outLines.push('                          <option value="Mobile Money">Mobile Money</option>');
        outLines.push('                          <option value="Chèque">Chèque</option>');
        outLines.push('                        </select>');
        outLines.push("                      </div>");
        outLines.push('                      <div className="form-group" style={{gridColumn: \'1 / -1\'}}>');
        outLines.push("                        <label>Motif</label>");
        outLines.push('                        <input type="text" name="motif" className="form-input" placeholder="Ex: Salaire du mois de Juin" />');
        outLines.push("                      </div>");
        outLines.push("                    </div>");
        outLines.push("                )}");
        outLines.push("                {activeModal === 'employee_payment_preview' && selectedInvoice && editEntity && (");
        outLines.push("                   <SalaryReceiptPreview payment={selectedInvoice} employee={editEntity} schoolInfo={adminSchools.find((s:any)=>s.id === currentSchoolId)} />");
        outLines.push("                )}");

        i += 6; continue;
    }

    // 8. Add `employee_payment_preview` button logics
    if (line.includes("includes(activeModal) && (") && i > 3600 && i < 3700) {
        outLines.push(line.replace(" 'coefficients'].includes(activeModal)", " 'coefficients', 'employee_payment_preview'].includes(activeModal)"));
        i++; continue;
    }

    outLines.push(line);
    i++;
}

fs.writeFileSync(appPath, outLines.join('\r\n'));
console.log('App.tsx rewritten sequentially.');
