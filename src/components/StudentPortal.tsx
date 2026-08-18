import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import jsPDF from 'jspdf';
import 'jspdf-autotable';
import { useTranslation } from 'react-i18next';
import { applyThemeSettings } from '../lib/theme';
import { BulletinPreview } from './BulletinPreview';
import { ReceiptPreview } from './ReceiptPreview';
import { SmallReceiptPreview } from './SmallReceiptPreview';
import './PortalLayout.css';

export default function StudentPortal({ student, onLogout }: { student: any; onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const isParent = localStorage.getItem('sges_is_parent') === 'true';
  const parentData = isParent ? JSON.parse(localStorage.getItem('sges_parent_data') || '{}') : null;

  const [activeTab, setActiveTab] = useState<'children' | 'grades' | 'schedule' | 'scolarite'>(isParent ? 'children' : 'grades');
  const [selectedPeriod, setSelectedPeriod] = useState<string>('Trimestre 1');
  const [schedules, setSchedules] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);
  const [settings, setSettings] = useState<any>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [parentChildren, setParentChildren] = useState<any[]>(student ? [student] : []);
  const [selectedStudent, setSelectedStudent] = useState<any>(student || null);
  const [invoices, setInvoices] = useState<any[]>([]);
  const [receiptModalInvoice, setReceiptModalInvoice] = useState<any>(null);
  const [receiptModalType, setReceiptModalType] = useState<'a4' | 'ticket' | null>(null);

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
    const loadInitialSettings = async () => {
      const schoolId = student?.school_id || parentData?.school_id || (parentChildren.length > 0 ? parentChildren[0].school_id : null);
      if (schoolId) {
        const { data: set } = await supabase.from('school_settings').select('*').eq('school_id', schoolId).maybeSingle();
        if (set) {
          setSettings(set);
        } else {
          const { data: sch } = await supabase.from('schools').select('*').eq('id', schoolId).maybeSingle();
          if (sch) setSettings({ school_name: sch.name, logo_url: sch.logo_url });
        }
      }
    };
    loadInitialSettings();
  }, [student, parentData, parentChildren]);

  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);

  const fetchParentChildren = async () => {
    try {
      let children: any[] = [];
      if (parentData?.id) {
        const { data: links } = await supabase
          .from('student_parents')
          .select('students(*, classes(name, tuition_fee, tuition_fee_affecte), student_parents(parents(first_name, last_name)))')
          .eq('parent_id', parentData.id);
        
        if (links && links.length > 0) {
          children = links.map((l: any) => l.students).filter(Boolean);
        }
      }

      if (children.length === 0 && student) {
        children = [student];
      }

      setParentChildren(children);
      if (children.length > 0) {
        setSelectedStudent(children[0]);
      }
    } catch (err) {
      console.error('Error fetching parent children:', err);
      if (student) {
        setParentChildren([student]);
        setSelectedStudent(student);
      }
    }
  };

  const fetchData = async (targetStudent: any) => {
    if (!targetStudent) return;
    
    // Ensure class tuition fees are available
    if (targetStudent.class_id && (!targetStudent.classes || targetStudent.classes.tuition_fee === undefined)) {
      const { data: cls } = await supabase.from('classes').select('name, tuition_fee, tuition_fee_affecte').eq('id', targetStudent.class_id).maybeSingle();
      if (cls) {
        targetStudent.classes = cls;
      }
    }
    
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

    // Class Subjects Coefficients
    if (targetStudent.class_id) {
      const { data: cs } = await supabase.from('class_subjects').select('*').eq('class_id', targetStudent.class_id);
      if (cs) setClassSubjects(cs);
    }
  };

  const generatePDF = (period: string, mode: 'download' | 'print' | 'preview' = 'download') => {
    if (mode === 'print') {
      window.print();
      return;
    }

    try {
      const target = selectedStudent || student;
      if (!target) {
        alert("Aucun élève sélectionné.");
        return;
      }

      const doc = new jsPDF();
      const pageWidth = doc.internal.pageSize.width;
      
      doc.setFontSize(16);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      
      const safeStr = (str: string) => {
        if (!str) return '';
        return str.replace(/[^\x00-\x7F\u00C0-\u00FF]/g, '');
      };

      doc.text(safeStr((settings?.school_name || "ÉTABLISSEMENT SCOLAIRE").toUpperCase()) || "ETABLISSEMENT SCOLAIRE", pageWidth / 2, 16, { align: "center" });
      
      doc.setFontSize(11);
      doc.setFont("helvetica", "normal");
      doc.setTextColor(71, 85, 105);
      doc.text(`BULLETIN DE NOTES - ${period.toUpperCase()}`, pageWidth / 2, 23, { align: "center" });
      doc.text(`Année Académique : ${settings?.academic_year || "2024-2025"}`, pageWidth / 2, 29, { align: "center" });

      // Divider
      doc.setDrawColor(37, 99, 235);
      doc.setLineWidth(0.8);
      doc.line(14, 33, pageWidth - 14, 33);

      // Student metadata
      doc.setFontSize(10);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(15, 23, 42);
      doc.text(`Élève : ${safeStr(target.first_name || '')} ${safeStr(target.last_name || '')}`, 14, 42);
      doc.text(`Matricule : ${target.matricule || '---'}`, 14, 48);
      doc.text(`Classe : ${safeStr(target.classes?.name || '---')}`, pageWidth - 60, 42);

      // Filter evaluations matching period
      const isPeriodMatch = (evPeriod: string, selPeriod: string) => {
        if (!evPeriod) return false;
        if (evPeriod === selPeriod) return true;
        if (selPeriod === 'Trimestre 1' && (evPeriod === '1er Trimestre' || evPeriod === 'Trimestre 1')) return true;
        if (selPeriod === 'Trimestre 2' && (evPeriod === '2ème Trimestre' || evPeriod === 'Trimestre 2')) return true;
        if (selPeriod === 'Trimestre 3' && (evPeriod === '3ème Trimestre' || evPeriod === 'Trimestre 3')) return true;
        return false;
      };

      const targetGrades = grades.filter(g => g.student_id === target.id || !g.student_id);
      const subjectGrades: Record<string, { total: number; count: number; maxTotal: number }> = {};

      evaluations.forEach(ev => {
        if (isPeriodMatch(ev.period, period)) {
          const g = targetGrades.find(g => g.evaluation_id === ev.id);
          if (g && g.score !== null && g.score !== undefined) {
            if (!subjectGrades[ev.subject]) {
              subjectGrades[ev.subject] = { total: 0, count: 0, maxTotal: 0 };
            }
            subjectGrades[ev.subject].total += Number(g.score);
            subjectGrades[ev.subject].maxTotal += Number(ev.max_score || 20);
            subjectGrades[ev.subject].count += 1;
          }
        }
      });

      const tableData: any[] = [];
      let totalScore = 0;
      let totalMax = 0;

      Object.keys(subjectGrades).forEach(sub => {
        const sg = subjectGrades[sub];
        const avgSur20 = sg.maxTotal > 0 ? (sg.total / sg.maxTotal) * 20 : 0;
        const appreciation = avgSur20 >= 16 ? "Très bien" : avgSur20 >= 14 ? "Bien" : avgSur20 >= 12 ? "Assez bien" : avgSur20 >= 10 ? "Passable" : "Insuffisant";
        tableData.push([
          sub,
          `${sg.total.toFixed(2)} / ${sg.maxTotal}`,
          avgSur20.toFixed(2),
          appreciation
        ]);
        totalScore += avgSur20;
        totalMax += 20;
      });

      const generalAvg = totalMax > 0 ? (totalScore / totalMax) * 20 : 0;

      (doc as any).autoTable({
        startY: 55,
        head: [[t('student.subject', 'Matière'), t('student.marks_obtained', 'Notes Obtenues'), t('student.average_20', 'Moyenne (/20)'), t('student.appreciations', 'Appréciations')]],
        body: tableData.length > 0 ? tableData : [['Aucune note enregistrée', '---', '---', '---']],
        theme: 'grid',
        headStyles: { fillColor: [37, 99, 235], textColor: [255, 255, 255], fontStyle: 'bold' },
        styles: { fontSize: 9, cellPadding: 4 }
      });

      const finalY = (doc as any).lastAutoTable ? (doc as any).lastAutoTable.finalY + 12 : 120;

      doc.setFont("helvetica", "bold");
      doc.setFontSize(10);
      doc.text(`${t('student.general_avg', 'Moyenne Générale')} : ${generalAvg.toFixed(2)} / 20`, 14, finalY);

      doc.setFont("helvetica", "normal");
      doc.text(t('student.director', "Le Directeur / La Direction"), pageWidth - 65, finalY + 15);
      if (settings?.director_name) {
        doc.text(safeStr(settings.director_name), pageWidth - 65, finalY + 22);
      }

      const fileName = `Bulletin_${(target.last_name || 'Eleve').replace(/\s+/g, '_')}_${(target.first_name || '').replace(/\s+/g, '_')}_${period.replace(/\s+/g, '_')}.pdf`;

      doc.save(fileName);
    } catch (err) {
      console.warn("PDF export error fallback to window.print()", err);
      window.print();
    }
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
          <div className="portal-brand" style={{ display: 'flex', alignItems: 'center', gap: '12px', padding: '16px 20px' }}>
            <img 
              src={settings?.logo_url || '/logo-coran.jpg'} 
              alt="Logo" 
              style={{ width: '42px', height: '42px', borderRadius: '8px', objectFit: 'contain' }} 
              onError={(e) => {
                (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg';
              }}
            />
            <span className="portal-brand-title" style={{ fontSize: '1rem', fontWeight: 700, color: '#1e293b', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '165px' }}>
              {settings?.school_name || "Établissement"}
            </span>
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
                onClick={() => generatePDF(selectedPeriod, 'print')}
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

            {/* Row 2: Trimestre Selection Pill Tabs & Print Button */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '10px', margin: '15px 0' }}>
              <div className="pill-tabs-row" style={{ margin: 0 }}>
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

              <div>
                <button
                  className="print-pill-btn"
                  onClick={() => window.print()}
                  style={{ padding: '8px 16px', background: '#0284c7', color: 'white', border: 'none', borderRadius: '8px', cursor: 'pointer', fontWeight: 600 }}
                >
                  🖨️ Imprimer / PDF
                </button>
              </div>
            </div>

            {/* Content Area */}
            {periodGrades.length === 0 ? (
              <div className="empty-bulletin-card">
                Aucune note enregistrée pour ce trimestre.
              </div>
            ) : (
              <div style={{ marginTop: '16px', overflowX: 'auto' }}>
                <BulletinPreview
                  classData={selectedStudent?.classes || { name: '6ème A' }}
                  students={[selectedStudent]}
                  evaluations={evaluations}
                  grades={grades}
                  period={selectedPeriod}
                  schoolInfo={settings}
                  classSubjects={classSubjects}
                  schedules={schedules}
                  targetStudentId={selectedStudent?.id}
                />
              </div>
            )}
          </div>
        )}

        {/* SCOLARITÉ VIEW */}
        {activeTab === 'scolarite' && (() => {
          const studentTuition = Number(activeStudent?.tuition_fee) || (activeStudent?.affecte === 'Affecté' ? Number(activeStudent?.classes?.tuition_fee_affecte) : Number(activeStudent?.classes?.tuition_fee)) || (invoices.length > 0 ? Number(invoices[0].amount) : 52500);
          const totalPaid = invoices.filter((inv: any) => inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.paid_amount) || Number(inv.amount) || 0), 0);
          const resteToPay = Math.max(0, studentTuition - totalPaid);
          const isSolde = resteToPay <= 0 && studentTuition > 0;
          const progress = studentTuition > 0 ? Math.min(100, Math.round((totalPaid / studentTuition) * 100)) : 0;

          return (
            <div>
              <div className="portal-header-block">
                <h1 className="portal-page-title">Scolarité & Paiements</h1>
                <p className="portal-page-subtitle">
                  Suivi détaillé des frais de scolarité pour {activeStudent?.first_name} {activeStudent?.last_name}
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
                        {child.first_name} {child.last_name} · {child.classes?.name || 'Classe'}
                      </button>
                    );
                  })}
                </div>
              )}

              {/* Financial KPI Summary Cards */}
              <div style={{ marginBottom: '24px' }}>
                <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: '16px', marginBottom: '16px' }}>
                  {/* Total Scolarité */}
                  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #e2e8f0', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#64748b', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      📚 Total Scolarité
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#1e293b' }}>
                      {formatNum(studentTuition)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#64748b' }}>F CFA</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#94a3b8', marginTop: '4px' }}>
                      {activeStudent?.affecte === 'Affecté' ? 'Tarif Élève Affecté' : 'Tarif Standard'} ({activeStudent?.classes?.name || 'Classe'})
                    </div>
                  </div>

                  {/* Montant Déjà Payé */}
                  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: '1px solid #d1fae5', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: '#059669', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      ✅ Montant Déjà Payé
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: '#10b981' }}>
                      {formatNum(totalPaid)} <span style={{ fontSize: '1rem', fontWeight: 600, color: '#059669' }}>F CFA</span>
                    </div>
                    <div style={{ fontSize: '0.8rem', color: '#059669', marginTop: '4px', fontWeight: 600 }}>
                      {progress}% de la scolarité réglé
                    </div>
                  </div>

                  {/* Reste à Payer */}
                  <div style={{ background: 'white', padding: '20px', borderRadius: '16px', border: isSolde ? '1px solid #d1fae5' : '1px solid #fed7aa', boxShadow: '0 1px 3px rgba(0,0,0,0.05)' }}>
                    <div style={{ fontSize: '0.85rem', color: isSolde ? '#059669' : '#ea580c', fontWeight: 600, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '8px' }}>
                      ⏳ Reste à Payer
                    </div>
                    <div style={{ fontSize: '1.6rem', fontWeight: 800, color: isSolde ? '#10b981' : '#f97316' }}>
                      {formatNum(resteToPay)} <span style={{ fontSize: '1rem', fontWeight: 600, color: isSolde ? '#059669' : '#ea580c' }}>F CFA</span>
                    </div>
                    <div style={{ marginTop: '6px' }}>
                      {isSolde ? (
                        <span style={{ background: '#d1fae5', color: '#047857', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                          🎉 SCOLARITÉ SOLDÉE
                        </span>
                      ) : (
                        <span style={{ background: '#ffedd5', color: '#c2410c', padding: '3px 10px', borderRadius: '8px', fontSize: '0.8rem', fontWeight: 700 }}>
                          Paiement en cours
                        </span>
                      )}
                    </div>
                  </div>
                </div>

                {/* Progress Bar */}
                <div style={{ background: 'white', padding: '16px 20px', borderRadius: '14px', border: '1px solid #e2e8f0', display: 'flex', flexDirection: 'column', gap: '8px' }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', fontWeight: 600, color: '#475569' }}>
                    <span>Progression du règlement</span>
                    <span>{formatNum(totalPaid)} F / {formatNum(studentTuition)} F ({progress}%)</span>
                  </div>
                  <div style={{ width: '100%', height: '10px', background: '#f1f5f9', borderRadius: '999px', overflow: 'hidden' }}>
                    <div style={{ width: `${progress}%`, height: '100%', background: isSolde ? '#10b981' : 'linear-gradient(90deg, #3b82f6, #10b981)', borderRadius: '999px', transition: 'width 0.4s ease' }}></div>
                  </div>
                </div>
              </div>

              <div className="panel" style={{ background: 'white', padding: '24px', borderRadius: '16px', border: '1px solid #e2e8f0' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px' }}>
                  <h3 style={{ margin: 0 }}>Historique des Versements et Reçus</h3>
                </div>
                <div className="table-responsive">
                  <table className="table" style={{ width: '100%', borderCollapse: 'collapse' }}>
                    <thead>
                      <tr style={{ borderBottom: '2px solid #e2e8f0', textAlign: 'left' }}>
                        <th style={{ padding: '12px' }}>Date</th>
                        <th style={{ padding: '12px' }}>Description</th>
                        <th style={{ padding: '12px' }}>Montant Facturé</th>
                        <th style={{ padding: '12px' }}>Montant Versé</th>
                        <th style={{ padding: '12px' }}>Statut</th>
                        <th style={{ padding: '12px', textAlign: 'center' }}>Reçu Officiel</th>
                      </tr>
                    </thead>
                    <tbody>
                      {invoices.length > 0 ? (
                        invoices.map((inv: any) => (
                          <tr key={inv.id} style={{ borderBottom: '1px solid #f1f5f9' }}>
                            <td style={{ padding: '12px', color: '#64748b', fontSize: '0.9rem' }}>
                              {inv.paid_at || inv.issue_date ? new Date(inv.paid_at || inv.issue_date).toLocaleDateString('fr-FR') : '-'}
                            </td>
                            <td style={{ padding: '12px', fontWeight: 600 }}>{inv.description || 'Frais de Scolarité'}</td>
                            <td style={{ padding: '12px', fontWeight: 'bold' }}>{formatNum(studentTuition || inv.amount)} F</td>
                            <td style={{ padding: '12px', color: '#10b981', fontWeight: 'bold' }}>{formatNum(inv.paid_amount || inv.amount)} F</td>
                            <td style={{ padding: '12px' }}>
                              <span className="badge" style={{ background: inv.status === 'Payée' ? '#d1fae5' : '#fef3c7', color: inv.status === 'Payée' ? '#047857' : '#b45309', padding: '4px 10px', borderRadius: '12px', fontSize: '0.82rem', fontWeight: 600 }}>
                                {inv.status}
                              </span>
                            </td>
                            <td style={{ padding: '12px', textAlign: 'center' }}>
                              <div style={{ display: 'inline-flex', gap: '6px' }}>
                                <button
                                  className="pill-tab-btn active"
                                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                                  onClick={() => {
                                    setReceiptModalInvoice(inv);
                                    setReceiptModalType('a4');
                                  }}
                                >
                                  📄 Reçu A4
                                </button>
                                <button
                                  className="pill-tab-btn inactive"
                                  style={{ fontSize: '0.78rem', padding: '4px 10px' }}
                                  onClick={() => {
                                    setReceiptModalInvoice(inv);
                                    setReceiptModalType('ticket');
                                  }}
                                >
                                  🧾 Ticket
                                </button>
                              </div>
                            </td>
                          </tr>
                        ))
                      ) : (
                        <tr>
                          <td colSpan={6} style={{ textAlign: 'center', padding: '24px', color: '#64748b' }}>
                            Aucune facture ou reçu disponible pour le moment.
                          </td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          );
        })()}

        {/* Modal Reçu A4 */}
        {receiptModalInvoice && receiptModalType === 'a4' && (
          <div className="receipt-modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div className="receipt-modal-card" style={{ background: 'white', borderRadius: '12px', padding: '20px', maxWidth: '850px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="hide-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="pill-tab-btn active hide-print" onClick={() => window.print()}>🖨️ Imprimer</button>
                <button className="pill-tab-btn inactive hide-print" onClick={() => { setReceiptModalInvoice(null); setReceiptModalType(null); }}>✕ Fermer</button>
              </div>
              <ReceiptPreview 
                invoice={receiptModalInvoice}
                student={activeStudent}
                invoicesData={invoices}
                schoolInfo={settings}
                studentReste={(() => {
                  const total = Number(activeStudent?.tuition_fee) || (activeStudent?.affecte === 'Affecté' ? Number(activeStudent?.classes?.tuition_fee_affecte) : Number(activeStudent?.classes?.tuition_fee)) || 0;
                  const paye = invoices.filter((inv: any) => inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
                  return Math.max(0, total - paye);
                })()}
                onClose={() => { setReceiptModalInvoice(null); setReceiptModalType(null); }}
              />
            </div>
          </div>
        )}

        {/* Modal Reçu Ticket */}
        {receiptModalInvoice && receiptModalType === 'ticket' && (
          <div className="receipt-modal-wrapper" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(0,0,0,0.7)', zIndex: 9999, display: 'flex', justifyContent: 'center', alignItems: 'center', padding: '20px' }}>
            <div className="receipt-modal-card" style={{ background: 'white', borderRadius: '12px', padding: '20px', maxWidth: '400px', width: '100%', maxHeight: '90vh', overflowY: 'auto' }}>
              <div className="hide-print" style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '16px' }}>
                <button className="pill-tab-btn active hide-print" onClick={() => window.print()}>🖨️ Imprimer</button>
                <button className="pill-tab-btn inactive hide-print" onClick={() => { setReceiptModalInvoice(null); setReceiptModalType(null); }}>✕ Fermer</button>
              </div>
              <SmallReceiptPreview 
                invoice={receiptModalInvoice}
                student={activeStudent}
                invoicesData={invoices}
                schoolInfo={settings}
                studentReste={(() => {
                  const total = Number(activeStudent?.tuition_fee) || (activeStudent?.affecte === 'Affecté' ? Number(activeStudent?.classes?.tuition_fee_affecte) : Number(activeStudent?.classes?.tuition_fee)) || 0;
                  const paye = invoices.filter((inv: any) => inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
                  return Math.max(0, total - paye);
                })()}
                onClose={() => { setReceiptModalInvoice(null); setReceiptModalType(null); }}
              />
            </div>
          </div>
        )}

        <style dangerouslySetInnerHTML={{__html: `
          @media print {
            .portal-sidebar, .portal-brand, .portal-menu, .portal-user-footer, .portal-header-block, .pill-tabs-row, .hide-print, .pill-tab-btn {
              display: none !important;
            }
            .portal-wrapper, .portal-content {
              padding: 0 !important;
              margin: 0 !important;
              background: white !important;
            }
            .receipt-modal-wrapper {
              position: static !important;
              width: 100% !important;
              height: auto !important;
              background: transparent !important;
              padding: 0 !important;
            }
            .receipt-modal-card {
              max-width: 100% !important;
              max-height: none !important;
              box-shadow: none !important;
              padding: 0 !important;
              border: none !important;
            }
          }
        `}} />

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
