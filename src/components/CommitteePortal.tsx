import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';


export default function CommitteePortal({ session, onLogout }: { session: any; onLogout: () => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [settings, setSettings] = useState<any>(null);

  useEffect(() => {
    fetchData();
  }, [session]);

  const fetchData = async () => {
    const { data: cls } = await supabase.from('classes').select('*').order('name');
    if (cls) setClasses(cls);

    const { data: st } = await supabase.from('students').select('*').order('last_name');
    if (st) setStudents(st);

    const { data: evals } = await supabase.from('evaluations').select('*').order('date', { ascending: false });
    if (evals) setEvaluations(evals);

    const { data: grad } = await supabase.from('grades').select('*');
    if (grad) setGrades(grad);

    const { data: set } = await supabase.from('school_settings').select('*').limit(1).single();
    if (set) setSettings(set);
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return students;
    return students.filter(s => s.class_id === selectedClass);
  };

  const generatePDF = (student: any, period: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(settings?.school_name || "Établissement", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`Bulletin de notes - ${period}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`Année Académique : ${settings?.academic_year || "2025-2026"}`, pageWidth / 2, 34, { align: "center" });

    // Student Info
    doc.setFontSize(11);
    doc.text(`Élève : ${student.first_name} ${student.last_name}`, 14, 50);
    doc.text(`Matricule : ${student.matricule}`, 14, 56);
    const className = classes.find(c => c.id === student.class_id)?.name || student.class_id;
    doc.text(`Classe : ${className}`, 120, 50);

    // Get evaluations for this period and this student's class
    const periodEvals = evaluations.filter(e => e.period === period && e.class_id === student.class_id);
    
    // Aggregate by subject
    const subjectGrades: Record<string, { total: number; count: number; maxTotal: number }> = {};
    
    periodEvals.forEach(ev => {
      const g = grades.find(g => g.evaluation_id === ev.id && g.student_id === student.id);
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
      // Convert everything to a base of 20 for the average
      const avgSur20 = (sg.total / sg.maxTotal) * 20;
      tableData.push([
        sub,
        `${sg.total.toFixed(2)} / ${sg.maxTotal}`,
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
    doc.text(`Moyenne Générale : ${generalAvg.toFixed(2)} / 20`, 14, finalY + 15);

    doc.setFont("helvetica", "normal");
    doc.text("Le Comité d'examen", pageWidth - 50, finalY + 30);
    
    doc.save(`Bulletin_${student.matricule}_${period}.pdf`);
  };

  return (
    <div style={{minHeight: '100vh', background: 'var(--background-color)'}}>
      <header style={{background: 'var(--surface-color)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: 40, height: 40, background: '#F59E0B', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
            C
          </div>
          <div>
            <h1 style={{margin: 0, fontSize: '1.2rem'}}>Comité d'examen</h1>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{settings?.school_name}</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{session.first_name} {session.last_name}</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{session.email}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout}>Déconnexion</button>
        </div>
      </header>

      <main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px'}}>
          <h2 style={{marginTop: 0, marginBottom: '20px'}}>Filtres</h2>
          <div style={{display: 'flex', gap: '16px'}}>
            <div style={{flex: 1}}>
              <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Classe</label>
              <select 
                className="input-field" 
                value={selectedClass || ''} 
                onChange={(e) => setSelectedClass(e.target.value || null)}
                style={{width: '100%'}}
              >
                <option value="">Toutes les classes</option>
                {classes.map(c => (
                  <option key={c.id} value={c.id}>{c.name}</option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <div style={{background: 'var(--surface-color)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
          <table style={{width: '100%', borderCollapse: 'collapse'}}>
            <thead style={{background: 'var(--background-color)'}}>
              <tr>
                <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Élève</th>
                <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Matricule</th>
                <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Classe</th>
                <th style={{padding: '16px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Actions (Bulletins)</th>
              </tr>
            </thead>
            <tbody>
              {getFilteredStudents().map(student => {
                const className = classes.find(c => c.id === student.class_id)?.name;
                return (
                  <tr key={student.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                    <td style={{padding: '16px'}}>{student.first_name} {student.last_name}</td>
                    <td style={{padding: '16px'}}>{student.matricule}</td>
                    <td style={{padding: '16px'}}>{className}</td>
                    <td style={{padding: '16px'}}>
                      <div style={{display: 'flex', gap: '8px'}}>
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => generatePDF(student, 'Trimestre 1')}>T1</button>
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => generatePDF(student, 'Trimestre 2')}>T2</button>
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => generatePDF(student, 'Trimestre 3')}>T3</button>
                      </div>
                    </td>
                  </tr>
                );
              })}
              {getFilteredStudents().length === 0 && (
                <tr>
                  <td colSpan={4} style={{padding: '32px', textAlign: 'center', color: 'var(--text-secondary)'}}>
                    Aucun élève trouvé
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </main>
    </div>
  );
}
