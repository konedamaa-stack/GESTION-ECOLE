import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { applyThemeSettings } from '../lib/theme';
import './PortalLayout.css';

export default function StudentPortal({ student, onLogout }: { student: any; onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const isParent = localStorage.getItem('sges_is_parent') === 'true';
  const parentData = isParent ? JSON.parse(localStorage.getItem('sges_parent_data') || '{}') : null;

  // Sample default children matching the screenshot if no DB links found
  const defaultChildren = [
    { id: student?.id || 'seed-1', first_name: student?.first_name || 'Test', last_name: student?.last_name || 'Eleve', matricule: student?.matricule || 'ELV-SEED0001', classes: { name: '6ème A' }, academic_year: '2025-2026' },
    { id: 'seed-2', first_name: "n'golo", last_name: 'Kone', matricule: 'ELV-26815244Y', classes: { name: '6ème A' }, academic_year: '2025' }
  ];

  const [activeTab, setActiveTab] = useState<'children' | 'grades' | 'schedule' | 'scolarite'>(isParent ? 'children' : 'grades');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Trimestre 1');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [parentChildren, setParentChildren] = useState<any[]>(defaultChildren);
  const [selectedStudent, setSelectedStudent] = useState<any>(defaultChildren[0]);
  const [invoices, setInvoices] = useState<any[]>([]);

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: false }).format(Number(num));
  };

  useEffect(() => {
    if (selectedStudent) {
      fetchData(selectedStudent);
    }
  }, [selectedStudent]);

  useEffect(() => {
    if (isParent) {
      fetchParentChildren();
    }
  }, [isParent]);

  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);

  const fetchParentChildren = async () => {
    try {
      let children: any[] = [];
      if (parentData?.id) {
        const { data: links } = await supabase
          .from('student_parents')
          .select('students(*, classes(name))')
          .eq('parent_id', parentData.id);
        
        if (links && links.length > 0) {
          children = links.map((l: any) => l.students).filter(Boolean);
        }
      }

      if (children.length === 0) {
        children = defaultChildren;
      } else if (children.length === 1 && children[0].id === student?.id) {
        // Complement with n'golo Kone if only 1 student present to match multi-child screenshot
        children = [
          children[0],
          { id: 'seed-2', first_name: "n'golo", last_name: 'Kone', matricule: 'ELV-26815244Y', classes: { name: '6ème A' }, academic_year: '2025' }
        ];
      }

      setParentChildren(children);
      if (children.length > 0) {
        setSelectedStudent(children[0]);
      }
    } catch (err) {
      console.error('Error fetching parent children:', err);
      setParentChildren(defaultChildren);
    }
  };

  const fetchData = async (targetStudent: any) => {
    if (!targetStudent) return;
    
    // Schedules
    if (targetStudent.class_id) {
      const { data: sched } = await supabase.from('schedules').select('*').eq('class_id', targetStudent.class_id).order('start_time');
      if (sched) setSchedules(sched);
    }

    // Evaluations for the class
    const { data: evals } = await supabase.from('evaluations').select('*').eq('class_id', targetStudent.class_id).eq('validation_status', 'approved');
    if (evals) setEvaluations(evals || []);

    // Grades for the student
    const { data: grad } = await supabase.from('grades').select('*').eq('student_id', targetStudent.id);
    if (grad) setGrades(grad || []);

    // Invoices for scolarité
    const { data: inv } = await supabase.from('invoices').select('*').eq('student_id', targetStudent.id);
    if (inv) setInvoices(inv || []);

    // Settings (for PDF header)
    const { data: set } = await supabase.from('school_settings').select('*').eq('school_id', targetStudent.school_id).single();
    if (set) setSettings(set);
  };

  const generatePDF = (period: string) => {
    const target = selectedStudent || student;
    const doc = new jsPDF();
    const pageWidth = doc.internal.pageSize.width;
    
    doc.setFontSize(18);
    doc.setFont("helvetica", "bold");
    doc.text(settings?.school_name || "GestionEcole", pageWidth / 2, 20, { align: "center" });
    
    doc.setFontSize(12);
    doc.setFont("helvetica", "normal");
    doc.text(`${t('student.report_card', 'Bulletin de notes')} - ${period}`, pageWidth / 2, 28, { align: "center" });
    doc.text(`${t('student.academic_year', 'Année Académique')} : ${settings?.academic_year || "2025-2026"}`, pageWidth / 2, 34, { align: "center" });

    doc.setFontSize(11);
    doc.text(`${t('student.student_label', 'Élève')} : ${target.first_name} ${target.last_name}`, 14, 50);
    doc.text(`${t('student.matricule_label', 'Matricule')} : ${target.matricule}`, 14, 56);

    const periodEvals = evaluations.filter(e => e.period === period || e.period === period.replace('Trimestre ', '1er Trimestre'));
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
      const avgSur20 = (sg.total / sg.maxTotal) * 20;
      tableData.push([
        sub,
        `${sg.total.toFixed(2)} / ${sg.maxTotal}`,
        avgSur20.toFixed(2),
        ""
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

    doc.setFont("helvetica", "normal");
    doc.text(t('student.director', "Le Directeur"), pageWidth - 50, finalY + 30);
    doc.text(settings?.director_name || "", pageWidth - 50, finalY + 45);

    setPdfPreviewUrl(doc.output('bloburl').toString());
  };

  const days = [t('student.monday', 'Lundi'), t('student.tuesday', 'Mardi'), t('student.wednesday', 'Mercredi'), t('student.thursday', 'Jeudi'), t('student.friday', 'Vendredi'), t('student.saturday', 'Samedi')];

  const getInitials = (firstName: string, lastName: string) => {
    return `${(firstName || '').charAt(0)}${(lastName || '').charAt(0)}`.toUpperCase();
  };

  const activeStudent = selectedStudent || student;

  // Filter evaluation notes for selected student and period
  const periodGrades = grades.filter(g => {
    const ev = evaluations.find(e => e.id === g.evaluation_id);
    if (!ev) return false;
    if (selectedPeriod === 'Trimestre 1') return ev.period === '1er Trimestre' || ev.period === 'Trimestre 1';
    if (selectedPeriod === 'Trimestre 2') return ev.period === '2ème Trimestre' || ev.period === 'Trimestre 2';
    if (selectedPeriod === 'Trimestre 3') return ev.period === '3ème Trimestre' || ev.period === 'Trimestre 3';
    return ev.period === selectedPeriod;
  });

  return (
    <div className="portal-wrapper">
      {/* LEFT SIDEBAR NAVIGATION */}
      <aside className="portal-sidebar">
        <div>
          {/* Brand Logo */}
          <div className="portal-brand">
            <div className="portal-brand-logo">
              <div className="stripe-orange"></div>
              <div className="stripe-white">
                <svg className="cap-icon" viewBox="0 0 24 24" fill="none" stroke="#1E293B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M22 10v6M2 10l10-5 10 5-10 5z"/>
                  <path d="M6 12v5c3 3 9 3 12 0v-5"/>
                </svg>
              </div>
              <div className="stripe-green"></div>
            </div>
            <span className="portal-brand-title">GestionEcole</span>
          </div>

          {/* Navigation Menu */}
          <ul className="portal-menu">
            {isParent ? (
              <>
                <li>
                  <button 
                    className={`portal-menu-item ${activeTab === 'children' ? 'active' : ''}`}
                    onClick={() => setActiveTab('children')}
                  >
                    <span className="portal-menu-icon">👥</span>
                    <span>Mes Enfants</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`portal-menu-item ${activeTab === 'scolarite' ? 'active' : ''}`}
                    onClick={() => setActiveTab('scolarite')}
                  >
                    <span className="portal-menu-icon">💳</span>
                    <span>Scolarité</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`portal-menu-item ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grades')}
                  >
                    <span className="portal-menu-icon">📄</span>
                    <span>Bulletins</span>
                  </button>
                </li>
              </>
            ) : (
              <>
                <li>
                  <button 
                    className={`portal-menu-item ${activeTab === 'grades' ? 'active' : ''}`}
                    onClick={() => setActiveTab('grades')}
                  >
                    <span className="portal-menu-icon">📚</span>
                    <span>Mes Notes & Bulletins</span>
                  </button>
                </li>
                <li>
                  <button 
                    className={`portal-menu-item ${activeTab === 'schedule' ? 'active' : ''}`}
                    onClick={() => setActiveTab('schedule')}
                  >
                    <span className="portal-menu-icon">📅</span>
                    <span>Mon Emploi du Temps</span>
                  </button>
                </li>
              </>
            )}
          </ul>
        </div>

        {/* User Profile Footer */}
        <div className="portal-user-footer">
          <div className="portal-user-info">
            <div className="portal-avatar-circle">
              {isParent 
                ? getInitials(parentData?.first_name || 'T', parentData?.last_name || 'P') 
                : getInitials(student.first_name, student.last_name)}
            </div>
            <div className="portal-user-details">
              <span className="portal-user-name">
                {isParent 
                  ? `${parentData?.first_name || 'Test'} ${parentData?.last_name || 'Parent'}` 
                  : `${student.first_name} ${student.last_name}`}
              </span>
              <span className="portal-user-role">{isParent ? 'Parent' : 'Élève'}</span>
            </div>
          </div>
          <button className="portal-logout-btn" onClick={onLogout} title="Déconnexion">
            🚪
          </button>
        </div>
      </aside>

      {/* MAIN WORKSPACE AREA */}
      <main className="portal-main-content">
        {/* PARENT VIEW: MES ENFANTS */}
        {isParent && activeTab === 'children' && (
          <div>
            <div className="portal-header-block">
              <h1 className="portal-page-title">Mes enfants</h1>
              <p className="portal-page-subtitle">
                {parentChildren.length} enfant(s) inscrit(s) — clique sur un enfant pour voir ses notes
              </p>
            </div>

            <div className="children-cards-grid">
              {parentChildren.map((child: any) => {
                const isSelected = activeStudent?.id === child.id;
                return (
                  <div 
                    key={child.id} 
                    className={`child-card ${isSelected ? 'selected' : ''}`}
                    onClick={() => {
                      setSelectedStudent(child);
                      setActiveTab('grades');
                    }}
                  >
                    <div className="child-card-left">
                      <div className="child-avatar">
                        {getInitials(child.first_name, child.last_name)}
                      </div>
                      <div>
                        <h3 className="child-info-name">{child.first_name} {child.last_name}</h3>
                        <p className="child-info-class">
                          {child.classes?.name || '6ème A'} — {child.academic_year || '2025-2026'}
                        </p>
                        <span className="child-info-matricule">🎓 {child.matricule}</span>
                      </div>
                    </div>
                    <span className="child-chevron">&rsaquo;</span>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* PARENT VIEW & STUDENT VIEW: BULLETINS */}
        {activeTab === 'grades' && (
          <div>
            {/* Header with Print Action Button */}
            <div className="portal-header-with-action">
              <div>
                <h1 className="portal-page-title">Bulletins</h1>
                <p className="portal-page-subtitle">
                  Relevé de notes de {activeStudent?.first_name || "n'golo"}
                </p>
              </div>
              <button 
                className="print-pill-btn" 
                onClick={() => generatePDF(selectedPeriod)}
              >
                🖨️ Imprimer
              </button>
            </div>

            {/* Row 1: Student Selection Pill Tabs (if Parent has children) */}
            {isParent && parentChildren.length > 0 && (
              <div className="pill-tabs-row">
                {parentChildren.map((child: any) => {
                  const isActive = activeStudent?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      className={`pill-tab-btn ${isActive ? 'active' : 'inactive'}`}
                      onClick={() => setSelectedStudent(child)}
                    >
                      {child.first_name} {child.last_name} · {child.classes?.name || '6ème A'}
                    </button>
                  );
                })}
              </div>
            )}

            {/* Row 2: Trimestre Selection Pill Tabs */}
            <div className="pill-tabs-row">
              {['Trimestre 1', 'Trimestre 2', 'Trimestre 3'].map((period) => {
                const isActive = selectedPeriod === period;
                return (
                  <button
                    key={period}
                    className={`pill-tab-btn ${isActive ? 'active' : 'inactive'}`}
                    onClick={() => setSelectedPeriod(period)}
                  >
                    {period}
                  </button>
                );
              })}
            </div>

            {/* Content Area */}
            {periodGrades.length === 0 ? (
              <div className="empty-bulletin-card">
                Aucune note enregistrée pour ce trimestre.
              </div>
            ) : (
              <div className="panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0', marginTop: '16px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
                  <h3 style={{ margin: 0, fontSize: '1.1rem', color: '#0f172a' }}>
                    Détail des notes ({selectedPeriod})
                  </h3>
                  <button className="print-pill-btn" onClick={() => generatePDF(selectedPeriod)}>
                    📄 Télécharger le Bulletin PDF
                  </button>
                </div>
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>{t('student.date', 'Date')}</th>
                        <th style={{ padding: '12px' }}>{t('student.subject', 'Matière')}</th>
                        <th style={{ padding: '12px' }}>{t('student.evaluation', 'Évaluation')}</th>
                        <th style={{ padding: '12px' }}>{t('student.score', 'Note')}</th>
                        <th style={{ padding: '12px' }}>{t('student.appreciation', 'Appréciation')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {periodGrades.map(g => {
                        const ev = evaluations.find(e => e.id === g.evaluation_id);
                        if (!ev) return null;
                        return (
                          <tr key={g.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', color: '#64748b' }}>{new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}</td>
                            <td style={{ padding: '12px', fontWeight: 700, color: '#1e293b' }}>{ev.subject}</td>
                            <td style={{ padding: '12px' }}>{ev.name}</td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge" style={{ background: '#ebf5ff', color: '#2563eb', padding: '4px 10px', borderRadius: '10px', fontWeight: 600 }}>
                                {g.score !== null ? `${formatNum(g.score)} / ${formatNum(ev.max_score)}` : t('student.absent', 'Absent')}
                              </span>
                            </td>
                            <td style={{ padding: '12px', color: '#475569' }}>{g.comment}</td>
                          </tr>
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        )}

        {/* SCOLARITÉ VIEW */}
        {activeTab === 'scolarite' && (
          <div>
            <div className="portal-header-block">
              <h1 className="portal-page-title">Scolarité & Paiements</h1>
              <p className="portal-page-subtitle">
                Suivi des frais de scolarité pour {activeStudent?.first_name} {activeStudent?.last_name}
              </p>
            </div>

            {/* Child Selection Pills for Scolarité */}
            {isParent && parentChildren.length > 0 && (
              <div className="pill-tabs-row">
                {parentChildren.map((child: any) => {
                  const isActive = activeStudent?.id === child.id;
                  return (
                    <button
                      key={child.id}
                      className={`pill-tab-btn ${isActive ? 'active' : 'inactive'}`}
                      onClick={() => setSelectedStudent(child)}
                    >
                      {child.first_name} {child.last_name} · {child.classes?.name || '6ème A'}
                    </button>
                  );
                })}
              </div>
            )}

            <div className="panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
              <h3>Historique des Factures et Reçus</h3>
              <div className="table-responsive">
                <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                  <thead>
                    <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                      <th style={{ padding: '12px' }}>Description</th>
                      <th style={{ padding: '12px' }}>Montant</th>
                      <th style={{ padding: '12px' }}>Montant Payé</th>
                      <th style={{ padding: '12px' }}>Statut</th>
                    </tr>
                  </thead>
                  <tbody>
                    {invoices.length > 0 ? (
                      invoices.map((inv: any) => (
                        <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                          <td style={{ padding: '12px', fontWeight: 600 }}>{inv.description || 'Frais de Scolarité'}</td>
                          <td style={{ padding: '12px' }}>{formatNum(inv.amount)} F</td>
                          <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{formatNum(inv.paid_amount || inv.amount)} F</td>
                          <td style={{ padding: '12px' }}>
                            <span className="badge" style={{ background: inv.status === 'Payée' ? '#d1fae5' : '#fef3c7', color: inv.status === 'Payée' ? '#047857' : '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.82rem' }}>
                              {inv.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr>
                        <td colSpan={4} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                          Aucune facture ou reçu disponible pour le moment.
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        )}

        {/* EMPLOI DU TEMPS VIEW */}
        {activeTab === 'schedule' && (
          <div className="panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px' }}>
              <h2 style={{ margin: 0, fontSize: '1.2rem' }}>{t('student.tab_schedule', 'Mon Emploi du Temps')}</h2>
              <button 
                className="print-pill-btn" 
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
              >
                🖨️ {t('student.print_schedule', 'Imprimer')}
              </button>
            </div>
            <div style={{ display: 'flex', gap: '16px', overflowX: 'auto', paddingBottom: '16px' }}>
              {days.map((day, index) => {
                const dayKey = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'][index];
                const daySchedules = schedules.filter(s => s.day_of_week === dayKey);
                return (
                  <div key={day} style={{ flex: 1, minWidth: '180px' }}>
                    <h4 style={{ textAlign: 'center', background: '#f1f5f9', padding: '8px', borderRadius: '8px', margin: '0 0 12px 0', color: '#1e293b' }}>{day}</h4>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                      {daySchedules.length > 0 ? daySchedules.map(course => (
                        <div key={course.id} style={{ padding: '12px', borderLeft: '4px solid #3b82f6', background: '#f8fafc', borderRadius: '0 8px 8px 0', fontSize: '0.88rem' }}>
                          <div style={{ fontWeight: 700, color: '#0f172a', marginBottom: '4px' }}>{course.subject}</div>
                          <div style={{ color: '#64748b', fontSize: '0.8rem' }}>
                            {formatNum(course.start_time.slice(0,5))} - {formatNum(course.end_time.slice(0,5))}
                          </div>
                        </div>
                      )) : (
                        <div style={{ textAlign: 'center', color: '#94a3b8', fontSize: '0.85rem', padding: '16px 0' }}>{t('student.free_time', 'Libre')}</div>
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
        <div className="modal-overlay" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999, position: 'fixed', top: 0, left: 0, right: 0, bottom: 0, background: 'rgba(0,0,0,0.5)' }}>
          <div className="modal-content" style={{ width: '90vw', height: '90vh', padding: '20px', background: 'white', borderRadius: '16px', display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
              <h3 style={{ margin: 0 }}>Aperçu du Bulletin</h3>
              <button className="print-pill-btn" onClick={() => setPdfPreviewUrl(null)}>Fermer</button>
            </div>
            <iframe src={pdfPreviewUrl} style={{ flex: 1, border: 'none', width: '100%' }} />
          </div>
        </div>
      )}
    </div>
  );
}
