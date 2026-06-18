const fs = require('fs');

let content = fs.readFileSync('src/components/TeacherPortal.tsx', 'utf8');

// 1. Add jsPDF imports
if (!content.includes('import jsPDF')) {
  content = content.replace(
    `import { useTranslation } from 'react-i18next';`,
    `import { useTranslation } from 'react-i18next';\nimport jsPDF from 'jspdf';\nimport 'jspdf-autotable';`
  );
}

// 2. Add schoolSettings state and generation logic
if (!content.includes('school_settings')) {
  content = content.replace(
    `  const [studentsData, setStudentsData] = useState<any[]>([]);`,
    `  const [studentsData, setStudentsData] = useState<any[]>([]);\n  const [settings, setSettings] = useState<any>(null);`
  );

  content = content.replace(
    `const { data: stdData } = await supabase.from('students').select('*');`,
    `const { data: stdData } = await supabase.from('students').select('*');\n      const { data: set } = await supabase.from('school_settings').select('*').limit(1).single();\n      if (set) setSettings(set);`
  );

  const pdfLogic = `
  const generatePDF = (student: any, period: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(settings?.school_name || "Établissement", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(\`Bulletin de notes - \${period}\`, pageWidth / 2, 28, { align: "center" });
    doc.text(\`Année Académique : \${settings?.academic_year || "2025-2026"}\`, pageWidth / 2, 34, { align: "center" });

    // Student Info
    doc.setFontSize(11);
    doc.text(\`Élève : \${student.first_name} \${student.last_name}\`, 14, 50);
    doc.text(\`Matricule : \${student.matricule}\`, 14, 56);
    const className = classesData.find(c => c.id === student.class_id)?.name || student.class_id;
    doc.text(\`Classe : \${className}\`, 120, 50);

    // Get evaluations for this period and this student's class
    const periodEvals = evaluationsData.filter(e => e.period === period && e.class_id === student.class_id);
    
    // Aggregate by subject
    const subjectGrades: Record<string, { total: number; count: number; maxTotal: number }> = {};
    
    periodEvals.forEach(ev => {
      const g = gradesData.find(g => g.evaluation_id === ev.id && g.student_id === student.id);
      if (g && g.score !== null) {
        if (!subjectGrades[ev.subject]) {
          subjectGrades[ev.subject] = { total: 0, count: 0, maxTotal: 0 };
        }
        subjectGrades[ev.subject].total += g.score;
        subjectGrades[ev.subject].maxTotal += ev.max_score;
        subjectGrades[ev.subject].count += 1;
      }
    });

    const tableData: any[] = [];
    let totalScore = 0;
    let totalMax = 0;

    Object.keys(subjectGrades).forEach(sub => {
      const sg = subjectGrades[sub];
      const avgSur20 = (sg.total / sg.maxTotal) * 20;
      tableData.push([
        sub,
        \`\${sg.total.toFixed(2)} / \${sg.maxTotal}\`,
        avgSur20.toFixed(2),
        "" // Appreciation
      ]);
      totalScore += avgSur20;
      totalMax += 20;
    });

    const generalAvg = totalMax > 0 ? (totalScore / totalMax) * 20 : 0;

    (doc as any).autoTable({
      startY: 65,
      head: [['Matière', 'Notes Obtenues', 'Moyenne (/20)', 'Appréciations']],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 65;

    doc.setFont("helvetica", "bold");
    doc.text(\`Moyenne Générale : \${generalAvg.toFixed(2)} / 20\`, 14, finalY + 15);

    doc.setFont("helvetica", "normal");
    doc.text("Le Professeur principal", pageWidth - 50, finalY + 30);
    
    doc.save(\`Bulletin_\${student.matricule}_\${period}.pdf\`);
  };
`;

  content = content.replace(
    `  const filteredEvals = getFilteredEvaluations();`,
    pdfLogic + `\n  const filteredEvals = getFilteredEvaluations();`
  );
}

// 3. Add Bulletin button in the students table
const studentsHeader = `<th style={{padding: '12px', fontWeight: 'bold'}}>{t('teacher.status', "Statut")}</th>`;
const studentsHeaderNew = `<th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.status', "Statut")}</th>\n<th style={{padding: '12px', fontWeight: 'bold'}}>Bulletins</th>`;
content = content.replace(studentsHeader, studentsHeaderNew);

const studentsRow = `<td style={{padding: '12px'}}><span className={\`badge \${student.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`}>{student.status || 'Inscrit'}</span></td>`;
const studentsRowNew = `<td style={{padding: '12px', borderRight: '1px solid #eee'}}><span className={\`badge \${student.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}\`}>{student.status || 'Inscrit'}</span></td>
<td style={{padding: '12px'}}>
  <div style={{display: 'flex', gap: '4px'}}>
    <button className="btn btn-outline" style={{padding: '2px 8px', fontSize: '0.75rem'}} onClick={() => generatePDF(student, 'Trimestre 1')}>T1</button>
    <button className="btn btn-outline" style={{padding: '2px 8px', fontSize: '0.75rem'}} onClick={() => generatePDF(student, 'Trimestre 2')}>T2</button>
    <button className="btn btn-outline" style={{padding: '2px 8px', fontSize: '0.75rem'}} onClick={() => generatePDF(student, 'Trimestre 3')}>T3</button>
  </div>
</td>`;
content = content.replace(studentsRow, studentsRowNew);

// Adjust colgroup
const colgroup = `<colgroup>
                      <col style={{width: '100px'}} />
                      <col style={{width: '200px'}} />
                      <col style={{width: '250px'}} />
                      <col style={{width: '150px'}} />
                    </colgroup>`;
const colgroupNew = `<colgroup>
                      <col style={{width: '100px'}} />
                      <col style={{width: '200px'}} />
                      <col style={{width: '200px'}} />
                      <col style={{width: '100px'}} />
                      <col style={{width: '150px'}} />
                    </colgroup>`;
content = content.replace(colgroup, colgroupNew);

// Adjust colspan
const colspan = `<td colSpan={4} style={{textAlign: 'center', padding: '24px', color: '#777'}}>{t('teacher.no_student_found', "Aucun élève trouvé dans cette classe.")}</td>`;
const colspanNew = `<td colSpan={5} style={{textAlign: 'center', padding: '24px', color: '#777'}}>{t('teacher.no_student_found', "Aucun élève trouvé dans cette classe.")}</td>`;
content = content.replace(colspan, colspanNew);

fs.writeFileSync('src/components/TeacherPortal.tsx', content);
console.log('TeacherPortal.tsx patched with PDF bulletin generation');
