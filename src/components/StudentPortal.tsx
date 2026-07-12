import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { applyThemeSettings } from '../lib/theme';

export default function StudentPortal({ student, onLogout }: { student: any; onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState<'grades' | 'schedule'>('grades');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: false }).format(Number(num));
  };

  useEffect(() => {
    fetchData();
  }, [student.id, student.class_id]);

  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);

  const fetchData = async () => {
    // Schedules
    if (student.class_id) {
      const { data: sched } = await supabase.from('schedules').select('*').eq('class_id', student.class_id).order('start_time');
      if (sched) setSchedules(sched);
    }

    // Evaluations for the class
    const { data: evals } = await supabase.from('evaluations').select('*').eq('class_id', student.class_id).eq('validation_status', 'approved');
    if (evals) setEvaluations(evals);

    // Grades for the student
    const { data: grad } = await supabase.from('grades').select('*').eq('student_id', student.id);
    if (grad) setGrades(grad);

    // Settings (for PDF header)
    const { data: set } = await supabase.from('school_settings').select('*').eq('school_id', student.school_id).single();
    if (set) setSettings(set);
  };

  const generatePDF = (period: string) => {
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    // Header
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(settings?.school_name || "Établissement", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${t('student.report_card', 'Bulletin de notes')} - ${period}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`${t('student.academic_year', 'Année Académique')} : ${settings?.academic_year || "2025-2026"}`, pageWidth / 2, 34, { align: "center" });

    // Student Info
    doc.setFontSize(11);
    doc.text(`${t('student.student_label', 'Élève')} : ${student.first_name} ${student.last_name}`, 14, 50);
    doc.text(`${t('student.matricule_label', 'Matricule')} : ${student.matricule}`, 14, 56);
    doc.text(`${t('student.class_label', 'Classe')} : (${student.class_id})`, 120, 50); // Optionally fetch class name
    doc.text(`${t('student.dob_label', 'Date de naissance')} : ${new Date(student.date_of_birth).toLocaleDateString()}`, 120, 56);

    // Get evaluations for this period
    const periodEvals = evaluations.filter(e => e.period === period);
    
    // Aggregate by subject
    const subjectGrades: Record<string, { total: number; count: number; maxTotal: number }> = {};
    
    periodEvals.forEach(ev => {
      const g = grades.find(g => g.evaluation_id === ev.id);
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
      head: [[t('student.subject', 'Matière'), t('student.marks_obtained', 'Notes Obtenues'), t('student.average_20', 'Moyenne (/20)'), t('student.appreciations', 'Appréciations')]],
      body: tableData,
      theme: 'grid',
      headStyles: { fillColor: [59, 130, 246] }
    });

    const finalY = (doc as any).lastAutoTable.finalY || 65;

    doc.setFont("helvetica", "bold");
    doc.text(`${t('student.general_avg', 'Moyenne Générale')} : ${generalAvg.toFixed(2)} / 20`, 14, finalY + 15);

    // Footer signature
    doc.setFont("helvetica", "normal");
    doc.text(t('student.director', "Le Directeur"), pageWidth - 50, finalY + 30);
    doc.text(settings?.director_name || "", pageWidth - 50, finalY + 45);

    setPdfPreviewUrl(doc.output('bloburl').toString());
  };

  const days = [t('student.monday', 'Lundi'), t('student.tuesday', 'Mardi'), t('student.wednesday', 'Mercredi'), t('student.thursday', 'Jeudi'), t('student.friday', 'Vendredi'), t('student.saturday', 'Samedi')];

  return (
    <div style={{minHeight: '100vh', background: 'var(--background-color)'}}>
      <header style={{background: 'var(--surface-color)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: 40, height: 40, background: 'var(--primary-color)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
            S
          </div>
          <div>
            <h1 style={{margin: 0, fontSize: '1.2rem'}}>{t('student.portal_title', 'Portail Élève')}</h1>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>{settings?.school_name}</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{student.first_name} {student.last_name}</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{student.matricule}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout}>{t('app.logout', 'Déconnexion')}</button>
        </div>
      </header>

      <main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', gap: '16px', marginBottom: '32px'}}>
          <button 
            className={`btn ${activeTab === 'grades' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('grades')}
          >
            {t('student.tab_grades', 'Mes Notes & Bulletins')}
          </button>
          <button 
            className={`btn ${activeTab === 'schedule' ? 'btn-primary' : 'btn-outline'}`}
            onClick={() => setActiveTab('schedule')}
          >
            {t('student.tab_schedule', 'Mon Emploi du Temps')}
          </button>
        </div>

        {activeTab === 'grades' && (
          <div className="panel">
            <h2 style={{marginTop: 0}}>{t('student.periodic_reports', 'Bulletins Périodiques')}</h2>
            <div style={{display: 'flex', gap: '16px', flexWrap: 'wrap'}}>
              {[{key: '1er Trimestre', t_key: 'teacher.term_1'}, {key: '2ème Trimestre', t_key: 'teacher.term_2'}, {key: '3ème Trimestre', t_key: 'teacher.term_3'}].map(period => (
                <div key={period.key} style={{padding: '24px', border: '1px solid var(--border-color)', borderRadius: '12px', flex: '1', minWidth: '250px', background: 'var(--background-color)', display: 'flex', flexDirection: 'column', gap: '16px'}}>
                  <h3 style={{margin: 0, fontSize: '1.1rem'}}>{t(period.t_key, period.key)}</h3>
                  <button className="btn btn-primary" onClick={() => generatePDF(period.key)}>
                    {t('student.download_pdf', 'Télécharger le PDF')}
                  </button>
                </div>
              ))}
            </div>

            <h3 style={{marginTop: '48px'}}>{t('student.recent_grades', 'Détail des notes récentes')}</h3>
            <div className="table-responsive">
              <table className="data-table">
                <thead>
                  <tr>
                    <th>{t('student.date', 'Date')}</th>
                    <th>{t('student.subject', 'Matière')}</th>
                    <th>{t('student.evaluation', 'Évaluation')}</th>
                    <th>{t('student.score', 'Note')}</th>
                    <th>{t('student.appreciation', 'Appréciation')}</th>
                  </tr>
                </thead>
                <tbody>
                  {grades.map(g => {
                    const ev = evaluations.find(e => e.id === g.evaluation_id);
                    if (!ev) return null;
                    return (
                      <tr key={g.id}>
                        <td>{new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}</td>
                        <td style={{fontWeight: 600}}>{ev.subject}</td>
                        <td>{ev.name}</td>
                        <td><span className="badge" style={{background: 'var(--surface-color-hover)'}}>{g.score !== null ? `${formatNum(g.score)} / ${formatNum(ev.max_score)}` : t('student.absent', 'Absent')}</span></td>
                        <td>{t(`teacher.c_${g.comment === 'Excellent travail' ? 'excellent' : g.comment === 'Très bien' ? 'very_good' : g.comment === 'Bien' ? 'good' : g.comment === 'Assez bien' ? 'fair' : g.comment === 'Passable' ? 'passable' : g.comment === 'Insuffisant' ? 'insufficient' : g.comment === 'Peut mieux faire' ? 'can_do_better' : ''}`, g.comment as any) as any}</td>
                      </tr>
                    );
                  })}
                  {grades.length === 0 && (
                    <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0'}}>{t('student.no_recent_grades', 'Aucune note enregistrée pour le moment.')}</td></tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {activeTab === 'schedule' && (
          <div className="panel printable-schedule-wrapper">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
              <h2 style={{marginTop: 0, marginBottom: 0}}>{t('student.tab_schedule', 'Mon Emploi du Temps')}</h2>
              <button 
                className="btn btn-outline" 
                onClick={() => {
                  const styleEl = document.createElement('style');
                  styleEl.id = 'schedule-print-style';
                  styleEl.innerHTML = '@page { size: landscape; margin: 0; }';
                  document.head.appendChild(styleEl);
                  document.body.classList.add('printing-schedule');
                  window.print();
                  setTimeout(() => {
                    document.body.classList.remove('printing-schedule');
                    const existing = document.getElementById('schedule-print-style');
                    if (existing) existing.remove();
                  }, 1000);
                }}
                style={{display: 'flex', alignItems: 'center', gap: '8px'}}
              >
                <span>🖨️</span> {t('student.print_schedule', 'Imprimer')}
              </button>
            </div>
            <div style={{display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px'}}>
              {days.map((day, index) => {
                const dayKey = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][index];
                const daySchedules = schedules.filter(s => s.day_of_week === dayKey);
                return (
                  <div key={day} style={{flex: 1, minWidth: '200px'}}>
                    <h4 style={{textAlign: 'center', background: 'var(--surface-color-hover)', padding: '8px', borderRadius: '4px', margin: '0 0 12px 0'}}>{day}</h4>
                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      {daySchedules.length > 0 ? daySchedules.map(course => (
                        <div key={course.id} style={{padding: '12px', borderLeft: '4px solid var(--primary-color)', background: 'var(--background-color)', borderRadius: '0 4px 4px 0', fontSize: '0.9rem', boxShadow: '0 1px 3px rgba(0,0,0,0.05)'}}>
                          <div style={{fontWeight: 600, color: 'var(--text-color)', marginBottom: '4px'}}>{course.subject}</div>
                          <div style={{color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '4px'}}>
                            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><circle cx="12" cy="12" r="10"/><polyline points="12 6 12 12 16 14"/></svg>
                            {formatNum(course.start_time.slice(0,5))} - {formatNum(course.end_time.slice(0,5))}
                          </div>
                        </div>
                      )) : (
                        <div style={{textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.85rem', padding: '16px 0'}}>{t('student.free_time', 'Libre')}</div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </main>

      {/* PDF Modal */}
      {pdfPreviewUrl && (
        <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
          <div className="modal-content" style={{width: '90vw', height: '90vh', padding: '20px', background: 'white', display: 'flex', flexDirection: 'column'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px'}}>
              <h3>Aperçu du Bulletin</h3>
              <button className="btn btn-outline" onClick={() => setPdfPreviewUrl(null)}>Fermer</button>
            </div>
            <iframe src={pdfPreviewUrl} style={{flex: 1, border: 'none', width: '100%'}} />
          </div>
        </div>
      )}
    </div>
  );
}
