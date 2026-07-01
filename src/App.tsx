import React, { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import { LandingPage } from './components/LandingPage';
import Auth from './components/Auth';
import { SuperAdminAuth } from './components/SuperAdminAuth';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import CommitteePortal from './components/CommitteePortal';
import { BulletinPreview } from './components/BulletinPreview';
import { ReceiptPreview } from './components/ReceiptPreview';
import { TeacherReceiptPreview } from './components/TeacherReceiptPreview';
import { ExpenseReceiptPreview } from './components/ExpenseReceiptPreview';
import { SalaryReceiptPreview } from './components/SalaryReceiptPreview';
import { SuperAdminPortal } from './components/SuperAdminPortal';
import { PasswordRecovery } from './components/PasswordRecovery';
import { UserSupportModal } from './components/UserSupportModal';
import { QuickStartGuideModal } from './components/QuickStartGuideModal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

// Custom SVG Icons
// ...
const Icons = {
  Menu: () => <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>,
  Home: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" /></svg>,
  Users: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  BookOpen: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  Calendar: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  MessageSquare: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Settings: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  ChevronDown: ({ style }: { style?: React.CSSProperties }) => <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: 20, height: 20, ...style}}><polyline points="6 9 12 15 18 9"></polyline></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Activity: () => <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  UserPlus: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round"/><line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  CheckCircle: () => <svg className="stat-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  RefreshCw: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="23 4 23 10 17 10"></polyline><polyline points="1 20 1 14 7 14"></polyline><path d="M3.51 9a9 9 0 0 1 14.85-3.36L23 10M1 14l4.64 4.36A9 9 0 0 0 20.49 15"></path></svg>,
  FileText: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" /><polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  Briefcase: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="2" y="7" width="20" height="14" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 21V5a2 2 0 0 0-2-2h-4a2 2 0 0 0-2 2v16" /></svg>,
  Download: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="7 10 12 15 17 10" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="15" x2="12" y2="3" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Shield: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>,
  Database: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><ellipse cx="12" cy="5" rx="9" ry="3"/><path d="M21 12c0 1.66-4 3-9 3s-9-1.34-9-3"/><path d="M3 5v14c0 1.66 4 3 9 3s9-1.34 9-3V5"/></svg>,
  X: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="18" y1="6" x2="6" y2="18" /><line x1="6" y1="6" x2="18" y2="18" /></svg>,
  Mail: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M4 4h16c1.1 0 2 .9 2 2v12c0 1.1-.9 2-2 2H4c-1.1 0-2-.9-2-2V6c0-1.1.9-2 2-2z"/><polyline points="22,6 12,13 2,6"/></svg>,
  LogOut: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7"/><line strokeLinecap="round" strokeLinejoin="round" x1="21" y1="12" x2="9" y2="12"/></svg>,
  GraduationCap: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Heart: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  CreditCard: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  TrendingUp: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  TrendingDown: () => <svg className="stat-icon" style={{color: 'var(--danger-color, #ef4444)', background: 'rgba(239, 68, 68, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 18 13.5 8.5 8.5 13.5 1 6" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 18 23 18 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Printer: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="6 9 6 2 18 2 18 9"></polyline><path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path><rect x="6" y="14" width="12" height="8"></rect></svg>,
  Trash2: ({ size = 20 }: { size?: number }) => <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path><line x1="10" y1="11" x2="10" y2="17"></line><line x1="14" y1="11" x2="14" y2="17"></line></svg>
};

function App() {
  const [currentView, setCurrentView] = useState<'landing' | 'app'>('landing');
  const { t, i18n } = useTranslation();
  const [session, setSession] = useState<Session | null>(null);
  const [studentSession, setStudentSession] = useState<any>(() => {
    const saved = localStorage.getItem('sges_student');
    return saved ? JSON.parse(saved) : null;
  });
  const [teacherSession, setTeacherSession] = useState<any>(() => {
    const saved = localStorage.getItem('sges_teacher');
    return saved ? JSON.parse(saved) : null;
  });

  const [committeeSession, setCommitteeSession] = useState<any>(() => {
    const saved = localStorage.getItem('sges_committee_session');
    return saved ? JSON.parse(saved) : null;
  });
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sges_tab') || 'dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [selectedTeacherPayment, setSelectedTeacherPayment] = useState<any>(null);
  const [isSupportModalOpen, setIsSupportModalOpen] = useState(false);
  const [isQuickStartModalOpen, setIsQuickStartModalOpen] = useState(false);
  // unused honorStudentData
  const [adminSchools, setAdminSchools] = useState<any[]>([]);
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [showSchoolModal, setShowSchoolModal] = useState<boolean>(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentSchoolPlan, setCurrentSchoolPlan] = useState<string>('Standard');
  // unused currentSchoolEndDate
  const [currentAdminRole, setCurrentAdminRole] = useState<string>('Director');
  const [inviteEmail, setInviteEmail] = useState('');
  const [inviteRole, setInviteRole] = useState('Secretary');
  const [invitedAdmins, setInvitedAdmins] = useState<any[]>([]);
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassFilter, setSelectedClassFilter] = useState('all');
  const [selectedStatusFilter, setSelectedStatusFilter] = useState('Inscrit');
  const [invoiceSearchQuery, setInvoiceSearchQuery] = useState('');
  const [financeStatusFilter, setFinanceStatusFilter] = useState('all');
  const [financeClassFilter, setFinanceClassFilter] = useState('all');
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<string>('');
  
  const [activeDossierTab, setActiveDossierTab] = useState<'infos' | 'documents' | 'finances'>('infos');
  const [studentDocumentsData, setStudentDocumentsData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedClassForGrades, setSelectedClassForGrades] = useState<string>('');
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState<string>('');
  const [selectedPeriodForGrades, setSelectedPeriodForGrades] = useState<string>('1er Trimestre');
  const [evaluationsData, setEvaluationsData] = useState<any[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<any>(null);
  const [globalGradeClassId, setGlobalGradeClassId] = useState<string | null>(null);
  const [globalGradePeriod, setGlobalGradePeriod] = useState<string>('1er Trimestre');
  // unused reinscriptionAverage
  const [globalGrades, setGlobalGrades] = useState<{[key: string]: string}>({});
  const [bulletinClassId, setBulletinClassId] = useState<string | null>(null);
  const [bulletinTargetStudentId, setBulletinTargetStudentId] = useState<string | null>(null);
  const [bulletinPeriod, setBulletinPeriod] = useState<string>('1er Trimestre');
  const [activeBulletinPeriod, setActiveBulletinPeriod] = useState<string>('1er Trimestre');

  const [bulletinGrades, setBulletinGrades] = useState<any[]>([]);

  const [classSubjectsData, setClassSubjectsData] = useState<any[]>([]);
  const [customSubjects, setCustomSubjects] = useState<string[]>([]);
  const fetchClassSubjects = async () => {
    if (!currentSchoolId) return;
    const { data } = await supabase.from('class_subjects').select('*').eq('school_id', currentSchoolId);
    if (data) setClassSubjectsData(data);
  };
  useEffect(() => {
    if (currentSchoolId) {
      fetchClassSubjects();
    }
  }, [currentSchoolId]);
  
  const handleSaveCoefficients = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const class_id = bulletinClassId;
    
    const standardSubjects = allSubjects;
    
    const upserts = [];
    for (const subj of standardSubjects) {
      const coefStr = formData.get('coef_' + subj) as string;
      if (coefStr) {
        const coef = parseFloat(coefStr);
        if (!isNaN(coef)) {
          upserts.push({
            class_id,
            school_id: currentSchoolId,
            subject: subj,
            coefficient: coef
          });
        }
      }
    }
    
    if (upserts.length > 0) {
      // Upsert using the unique constraint (class_id, subject)
      const { error } = await supabase.from('class_subjects').upsert(upserts, { onConflict: 'class_id, subject' });
      if (error) {
        alert("Erreur lors de l'enregistrement des coefficients");
        console.error(error);
      } else {
        alert("Coefficients enregistrés avec succès !");
        fetchClassSubjects();
        closeModal();
      }
    } else {
      closeModal();
    }
  };

  
  const loadBulletinData = async (classId: string, period: string, studentId: string | null = null) => {
    setBulletinClassId(classId);
    setBulletinPeriod(period);
    setBulletinTargetStudentId(studentId);
    setActiveModal('bulletin_preview');
    const evals = evaluationsData.filter(e => e.class_id === classId && e.period === period);
    const evalIds = evals.map(e => e.id);
    if(evalIds.length > 0) {
      const { data } = await supabase.from('grades').select('*').in('evaluation_id', evalIds);
      if(data) setBulletinGrades(data);
    } else {
      setBulletinGrades([]);
    }
  };


  const [gradesInput, setGradesInput] = useState<Record<string, {score: string, comment: string}>>({});

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [committeeMembers, setCommitteeMembers] = useState<any[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [expensesData, setExpensesData] = useState<any[]>([]);
  const [loansData, setLoansData] = useState<any[]>([]);
  const [teacherPaymentsData, setTeacherPaymentsData] = useState<any[]>([]);
  const [employeePaymentsData, setEmployeePaymentsData] = useState<any[]>([]);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [absencesData, setAbsencesData] = useState<any[]>([]);
  const [schedulesData, setSchedulesData] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any | null>(null);
  const [editEntity, setEditEntity] = useState<any>(null);
  const [selectedInvoice, setSelectedInvoice] = useState<any>(null);
  const [preselectedStudentId, setPreselectedStudentId] = useState<string | null>(null);
  const [expandedClassId, setExpandedClassId] = useState<string | null>(null);
  const [parentsData, setParentsData] = useState<any[]>([]);
  const [showSuperAdmin, setShowSuperAdmin] = useState(() => localStorage.getItem('sges_super_admin_mode') === 'true');
  const [isSuperAdminFlow, setIsSuperAdminFlow] = useState(false);
  const [recoveryMode, setRecoveryMode] = useState(false);
  const fetchParents = async () => {
    const { data } = await supabase.from('parents').select('*, student_parents(student_id, parent_id, students(id, first_name, last_name))').eq('school_id', currentSchoolId || '');
    if (data) setParentsData(data);
  };

  useEffect(() => {
    if (session && isSuperAdminFlow) {
      const SUPER_ADMIN_EMAILS = ['konedamaa@gmail.com'];
      if (SUPER_ADMIN_EMAILS.includes(session.user?.email || '')) {
        setShowSuperAdmin(true);
        localStorage.setItem('sges_super_admin_mode', 'true');
      } else {
        alert("Accès non autorisé : cet e-mail n'est pas un administrateur SaaS.");
        supabase.auth.signOut();
      }
      setIsSuperAdminFlow(false);
    }
  }, [session, isSuperAdminFlow]);

  const handleRemoveChild = async (studentId: string, parentId: string) => {
    if (window.confirm("Voulez-vous vraiment retirer cet enfant de ce parent ?")) {
      try {
        const { error } = await supabase.from('student_parents').delete().match({ student_id: studentId, parent_id: parentId });
        if (error) throw error;
        fetchParents();
        if (editEntity && editEntity.id === parentId) {
           setEditEntity({
             ...editEntity,
             student_parents: editEntity.student_parents.filter((sp: any) => sp.student_id !== studentId)
           });
        }
      } catch (err) {
        console.error(err);
        alert("Erreur lors de la suppression.");
      }
    }
  };

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('ar') ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    const parsed = Number(num);
    if (isNaN(parsed)) return String(num);
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: true }).format(parsed);
  };

  useEffect(() => {
    document.documentElement.dir = i18n.language.startsWith('ar') ? 'rtl' : 'ltr';
    document.documentElement.lang = i18n.language;
  }, [i18n.language]);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
    });

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((event, session) => {
      setSession(session);
      if (event === 'PASSWORD_RECOVERY') {
        setRecoveryMode(true);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (studentSession) localStorage.setItem('sges_student', JSON.stringify(studentSession));
    else localStorage.removeItem('sges_student');
    
    if (teacherSession) localStorage.setItem('sges_teacher', JSON.stringify(teacherSession));
    else localStorage.removeItem('sges_teacher');

    if (committeeSession) localStorage.setItem('sges_committee_session', JSON.stringify(committeeSession));
    else localStorage.removeItem('sges_committee_session');
  }, [studentSession, teacherSession, committeeSession]);

  useEffect(() => {
    localStorage.setItem('sges_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (session) {
    }
  }, [session]);

  useEffect(() => {
    // Plan is loaded dynamically from loadSchools now
  }, [session]);

    useEffect(() => {
    if (session) {
      loadSchools();
    }
  }, [session]);

  const loadSchools = async () => {
    if (!session) return;
    
    const SUPER_ADMIN_EMAILS = ['konedamaa@gmail.com'];
    const isSuperAdmin = SUPER_ADMIN_EMAILS.includes(session.user?.email || '');

    const updateSchoolPlanState = (school: any) => {
      let plan = school?.subscription_plan || 'Standard';
      let endDate = school?.subscription_end_date || null;
      if (plan === 'Pro' && endDate && new Date(endDate) < new Date()) {
         plan = 'Standard';
      }
      setCurrentSchoolPlan(plan);
    };

    if (isSuperAdmin) {
      const { data: allSchools } = await supabase.from('schools').select('*').order('created_at', { ascending: false });
      if (allSchools && allSchools.length > 0) {
        setAdminSchools(allSchools);
        const activeSchoolId = currentSchoolId || allSchools[0].id;
        setCurrentSchoolId(activeSchoolId);
        updateSchoolPlanState(allSchools.find(s => s.id === activeSchoolId) || allSchools[0]);
        setCurrentAdminRole('Director'); // Super admin has director access
      }
    } else {
      const { data: adminLinks } = await supabase.from('school_admins').select('school_id, role, schools(*)').eq('user_id', session.user.id);
      if (adminLinks && adminLinks.length > 0) {
        const schools = adminLinks.map((link: any) => link.schools);
        setAdminSchools(schools);
        const activeSchoolId = currentSchoolId || schools[0].id;
        setCurrentSchoolId(activeSchoolId);
        updateSchoolPlanState(schools.find((s: any) => s.id === activeSchoolId) || schools[0]);
        
        // Find role for current school
        const activeLink = adminLinks.find((link: any) => link.school_id === activeSchoolId);
        setCurrentAdminRole(activeLink?.role || 'Director');
      } else {
        setShowSchoolModal(true);
      }
    }
  };

  useEffect(() => {
    if (currentSchoolId) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchCommitteeMembers();
      fetchEmployees();
      fetchParents();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    fetchExpenses();
      fetchLoans();
      fetchTeacherPayments();
      fetchEmployeePayments();
    }
  }, [currentSchoolId]);

  useEffect(() => {
    if (activeModal === 'studentDossier' && selectedStudent) {
      fetchStudentDocuments(selectedStudent.id);
    }
  }, [activeModal, selectedStudent]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select(`*, classes ( name, tuition_fee ), student_parents(parents(first_name, last_name))`).eq('school_id', currentSchoolId);
    if (data) setStudentsData(data);
  };
  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*').eq('school_id', currentSchoolId);
    if (data) setClassesData(data);
  };
  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*').eq('school_id', currentSchoolId);
    if (data) setTeachersData(data);
  };
  const fetchCommitteeMembers = async () => {
    const { data } = await supabase.from('committee_members').select('*').eq('school_id', currentSchoolId);
    if (data) setCommitteeMembers(data);
  };
  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*').eq('school_id', currentSchoolId);
    if (data) setEmployeesData(data);
  };
  const fetchInvoices = async () => {
    const { data } = await supabase.from('invoices').select(`*, students ( *, classes ( name ), student_parents ( parents ( first_name, last_name ) ) )`).eq('school_id', currentSchoolId);
    if (data) setInvoicesData(data);
  };
  const fetchAbsences = async () => {
    const { data } = await supabase.from('absences').select(`*, students ( first_name, last_name, classes(name) )`).eq('school_id', currentSchoolId);
    if (data) setAbsencesData(data);
  };
  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select(`*, classes(name), teachers(first_name, last_name)`).eq('school_id', currentSchoolId);
    if (data) setSchedulesData(data);
  };

  const handleDeleteSchedule = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce cours ?")) {
      const { error } = await supabase.from('schedules').delete().eq('id', id);
      if (!error) fetchSchedules();
      else alert("Erreur lors de la suppression.");
    }
  };

  const handleToggleTeacherStatus = async (id: string, currentStatus: string) => {
    try {
      const newStatus = currentStatus === 'Suspendu' ? 'Présent' : 'Suspendu';
      const { error } = await supabase.from('teachers').update({ status: newStatus }).eq('id', id);
      if (error) throw error;
      fetchTeachers();
    } catch (err) {
      console.error(err);
      alert("Erreur lors de la mise à jour du statut.");
    }
  };

  const loadAdminInvites = async () => {
    if (!currentSchoolId) return;
    const { data } = await supabase.from('admin_invitations').select('*').eq('school_id', currentSchoolId);
    if (data) setInvitedAdmins(data);
  };

  useEffect(() => {
    if (currentSchoolId && activeSettingsTab === 'security') {
      loadAdminInvites();
    }
  }, [currentSchoolId, activeSettingsTab]);

  const handleInviteAdmin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!inviteEmail || !currentSchoolId) return;
    
    const { error } = await supabase.from('admin_invitations').insert([{
      school_id: currentSchoolId,
      email: inviteEmail,
      role: inviteRole,
      invited_by: session?.user.id
    }]);
    
    if (!error) {
      alert(`Invitation envoyée à ${inviteEmail} avec le rôle ${inviteRole}`);
      setInviteEmail('');
      loadAdminInvites();
    } else {
      alert("Erreur lors de l'invitation");
    }
  };

  const handleDeleteStudent = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer cet élève ? (Cette action supprimera également ses factures, absences, notes, etc.)")) {
      try {
        // Delete related records to bypass foreign key constraints
        await supabase.from('student_parents').delete().eq('student_id', id);
        await supabase.from('invoices').delete().eq('student_id', id);
        await supabase.from('absences').delete().eq('student_id', id);
        await supabase.from('grades').delete().eq('student_id', id);
        await supabase.from('student_documents').delete().eq('student_id', id);
        
        const { error } = await supabase.from('students').delete().eq('id', id);
        if (error) throw error;
        
        fetchStudents();
      } catch (error: any) {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };

  const handleDeleteParent = async (id: string) => {
    if (window.confirm("Êtes-vous sûr de vouloir supprimer ce parent ?")) {
      try {
        await supabase.from('student_parents').delete().eq('parent_id', id);
        const { error } = await supabase.from('parents').delete().eq('id', id);
        if (error) throw error;
        
        fetchParents();
      } catch (error: any) {
        alert("Erreur lors de la suppression : " + error.message);
      }
    }
  };
  const fetchStudentDocuments = async (studentId: string) => {
    const { data } = await supabase.from('student_documents').select('*').eq('student_id', studentId);
    if (data) setStudentDocumentsData(data);
  };
  const fetchEvaluations = async () => {
    const { data } = await supabase.from('evaluations').select(`*, classes(name)`).eq('school_id', currentSchoolId);
    if (data) setEvaluationsData(data);
  };

  const handleDeleteEvaluation = async (evaluationId: string) => {
    if (window.confirm(t('admin.pedagogy.confirm_delete_eval', 'Êtes-vous sûr de vouloir supprimer cette évaluation ? Toutes les notes associées seront supprimées.'))) {
      try {
        const { error } = await supabase.from('evaluations').delete().eq('id', evaluationId);
        if (error) throw error;
        alert(t('admin.pedagogy.eval_deleted', 'Évaluation supprimée avec succès.'));
        fetchEvaluations();
      } catch (err: any) {
        console.error(err);
        alert("Erreur lors de la suppression : " + err.message);
      }
    }
  };
  const fetchTeacherPayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase.from('teacher_payments').select('*').eq('school_id', currentSchoolId).order('payment_date', { ascending: false });
      if (!error && data) setTeacherPaymentsData(data);
    } catch (err) { console.error('Error fetching teacher payments:', err); }
  };
  
  const fetchEmployeePayments = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase.from('employee_payments').select('*').eq('school_id', currentSchoolId).order('payment_date', { ascending: false });
      if (!error && data) setEmployeePaymentsData(data);
    } catch (err) { console.error('Error fetching employee payments:', err); }
  };

  
  const fetchLoans = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase
        .from('loans')
        .select('*')
        .eq('school_id', currentSchoolId)
        .order('loan_date', { ascending: false });
      if (error) throw error;
      setLoansData(data || []);
    } catch (err) {
      console.error('Error fetching loans:', err);
    }
  };

  const fetchExpenses = async () => {
    if (!currentSchoolId) return;
    try {
      const { data, error } = await supabase
        .from('expenses')
        .select('*')
        .eq('school_id', currentSchoolId)
        .order('payment_date', { ascending: false });

      if (error) throw error;
      setExpensesData(data || []);
    } catch (err: any) {
      console.error('Error fetching expenses:', err);
    }
  };

  const fetchSettings = async () => {
    const { data } = await supabase.from('school_settings').select('*').eq('school_id', currentSchoolId).single();
    if (data) setSettingsData(data);
  };

  const saveSettings = async (e: any) => {
    e.preventDefault();
    
    const formData = new FormData(e.target);
    
    const logoFile = formData.get('logo_file') as File;
    if (logoFile && logoFile.size > 0 && currentSchoolId) {
      if (logoFile.size > 2 * 1024 * 1024) {
        window.alert('Le logo est trop volumineux. Maximum 2 Mo.');
        return;
      }
      const fileExt = logoFile.name.split('.').pop();
      const fileName = `${currentSchoolId}-${Math.random()}.${fileExt}`;
      const { data: uploadData, error: uploadError } = await supabase.storage.from('logos').upload(fileName, logoFile);
      if (!uploadError && uploadData) {
         const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
         if (urlData) {
           await supabase.from('schools').update({ logo_url: urlData.publicUrl }).eq('id', currentSchoolId);
         }
      }
    }

    const settingsObj: any = {
      school_name: formData.get('school_name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      director_name: formData.get('director_name'),
      city: formData.get('city'),
      principal_name: formData.get('principal_name'),
      studies_director_name: formData.get('studies_director_name'),
    };
    if (currentSchoolId) settingsObj.school_id = currentSchoolId;
    
    let { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
    
    if (!existing) {
        const { data: orphaned } = await supabase.from('school_settings').select('id').is('school_id', null).maybeSingle();
        if (orphaned) {
            await supabase.from('school_settings').update({ school_id: currentSchoolId as string }).eq('id', orphaned.id);
            existing = orphaned;
        }
    }

    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj).eq('id', existing.id);
      error = err;
    } else {
      settingsObj.id = Math.floor(Math.random() * 1000000) + 1000;
      const { error: err } = await supabase.from('school_settings').insert([settingsObj]);
      error = err;
    }
    
    if (error) {
      alert("Erreur de sauvegarde: " + error.message);
    } else {
      alert("Paramètres sauvegardés avec succès !");
      fetchSettings();
    }
  };

  const closeModal = () => { setActiveModal(null); setPreselectedStudentId(null); setEditEntity(null); };

  const handleCreateSchool = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const schoolName = formData.get('name') as string;
    
    try {
      const { data: newSchool, error: schoolError } = await supabase.from('schools').insert([{ name: schoolName }]).select();
      if (schoolError) throw schoolError;
      
      const newSchoolId = newSchool[0].id;
      
      const { error: adminError } = await supabase.from('school_admins').insert([{
        user_id: session?.user.id,
        school_id: newSchoolId
      }]);
      if (adminError) throw adminError;
      
      setShowSchoolModal(false);
      loadSchools();
      alert("Établissement créé avec succès !");
    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  const handleEmployeePaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;
    const parsedAmount = parseFloat(amount);

    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                           (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);

    if (parsedAmount > currentBalance) {
      alert(`Fonds insuffisants dans la caisse. Solde disponible : ${currentBalance} F.`);
      return;
    }
    
    try {
      const { error } = await supabase.from('employee_payments').insert([{
        school_id: currentSchoolId,
        employee_id: editEntity.id,
        amount: parseFloat(amount),
        month,
        payment_method,
        payment_date: new Date().toISOString()
      }]);
      if (error) throw error;
      await fetchEmployeePayments();
      setActiveModal('employee_receipt_preview');
    } catch(err: any) {
      console.error('Error paying employee:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleTeacherPaymentSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId || !editEntity) return;
    const form = e.target as HTMLFormElement;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const month = (form.elements.namedItem('month') as HTMLInputElement).value;
    const payment_method = (form.elements.namedItem('payment_method') as HTMLSelectElement).value;
    const parsedAmount = parseFloat(amount);

    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                           (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);

    if (parsedAmount > currentBalance) {
      alert(`Fonds insuffisants dans la caisse. Solde disponible : ${currentBalance} F.`);
      return;
    }
    
    try {
      const { error } = await supabase.from('teacher_payments').insert([{
        school_id: currentSchoolId,
        teacher_id: editEntity.id,
        amount: parseFloat(amount),
        month,
        payment_method,
        payment_date: new Date().toISOString()
      }]);
      if (error) throw error;
      await fetchTeacherPayments();
      // Auto close and open receipt preview
      setActiveModal('teacher_receipt_preview');
    } catch(err: any) {
      console.error('Error paying teacher:', err);
      alert('Erreur: ' + err.message);
    }
  };


  const handleAddLoan = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId) return;
    const form = e.target as HTMLFormElement;
    const lender_name = (form.elements.namedItem('lender_name') as HTMLInputElement).value;
    const amount = parseFloat((form.elements.namedItem('amount') as HTMLInputElement).value);
    const loan_date = (form.elements.namedItem('loan_date') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;
    const status = (form.elements.namedItem('status') as HTMLSelectElement)?.value || 'Actif';

    try {
      if (editEntity) {
        const { error } = await supabase
          .from('loans')
          .update({ lender_name, amount, loan_date, description, status })
          .eq('id', editEntity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('loans')
          .insert([{ school_id: currentSchoolId, lender_name, amount, loan_date, description, status }]);
        if (error) throw error;
      }
      await fetchLoans();
      closeModal();
    } catch (err: any) {
      console.error('Error saving loan:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteLoan = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cet emprunt ?')) return;
    try {
      const { error } = await supabase.from('loans').delete().eq('id', id);
      if (error) throw error;
      await fetchLoans();
    } catch (err: any) {
      console.error('Error deleting loan:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleAddExpense = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!currentSchoolId) return;
    const form = e.target as HTMLFormElement;
    const category = (form.elements.namedItem('category') as HTMLSelectElement).value;
    const amount = (form.elements.namedItem('amount') as HTMLInputElement).value;
    const date = (form.elements.namedItem('date') as HTMLInputElement).value;
    const description = (form.elements.namedItem('description') as HTMLTextAreaElement).value;

    const parsedAmount = parseFloat(amount);

    // Calculate current available balance
    const currentBalance = (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                           (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                           (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0);

    const oldAmount = editEntity ? Number(editEntity.amount) : 0;
    if (parsedAmount > currentBalance + oldAmount) {
      alert(`Fonds insuffisants dans la caisse. Solde disponible : ${currentBalance + oldAmount} F.`);
      return;
    }

    try {
      if (editEntity) {
        const { error } = await supabase
          .from('expenses')
          .update({ category, amount: parsedAmount, payment_date: date, description })
          .eq('id', editEntity.id);
        if (error) throw error;
      } else {
        const { error } = await supabase
          .from('expenses')
          .insert([{ school_id: currentSchoolId, category, amount: parsedAmount, payment_date: date, description }]);
        if (error) throw error;
      }
      await fetchExpenses();
      closeModal();
    } catch (err: any) {
      console.error('Error saving expense:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleDeleteExpense = async (id: string) => {
    if (!confirm('Êtes-vous sûr de vouloir supprimer cette dépense ?')) return;
    try {
      const { error } = await supabase.from('expenses').delete().eq('id', id);
      if (error) throw error;
      await fetchExpenses();
    } catch (err: any) {
      console.error('Error deleting expense:', err);
      alert('Erreur: ' + err.message);
    }
  };

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    const submitBtn = e.nativeEvent?.submitter;
    if (submitBtn) {
      if (submitBtn.disabled) return;
      submitBtn.disabled = true;
      submitBtn.innerHTML = 'Patientez...';
    }
    const formData = new FormData(e.target);
    
    try {
      if (activeModal === 'class') {
        const className = formData.get('name') as string;
        const classLevel = formData.get('level') as string;
        if (!className) return;
        
        let error;
        const nextClassIdStr = formData.get('next_class_id') as string;
        const principalTeacherIdStr = formData.get('principal_teacher_id') as string;
        
        const payload = {
          name: className, 
          level: classLevel || 'Non défini', 
          tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : 0,
          next_class_id: nextClassIdStr ? nextClassIdStr : null,
          principal_teacher_id: principalTeacherIdStr ? principalTeacherIdStr : null
        };

        if (editEntity) {
          const { error: updateError } = await supabase.from('classes').update(payload).eq('id', editEntity.id);
          error = updateError;
        } else {
          const { error: insertError } = await supabase.from('classes').insert([{ 
            ...payload,
            school_id: currentSchoolId
          }]);
          error = insertError;
        }
        
        if (error) throw error;
        alert(editEntity ? "Classe modifiée avec succès !" : "Classe créée avec succès !");
        fetchClasses();
        closeModal();
        return;
      }

      
      if (activeModal === 'reinscription') {
        const studentUpdate = {
          class_id: formData.get('class_id'),
          status: 'Inscrit'
        };
        const { error: updateError } = await supabase.from('students').update(studentUpdate).eq('id', editEntity.id);
        if (updateError) throw updateError;

        let createdInvoice = null;
        const invoicePayload = {
          student_id: editEntity.id,
          amount: formData.get('reg_fee_amount'),
          motif: 'Frais de Réinscription',
          payment_method: formData.get('reg_fee_method'),
          status: formData.get('reg_fee_status'),
          invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
          school_id: currentSchoolId
        };
        
        if (formData.get('reg_fee_amount') !== null && formData.get('reg_fee_amount') !== '') {
          const { data: newInvoices } = await supabase.from('invoices').insert([invoicePayload]).select();
          if (newInvoices && newInvoices.length > 0) createdInvoice = newInvoices[0];
        }
        
        fetchStudents();
        if (formData.get('reg_fee_amount')) {
          fetchInvoices();
          const studentFull = studentsData.find(s => s.id === editEntity.id) || editEntity;
          setSelectedStudent(studentFull);
          setSelectedInvoice(createdInvoice || {...invoicePayload, id: 'temp-id', issue_date: new Date().toISOString()});
          setActiveModal('receipt_preview');
          return;
        } else {
          alert("Réinscription effectuée avec succès !");
          closeModal();
        }
        return;
      }

      if (activeModal === 'student') {
        let successMsg = "L'élève a été traité avec succès !";
        let photoUrl = editEntity?.photo_url || null;
        const photoFile = formData.get('photo') as File;
        
        if (photoFile && photoFile.size > 0) {
          const fileExt = photoFile.name.split('.').pop();
          const fileName = `${Date.now()}_${Math.random().toString(36).substring(7)}.${fileExt}`;
          const { error: uploadError } = await supabase.storage.from('photos_eleves').upload(fileName, photoFile);
          if (uploadError) {
            console.error("Erreur upload photo:", uploadError);
            alert("Erreur lors de l'upload de la photo");
            if (submitBtn) {
              submitBtn.disabled = false;
              submitBtn.innerHTML = 'Enregistrer';
            }
            return;
          }
          const { data: { publicUrl } } = supabase.storage.from('photos_eleves').getPublicUrl(fileName);
          photoUrl = publicUrl;
          successMsg += "\n📸 La photo a été ajoutée.";
        }

        if (editEntity) {
          const studentUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            class_id: formData.get('class_id'),
            birth_date: formData.get('birth_date'),
            status: formData.get('status') || 'Inscrit',
            tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null,
            photo_url: photoUrl
          };
          if (formData.get('matricule')) studentUpdate.matricule = formData.get('matricule');
          if (formData.get('password')) studentUpdate.password = formData.get('password');
          const { error } = await supabase.from('students').update(studentUpdate).eq('id', editEntity.id);
          if (error) throw error;
          alert("Mise à jour : " + successMsg);
          fetchStudents();
          closeModal();
          return;
        }
        const matricule = formData.get('matricule') || 'ELV' + new Date().getFullYear() + Math.floor(Math.random() * 10000);
        const password = formData.get('password') || 'passer123';
        const student = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          matricule: matricule,
          class_id: formData.get('class_id'),
          birth_date: formData.get('birth_date'),
          email: formData.get('email'),
          password: password,
          tuition_fee: formData.get('tuition_fee') ? parseInt(formData.get('tuition_fee') as string) : null,
          photo_url: photoUrl
        };
        const { data: studentData, error: studentError } = await supabase.from('students').insert([{...student, school_id: currentSchoolId}]).select();
        if (studentError) throw studentError;
        
        const newStudentId = studentData[0].id;

        let parentObj = null;
        if (formData.get('parent_first_name') && formData.get('parent_last_name')) {
          const parent = {
            first_name: formData.get('parent_first_name'),
            last_name: formData.get('parent_last_name'),
            phone: formData.get('parent_phone'),
            email: formData.get('parent_email'),
          };
          parentObj = parent;
          const { data: parentData, error: parentError } = await supabase.from('parents').insert([{...parent, school_id: currentSchoolId}]).select();
          if (!parentError && parentData && parentData.length > 0) {
            await supabase.from('student_parents').insert([{
              student_id: newStudentId,
              parent_id: parentData[0].id,
              relation_type: 'Parent'
            }]);
          }
        }

        let createdInvoice = null;
        const invoicePayload = {
          student_id: newStudentId,
          amount: formData.get('reg_fee_amount'),
          motif: 'Frais d\'inscription et Scolarité',
          payment_method: formData.get('reg_fee_method'),
          status: 'Payée',
          invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
          school_id: currentSchoolId
        };

        if (formData.get('reg_fee_amount') !== null && formData.get('reg_fee_amount') !== '') {
          const { data: newInvoices } = await supabase.from('invoices').insert([invoicePayload]).select();
          if (newInvoices && newInvoices.length > 0) createdInvoice = newInvoices[0];
        }

        fetchStudents();
        if (formData.get('reg_fee_amount') !== null && formData.get('reg_fee_amount') !== '') {
          fetchInvoices();
          setSelectedStudent({ ...student, id: newStudentId, student_parents: parentObj ? [{ parents: parentObj }] : [] });
          setSelectedInvoice(createdInvoice || {...invoicePayload, id: 'temp-id', issue_date: new Date().toISOString()});
          setActiveModal('receipt_preview');
          return;
        } else {
          alert("Inscription réussie ! L'élève, ses parents et ses frais ont été enregistrés.");
          closeModal();
        }
      } 
      else if (activeModal === 'teacher') {
        if (editEntity) {
          const teacherUpdate: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            subject: formData.get('subject'),
            phone: formData.get('phone'),
            email: formData.get('email')
          };
          if (formData.get('password')) teacherUpdate.password = formData.get('password');
          const { error } = await supabase.from('teachers').update(teacherUpdate).eq('id', editEntity.id);
          if (error) throw error;
          alert("Professeur mis à jour !");
          fetchTeachers();
          closeModal();
          return;
        }
        const teacherMatricule = 'PRF' + new Date().getFullYear() + Math.floor(Math.random() * 10000);
        const password = formData.get('password') || Math.random().toString(36).slice(-8);

        const teacher = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          subject: formData.get('subject'),
          phone: formData.get('phone'),
          email: formData.get('email'),
          matricule: teacherMatricule,
          password: password,
        };
        const { error } = await supabase.from('teachers').insert([{...teacher, school_id: currentSchoolId}]);
        if (error) throw error;
        alert(`Le professeur a été créé.\n\nEmail : ${teacher.email}\nMot de passe : ${password}\n\nVeuillez transmettre ces informations au professeur.`);
        fetchTeachers();
      }
      else if (activeModal === 'committee_member') {
        if (editEntity) {
          const updateData: any = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            email: formData.get('email')
          };
          if (formData.get('password')) updateData.password = formData.get('password');
          const { error } = await supabase.from('committee_members').update(updateData).eq('id', editEntity.id);
          if (error) throw error;
          alert("Membre mis à jour !");
          fetchCommitteeMembers();
          closeModal();
          return;
        }
        
        const password = formData.get('password') || Math.random().toString(36).slice(-8);
        const member = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          email: formData.get('email'),
          password: password,
        };
        const { error } = await supabase.from('committee_members').insert([{...member, school_id: currentSchoolId}]);
        if (error) throw error;
        alert(`Le membre du comité a été créé.\n\nEmail : ${member.email}\nMot de passe : ${password}\n\nVeuillez transmettre ces informations.`);
        fetchCommitteeMembers();
        closeModal();
      }
      else if (activeModal === 'employee') {
        const employee = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          role: formData.get('role'),
          phone: formData.get('phone'),
          email: formData.get('email'),
        };
        const { error } = await supabase.from('employees').insert([{...employee, school_id: currentSchoolId}]);
        if (error) throw error;
        fetchEmployees();
      }
      else if (activeModal === 'absence') {
        const absence = {
          student_id: formData.get('student_id'),
          absence_date: formData.get('absence_date'),
          duration: formData.get('duration'),
          motif: formData.get('motif'),
          comments: formData.get('comments'),
        };
        const { error } = await supabase.from('absences').insert([{...absence, school_id: currentSchoolId}]);
        if (error) throw error;
        fetchAbsences();
      }
      else if (activeModal === 'payment') {
        const studentId = formData.get('student_id') as string;
        const amount = Number(formData.get('amount')) || 0;

        if (amount <= 0) {
          alert("Erreur: Le montant doit être supérieur à 0.");
          return;
        }

        const student = studentsData.find((s: any) => s.id === studentId);
        if (student) {
            const studentInvoices = invoicesData.filter((inv: any) => inv.student_id === studentId);
            const studentPaye = studentInvoices.filter((inv: any) => inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
            const studentTotal = Number(student.tuition_fee) || Number(student.classes?.tuition_fee) || 0;
            const studentReste = Math.max(0, studentTotal - studentPaye);

            if (studentTotal > 0 && amount > studentReste) {
                alert(`Erreur : Le montant de ce versement (${amount} F) dépasse le Reste à solder de l'élève (${studentReste} F). Veuillez vérifier la somme.`);
                return;
            }
        }

        const invoice = {
          student_id: studentId,
          amount: amount,
          motif: formData.get('motif'),
          payment_method: formData.get('payment_method'),
          status: 'Payée',
          invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
        };
        const { data: newInvoice, error } = await supabase.from('invoices').insert([{...invoice, school_id: currentSchoolId}]).select();
        if (error) throw error;
        
        // Remove the alert so the receipt opens immediately and smoothly
        fetchInvoices();
        
        const studentForReceipt = studentsData.find((s: any) => s.id === studentId);
        if (studentForReceipt) {
          setSelectedStudent(studentForReceipt);
        }
        
        if (newInvoice && newInvoice.length > 0) {
          setSelectedInvoice(newInvoice[0]);
        } else {
          // Fallback if .select() doesn't return the row due to some RLS quirk
          setSelectedInvoice({...invoice, id: 'temp-id', issue_date: new Date().toISOString()});
        }
        
        setActiveModal('receipt_preview');
        return;
      }
      else if (activeModal === 'schedule') {
        const schedule = {
          class_id: formData.get('class_id'),
          subject: formData.get('subject'),
          teacher_id: formData.get('teacher_id') || null,
          day_of_week: formData.get('day_of_week'),
          start_time: formData.get('start_time'),
          end_time: formData.get('end_time'),
        };

        // Check for overlapping schedule (same class, day, and time)
        const { data: overlaps } = await supabase.from('schedules')
          .select('id')
          .eq('class_id', schedule.class_id)
          .eq('day_of_week', schedule.day_of_week)
          .eq('start_time', schedule.start_time)
          .eq('school_id', currentSchoolId);
          
        if (overlaps && overlaps.length > 0) {
          alert("Erreur : Un cours existe déjà à cette heure précise pour cette classe le " + schedule.day_of_week + " !");
          return;
        }

        const { error } = await supabase.from('schedules').insert([{...schedule, school_id: currentSchoolId}]);
        if (error) throw error;
        fetchSchedules();
      }
      else if (activeModal === 'evaluation') {
        const evaluation = {
          class_id: formData.get('class_id'),
          subject: formData.get('subject'),
          period: formData.get('period'),
          name: formData.get('name'),
          type: formData.get('type'),
          date: formData.get('date'),
          max_score: formData.get('max_score') || 20,
        };
        const { error } = await supabase.from('evaluations').insert([{...evaluation, school_id: currentSchoolId}]);
        if (error) throw error;
        fetchEvaluations();
      }
      else if (activeModal === 'bulletin') {
        alert("Génération terminée ! Le document va être téléchargé.");
        const blob = new Blob(["----- BULLETINS ${settingsData?.school_name?.toUpperCase() || 'ÉTABLISSEMENT'} -----\n\nClasse : " + formData.get('classe') + "\nPériode : " + formData.get('trimestre') + "\n\nCeci est un document généré automatiquement pour tous les élèves de la classe.\n[Signature: Direction]"], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletins_${formData.get('classe')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      else if (activeModal === 'message') {
        alert("Le message a été envoyé avec succès !");
      }
      else if (activeModal === 'parent') {
        if (editEntity) {
          const parentUpdate = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            phone: formData.get('phone'),
            email: formData.get('email')
          };
          const { error } = await supabase.from('parents').update(parentUpdate).eq('id', editEntity.id);
          if (error) throw error;
          alert("Parent mis à jour avec succès !");
        } else {
          const parent = {
            first_name: formData.get('first_name'),
            last_name: formData.get('last_name'),
            phone: formData.get('phone'),
            email: formData.get('email'),
            school_id: currentSchoolId
          };
          const { error } = await supabase.from('parents').insert([parent]);
          if (error) throw error;
          alert("Le parent a été ajouté avec succès !");
        }
        fetchParents();
      }
      
      closeModal();
    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent) return;
    
    const formData = new FormData(e.currentTarget);
    const file = formData.get('file') as File;
    const documentType = formData.get('document_type') as string;
    const documentName = formData.get('document_name') as string;

    if (!file || file.size === 0) {
      alert("Veuillez sélectionner un fichier.");
      return;
    }

    try {
      setIsUploading(true);
      const fileExt = file.name.split('.').pop();
      const fileName = `${selectedStudent.id}/${Date.now()}.${fileExt}`;

      // Upload to Supabase Storage
      const { error: uploadError } = await supabase.storage
        .from('student-documents')
        .upload(fileName, file);

      if (uploadError) throw uploadError;

      // Get public URL
      const { data: { publicUrl } } = supabase.storage
        .from('student-documents')
        .getPublicUrl(fileName);

      // Save to database
      const { error: dbError } = await supabase.from('student_documents').insert([{
        student_id: selectedStudent.id,
        document_type: documentType,
        document_name: documentName,
        file_path: publicUrl
      }]);

      if (dbError) throw dbError;

      // Refresh list
      fetchStudentDocuments(selectedStudent.id);
      (e.target as HTMLFormElement).reset();
      
    } catch (error: any) {
      alert("Erreur lors de l'upload: " + error.message);
    } finally {
      setIsUploading(false);
    }
  };

  const deleteDocument = async (id: string, filePath: string) => {
    if (!window.confirm("Êtes-vous sûr de vouloir supprimer ce document ?")) return;
    try {
      const pathParts = filePath.split('student-documents/');
      if (pathParts.length > 1) {
        const storagePath = pathParts[1];
        await supabase.storage.from('student-documents').remove([storagePath]);
      }
      
      const { error } = await supabase.from('student_documents').delete().eq('id', id);
      if (error) throw error;
      
      if (selectedStudent) fetchStudentDocuments(selectedStudent.id);
    } catch (error: any) {
      alert("Erreur lors de la suppression: " + error.message);
    }
  };

  const getAutoAppreciation = (score: number, maxScore: number) => {
    const ratio = score / maxScore;
    if (ratio >= 0.9) return "Excellent travail";
    if (ratio >= 0.8) return "Très bien";
    if (ratio >= 0.7) return "Bien";
    if (ratio >= 0.6) return "Assez bien";
    if (ratio >= 0.5) return "Passable";
    if (ratio >= 0.4) return "Insuffisant";
    return "Peut mieux faire";
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: string, maxScore: number = 20) => {
    setGradesInput(prev => {
      const current = prev[studentId] || { score: '', comment: '' };
      let newComment = current.comment;
      
      if (field === 'score' && value !== '') {
        const numVal = parseFloat(value);
        if (!isNaN(numVal)) {
          newComment = getAutoAppreciation(numVal, maxScore);
        }
      }

      return {
        ...prev,
        [studentId]: {
          ...current,
          [field]: value,
          comment: field === 'score' && value !== '' ? newComment : (field === 'comment' ? value : current.comment)
        }
      };
    });
  };

  const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>, currentIndex: number) => {
    if (e.key === 'Enter' || e.key === 'ArrowDown') {
      e.preventDefault();
      const nextInput = document.getElementById(`grade-input-${currentIndex + 1}`);
      if (nextInput) nextInput.focus();
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      const prevInput = document.getElementById(`grade-input-${currentIndex - 1}`);
      if (prevInput) prevInput.focus();
    }
  };

  const saveGrades = async () => {
    if (!activeEvaluation) return;
    try {
      const gradesToUpsert = Object.entries(gradesInput).map(([studentId, data]) => {
        return {
          evaluation_id: activeEvaluation.id,
          student_id: studentId,
          score: data.score ? parseFloat(data.score) : null,
          comment: data.comment || ''
        };
      });

      if (gradesToUpsert.length === 0) {
        alert("Aucune note à sauvegarder.");
        return;
      }

      const { error } = await supabase.from('grades').upsert(gradesToUpsert, { onConflict: 'evaluation_id,student_id' });
      if (error) throw error;

      alert("Notes sauvegardées avec succès !");
      setActiveEvaluation(null); // Back to evaluations list
      setGradesInput({});
    } catch (error: any) {
      alert("Erreur lors de la sauvegarde : " + error.message);
    }
  };

  const startGrading = async (evaluation: any) => {
    setActiveEvaluation(evaluation);
    // Fetch existing grades for this evaluation
    const { data: existingGrades } = await supabase.from('grades').select('*').eq('evaluation_id', evaluation.id);
    if (existingGrades) {
      const initialGrades: Record<string, {score: string, comment: string}> = {};
      existingGrades.forEach(g => {
        initialGrades[g.student_id] = {
          score: g.score !== null ? g.score.toString() : '',
          comment: g.comment || ''
        };
      });
      setGradesInput(initialGrades);
    }
  };

  
  const defaultSubjects = ["Mathématiques", "Français", "Anglais", "Histoire-Géographie", "Physique-Chimie", "SVT", "EPS", "Philosophie", "Informatique", "Espagnol", "Allemand", "Arts Plastiques", "Éducation Musicale"];
  const allSubjects = Array.from(new Set([
    ...defaultSubjects,
    ...customSubjects,
    ...classSubjectsData.map(cs => cs.subject),
    ...teachersData.flatMap(t => t.subject ? t.subject.split(',').map((s: string) => s.trim()) : [])
  ])).filter(Boolean).sort();
  
  const renderDashboard = () => {
    // Computing Dynamic Data
    const totalStudents = studentsData.length;
    const totalTeachers = teachersData.length;
    const totalClasses = classesData.length;
    const totalAbsences = absencesData.length;

    const handlePurgeFinances = async () => {
      if (!confirm('Êtes-vous sûr de vouloir PURGER toutes les données financières (Dépenses, Emprunts, Paiements, Factures) ? Cette action est irréversible.')) return;
      try {
        if (currentSchoolId) {
          await supabase.from('expenses').delete().eq('school_id', currentSchoolId);
          await supabase.from('loans').delete().eq('school_id', currentSchoolId);
          await supabase.from('teacher_payments').delete().eq('school_id', currentSchoolId);
          await supabase.from('employee_payments').delete().eq('school_id', currentSchoolId);
          await supabase.from('invoices').delete().eq('school_id', currentSchoolId);
          alert('Purge terminée ! La page va se recharger.');
          window.location.reload();
        }
      } catch(err: any) {
        alert('Erreur: ' + err.message);
      }
    };

    // Last 3 absences
    const recentAbsences = [...absencesData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
    
    // Upcoming evaluations
    const upcomingEvals = [...evaluationsData]
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);

    const classDistribution = classesData.map(cls => ({
      name: cls.name,
      value: studentsData.filter(s => s.class_id === cls.id).length
    })).filter(c => c.value > 0);

    const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884d8', '#82ca9d', '#ffc658'];

    return (
      <div className="animate-fade-in">


        <div className="page-header">
          <div>
            <h1 className="page-title">{t('dashboard.welcome', 'Bienvenue, {{name}} 👋', {name: session?.user?.email?.split('@')[0] || 'Adama'})}</h1>
            <p className="page-subtitle">{t('dashboard.overview', "Voici l'aperçu de votre établissement pour aujourd'hui.")}</p>
          </div>
          <div style={{display: 'flex', gap: '10px'}}>
            <button className="btn btn-danger" onClick={handlePurgeFinances} style={{backgroundColor: '#ef4444', color: 'white'}}>
              🗑️ PURGER FINANCES
            </button>
            <button className="btn btn-outline" onClick={() => {
              alert(t('dashboard.generating_report', "Génération du rapport en cours..."));
              const reportContent = t('dashboard.report_content', "----- RAPPORT GLOBAL ${settingsData?.school_name?.toUpperCase() || 'ÉTABLISSEMENT'} -----\n\nTotal Élèves: {{students}}\nProfesseurs: {{teachers}}\nClasses: {{classes}}\nAbsences Totales: {{absences}}\n\nCe rapport a été généré automatiquement.", {
              students: formatNum(totalStudents),
              teachers: formatNum(totalTeachers),
              classes: formatNum(totalClasses),
              absences: formatNum(totalAbsences)
            });
            const blob = new Blob([reportContent], { type: 'text/plain' });
            const url = URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.href = url;
            a.download = `rapport_global.txt`;
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
            URL.revokeObjectURL(url);
          }}>
            {t('dashboard.download_report', "Télécharger le rapport")}
          </button>
          </div>
        </div>

        {/* Dynamic Stats */}
      <div className="dashboard-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>Total Dépenses Courantes</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>🏦</div>
          <div className="stat-info">
            <h3>Total Emprunts</h3>
            <p className="stat-value">{formatNum(loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>
          <div className="stat-info">
            <h3>Salaires Payés</h3>
            <p className="stat-value">{formatNum(
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} F</p>
          </div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>💰</div>
          <div className="stat-info">
            <h3>Total Rentrées (Factures)</h3>
            <p className="stat-value">{formatNum(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-300">
          <div className="stat-icon" style={{backgroundColor: '#e0e7ff', color: '#6366f1'}}>🏦</div>
          <div className="stat-info">
            <h3>Solde Caisse (Rentabilité)</h3>
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
            </p>
          </div>
        </div>
      </div>
        <div className="stats-grid">
          <div className="stat-card delay-100" onClick={() => setActiveTab('students')} style={{cursor: 'pointer'}}>
            <div className="stat-header">
              <span className="stat-label">{t('dashboard.total_students', 'Total Élèves')}</span>
              <Icons.Users />
            </div>
            <div className="stat-value">{formatNum(totalStudents)}</div>
            <div className="stat-trend trend-up">{t('dashboard.real_time_update', 'Mise à jour en temps réel')}</div>
          </div>
          
          <div className="stat-card delay-200" onClick={() => setActiveTab('teachers')} style={{cursor: 'pointer'}}>
            <div className="stat-header">
              <span className="stat-label">{t('dashboard.teachers', 'Professeurs')}</span>
              <Icons.GraduationCap />
            </div>
            <div className="stat-value">{formatNum(totalTeachers)}</div>
            <div className="stat-trend trend-up">{t('dashboard.real_time_update', 'Mise à jour en temps réel')}</div>
          </div>

          <div className="stat-card delay-300" onClick={() => setActiveTab('absences')} style={{cursor: 'pointer'}}>
            <div className="stat-header">
              <span className="stat-label">{t('dashboard.recorded_absences', 'Absences Enregistrées')}</span>
              <Icons.Activity />
            </div>
            <div className="stat-value">{formatNum(totalAbsences)}</div>
            <div className="stat-trend trend-down">{t('dashboard.monitor_closely', 'À surveiller de près')}</div>
          </div>
          
          <div className="stat-card delay-300" onClick={() => setActiveTab('pedagogy')} style={{cursor: 'pointer'}}>
            <div className="stat-header">
              <span className="stat-label">{t('dashboard.active_classes', 'Classes Actives')}</span>
              <Icons.BookOpen />
            </div>
            <div className="stat-value">{formatNum(totalClasses)}</div>
            <div className="stat-trend trend-up">{t('dashboard.occupied_rooms', 'Salles occupées')}</div>
          </div>
        </div>

        {/* Grid Panels */}
        <div className="dashboard-grid">
          {/* Recent Activity (Absences) */}
          <div className="panel delay-200">
            <div className="panel-header">
              <h3 className="panel-title">{t('dashboard.recent_absences', 'Absences Récentes')}</h3>
              <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveTab('absences')}>{t('dashboard.see_all', 'Voir tout')}</button>
            </div>
            <div className="activity-list">
              {recentAbsences.length > 0 ? recentAbsences.map(abs => (
                <div className="activity-item" key={abs.id}>
                  <div className="activity-dot" style={{backgroundColor: abs.justified ? 'var(--primary-color)' : 'var(--warning-color)'}}></div>
                  <div className="activity-content">
                    <h4>{abs.students?.first_name} {abs.students?.last_name} ({abs.students?.classes?.name})</h4>
                    <p>{abs.reason || t('dashboard.no_reason_specified', "Aucun motif précisé")}</p>
                    <span className="activity-time">{new Date(abs.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')} - {abs.justified ? t('dashboard.justified', 'Justifiée') : t('dashboard.unjustified', 'Non justifiée')}</span>
                  </div>
                </div>
              )) : (
                <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0'}}>{t('dashboard.no_recent_absences', 'Aucune absence récente')}</div>
              )}
            </div>
          </div>

          {/* Upcoming Evaluations */}
          <div className="panel delay-300">
            <div className="panel-header">
              <h3 className="panel-title">{t('dashboard.upcoming_evaluations', 'Prochaines Évaluations')}</h3>
              <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveTab('grades')}>{t('dashboard.see_all', 'Voir tout')}</button>
            </div>
            <div className="activity-list">
              {upcomingEvals.length > 0 ? upcomingEvals.map(ev => (
                <div className="activity-item" key={ev.id}>
                  <div className="activity-dot" style={{backgroundColor: 'var(--accent-color)'}}></div>
                  <div className="activity-content">
                    <h4>{ev.name} - {ev.subject}</h4>
                    <p>{t('dashboard.class_label', 'Classe : {{name}} | {{period}}', {name: ev.classes?.name, period: ev.period})}</p>
                    <span className="activity-time">{t('dashboard.scheduled_on', 'Prévue le {{date}}', {date: new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')})}</span>
                  </div>
                </div>
              )) : (
                <div style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '24px 0'}}>{t('dashboard.no_upcoming_evaluations', 'Aucune évaluation prévue prochainement')}</div>
              )}
            </div>
          </div>
          
          {/* Chart */}
          <div className="panel delay-300" style={{gridColumn: '1 / -1'}}>
             <div className="panel-header">
              <h3 className="panel-title">{t('dashboard.student_distribution', 'Répartition des Élèves par Classe')}</h3>
            </div>
            <div style={{width: '100%', height: 300, marginTop: 16}}>
              {classDistribution.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={classDistribution}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} (${formatNum(((percent || 0) * 100).toFixed(0))}%)`}
                      outerRadius={100}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {classDistribution.map((_, index) => (
                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => formatNum(value as number)} />
                  </PieChart>
                </ResponsiveContainer>
              ) : (
                <div style={{color: 'var(--text-secondary)', textAlign: 'center', height: '100%', display: 'flex', alignItems: 'center', justifyContent: 'center'}}>{t('dashboard.no_data_available', 'Aucune donnée disponible')}</div>
              )}
            </div>
          </div>

        </div>
      </div>
    );
  };

  const renderStudents = () => {
    const filteredStudents = studentsData.filter(s => {
      const matchQuery = (s.first_name + ' ' + s.last_name + ' ' + s.matricule).toLowerCase().includes(searchQuery.toLowerCase());
      let matchClass = false;
      if (selectedClassFilter === 'all') matchClass = true;
      else if (selectedClassFilter === 'unassigned') matchClass = !s.class_id;
      else if (selectedClassFilter === 'assigned') matchClass = !!s.class_id;
      else matchClass = s.class_id === selectedClassFilter;
      const matchStatus = selectedStatusFilter === 'all' || (s.status || 'Inscrit') === selectedStatusFilter;
      return matchQuery && matchClass && matchStatus;
    });

    return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.students.title', 'Gestion des Élèves')}</h1>
          <p className="page-subtitle">{t('admin.students.subtitle', 'Annuaire complet, dossiers scolaires et suivi des absences.')}</p>
        </div>
        <div className="header-actions" style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-outline" onClick={() => setActiveModal('absence')} style={{color: 'var(--warning-color)', borderColor: 'var(--warning-color)'}}>
            <Icons.Activity /> {t('admin.students.btn_absence', 'Signaler Absence')}
          </button>
          <button className="btn btn-outline" onClick={() => setActiveModal('import')}><Icons.Download /> {t('admin.students.btn_import', 'Importer')}</button>
          <button className="btn btn-primary" onClick={() => {
            if (currentSchoolPlan === 'Standard' && studentsData.length >= 20) {
              if (window.confirm("Limite de la version Standard atteinte (20 élèves max).\n\nVoulez-vous contacter l'administrateur sur WhatsApp pour passer en version Pro ?")) {
                window.open("https://wa.me/2250505617743?text=" + encodeURIComponent("Bonjour, j'ai atteint la limite d'élèves sur mon établissement et je souhaite passer à la version Pro."), "_blank");
              }
              return;
            }
            setActiveModal('student');
          }}>
            <Icons.Plus /> {t('admin.students.btn_enroll', 'Inscrire')}
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">{t('admin.students.stat_total', 'Effectif Total')}</span>
            <Icons.Users />
          </div>
          <div className="stat-value">{formatNum(studentsData.length)}</div>
          <div className="stat-trend trend-up">{t('dashboard.real_time_update', 'Mise à jour en temps réel')}</div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.students.stat_unjustified', 'Absences Non Justifiées')}</span>
            <Icons.Activity />
          </div>
          <div className="stat-value">{formatNum(absencesData.length)}</div>
          <div className="stat-trend trend-down">{t('admin.students.alert_presence', 'Alerte : vérifier les présences')}</div>
        </div>
      </div>

      <div className="panel delay-300" id="student-list-panel">
        <div className="panel-header">
          <h3 className="panel-title student-print-title">{t('admin.students.panel_title', 'Annuaire des Élèves')}</h3>
          <div className="student-filters" style={{display: 'flex', gap: '12px', alignItems: 'center'}}>
            <button 
              className="btn btn-outline" 
              onClick={() => { document.body.classList.add('print-student-list'); window.print(); setTimeout(() => document.body.classList.remove('print-student-list'), 1000); }}
              title="Imprimer la liste"
              style={{padding: '8px 16px', display: 'flex', alignItems: 'center', gap: '8px'}}
            >
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimer
            </button>
            <select 
              className="form-select" 
              value={selectedStatusFilter} 
              onChange={(e) => setSelectedStatusFilter(e.target.value)}
              style={{width: '180px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px'}}
            >
              <option value="Inscrit">Actifs (Inscrits)</option>
              <option value="Ancien élève">Anciens élèves</option>
              <option value="Inactif">Inactifs</option>
              <option value="Renvoyé">Renvoyés</option>
              <option value="all">Tous les statuts</option>
            </select>
            <select 
              className="form-select" 
              value={selectedClassFilter} 
              onChange={(e) => setSelectedClassFilter(e.target.value)}
              style={{width: '200px', padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px'}}
            >
              <option value="all">Toutes les classes</option>
              <option value="unassigned">Non Affectés (Sans classe)</option>
              <option value="assigned">Affectés (Avec classe)</option>
              {classesData.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <div className="header-search" style={{width: 250}}>
              <Icons.Search />
              <input 
                type="text" 
                placeholder={t('admin.students.search_ph', 'Rechercher par nom, matricule...')} 
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>
      <div className="table-responsive">
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_matricule', 'Matricule')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_name', 'Nom & Prénom')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_class', 'Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.students.col_status', 'Statut')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.students.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {filteredStudents.length > 0 ? filteredStudents.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{row.matricule}</td>
                <td style={{padding: '16px 0', fontWeight: 600}}>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    {row.photo_url ? (
                      <img src={row.photo_url} alt="Photo" style={{width: '32px', height: '32px', borderRadius: '50%', objectFit: 'cover'}} />
                    ) : (
                      <div style={{width: '32px', height: '32px', borderRadius: '50%', backgroundColor: 'var(--border-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-secondary)'}}>
                        <Icons.Users />
                      </div>
                    )}
                    <div style={{cursor: 'pointer', color: 'var(--primary-color)'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>
                      {row.first_name} {row.last_name}
                    </div>
                  </div>
                </td>
                <td style={{padding: '16px 0'}}>{row.classes?.name || t('admin.students.unassigned', 'Non assigné')}</td>
                <td style={{padding: '16px 0'}}><span className={`badge ${row.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" title="Réinscrire" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={() => { 
                    const studentInvoices = invoicesData.filter(inv => inv.student_id === row.id);
                    const studentPaye = studentInvoices.filter(inv => inv.status === 'Payée').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
                    const studentTotal = Number(row.tuition_fee) || Number(row.classes?.tuition_fee) || 0;
                    const studentReste = Math.max(0, studentTotal - studentPaye);
                    if (studentReste > 0) {
                      alert(`Impossible de réinscrire cet élève. Il a un reste de scolarité non payé de ${studentReste} CFA. Veuillez d'abord solder sa scolarité.`);
                    } else {
                      setEditEntity(row); setActiveModal('reinscription'); 
                    }
                  }}><Icons.RefreshCw /></button>
                  <button className="btn btn-outline" title="Modifier" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('student'); }}>✏️</button>
                  <button className="btn btn-outline" title="Supprimer" style={{padding: '6px 12px', marginRight: '8px', color: 'var(--error-color)', borderColor: 'var(--error-color)'}} onClick={() => handleDeleteStudent(row.id)}>🗑️</button>
                  <button className="btn btn-outline" title="Emploi du temps" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { 
                    if(row.class_id) {
                      setSelectedClassForSchedule(row.class_id);
                      setActiveTab('schedules');
                    } else {
                      alert(t('admin.students.msg_no_class', "Cet élève n'est assigné à aucune classe."));
                    }
                  }}><Icons.Calendar /> Voir l'emploi du temps</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => { setSelectedStudent(row); setActiveModal('studentDossier'); }}>{t('admin.students.btn_dossier', 'Dossier')}</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)'}}>{t('admin.students.empty_state', 'Aucun élève trouvé.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
      </div>
    </div>
  )};

  const renderAbsences = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.absences.title', 'Gestion des Absences')}</h1>
          <p className="page-subtitle">{t('admin.absences.subtitle', 'Suivi des présences et justification des absences.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('absence')}>
          <Icons.Plus /> {t('admin.absences.btn_report', 'Signaler une Absence')}
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.absences.panel_title', 'Registre des Absences')}</h3>
          <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveModal('message')}>
            <Icons.Mail /> {t('admin.absences.btn_notify', 'Notifier les parents')}
          </button>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.absences.col_student', 'Élève')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.absences.col_class', 'Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.absences.col_motif', 'Motif / Justification')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.absences.col_date', 'Date/Durée')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.absences.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {absencesData.length > 0 ? absencesData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.students?.first_name} {row.students?.last_name}</td>
                <td style={{padding: '16px 0'}}>{row.students?.classes?.name || t('admin.students.unassigned', 'Non assigné')}</td>
                <td style={{padding: '16px 0'}}>
                  <span className="badge badge-warning">{row.motif}</span>
                </td>
                <td style={{padding: '16px 0', color: 'var(--text-secondary)'}}>{row.duration}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveModal('message')}>{t('admin.absences.btn_contact', 'Contacter Parent')}</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.absences.empty_state', 'Aucune absence enregistrée.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPedagogy = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.pedagogy.title', 'Classes & Pédagogie')}</h1>
          <p className="page-subtitle">{t('admin.pedagogy.subtitle', 'Suivi des cours, cahiers de textes et gestion des devoirs.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setActiveTab('schedules'); setActiveModal('schedule'); }}>
          <Icons.Plus /> {t('admin.pedagogy.btn_plan', 'Planifier un cours')}
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">{t('admin.pedagogy.stat_active', 'Classes Actives')}</span>
            <Icons.BookOpen />
          </div>
          <div className="stat-value">{formatNum(classesData.length)}</div>
          <div className="stat-trend trend-up">{t('admin.pedagogy.stat_active_desc', 'Toutes les classes')}</div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.pedagogy.stat_evals', 'Évaluations cette semaine')}</span>
            <Icons.FileText />
          </div>
          <div className="stat-value">{formatNum(evaluationsData?.length || 0)}</div>
          <div className="stat-trend trend-up">{t('admin.pedagogy.stat_evals_desc', 'Évaluations planifiées ou passées')}</div>
        </div>
      </div>

      <div className="panel delay-300" style={{marginBottom: '24px'}}>
        <div className="panel-header">
          <h3 className="panel-title">Gestion des Classes</h3>
          <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('class'); }}>
            <Icons.Plus /> {t('admin.pedagogy.btn_new_class', 'Nouvelle Classe')}
          </button>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Niveau</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Scolarité (F)</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {classesData && classesData.length > 0 ? classesData.map((cls) => (
              <tr key={cls.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{cls.name}</td>
                <td style={{padding: '16px 0'}}>{cls.level}</td>
                <td style={{padding: '16px 0'}}>{formatNum(cls.tuition_fee || 0)}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(cls); setActiveModal('class'); }}>
                    <Icons.Settings /> {t('admin.pedagogy.btn_edit', 'Modifier')}
                  </button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}} onClick={async () => {
                    if (window.confirm("Voulez-vous vraiment supprimer cette classe ? Cette action est irréversible et supprimera tous les liens avec les élèves !")) {
                      await supabase.from('classes').delete().eq('id', cls.id);
                      fetchClasses();
                    }
                  }}>
                    🗑️
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>Aucune classe enregistrée.</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel delay-400">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.pedagogy.panel_title', 'Prochaines Évaluations')}</h3>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.pedagogy.col_date', 'Date')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.pedagogy.col_subject', 'Matière')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.pedagogy.col_class', 'Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.pedagogy.col_teacher', 'Professeur')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.pedagogy.col_status', 'Statut')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {evaluationsData && evaluationsData.length > 0 ? evaluationsData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{new Date(row.date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                <td style={{padding: '16px 0'}}>{row.subject}</td>
                <td style={{padding: '16px 0', color: 'var(--text-secondary)'}}>{row.classes?.name || 'N/A'}</td>
                <td style={{padding: '16px 0'}}>{row.teachers?.first_name} {row.teachers?.last_name}</td>
                <td style={{padding: '16px 0'}}><span className={`badge badge-primary`}>{row.status || t('admin.pedagogy.planned', 'Planifié')}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDeleteEvaluation(row.id); }} style={{color: 'var(--danger-color)'}} title={t('admin.delete', 'Supprimer')}>
                    <Icons.Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.pedagogy.empty_state', 'Aucune évaluation enregistrée.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderPremiumOverlay = (title: string, description: string) => (
    <div className="animate-fade-in" style={{height: '100%', display: 'flex', flexDirection: 'column'}}>
      <div className="page-header">
        <div>
          <h1 className="page-title">{title}</h1>
          <p className="page-subtitle">Fonctionnalité Premium</p>
        </div>
      </div>
      <div style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', 
        flex: 1, padding: '40px', textAlign: 'center', background: 'var(--surface-color)', 
        borderRadius: '16px', border: '1px solid var(--border-color)'
      }}>
        <div style={{width: '64px', height: '64px', borderRadius: '16px', background: 'rgba(99, 102, 241, 0.1)', color: 'var(--primary-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '24px'}}>
          <svg width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect><path d="M7 11V7a5 5 0 0 1 10 0v4"></path></svg>
        </div>
        <h2 style={{fontSize: '1.5rem', marginBottom: '12px'}}>Passez à la vitesse supérieure</h2>
        <p style={{color: 'var(--text-secondary)', maxWidth: '400px', marginBottom: '32px', lineHeight: '1.5'}}>{description}</p>
        <button className="btn btn-primary" onClick={() => { setActiveTab('settings'); setActiveSettingsTab('abonnement'); }}>
          Découvrir le Plan Pro
        </button>
      </div>
    </div>
  );

  const renderCommunication = () => currentSchoolPlan !== 'Pro' ? renderPremiumOverlay(t('admin.communication.premium_title', "Communication"), t('admin.communication.premium_desc', "Envoyez des SMS, emails et notifications aux parents avec le plan Pro.")) : (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.communication.title', 'Communication ENT')}</h1>
          <p className="page-subtitle">{t('admin.communication.subtitle', 'Messagerie interne, annonces et liaison avec les familles.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('message')}>
          <Icons.Mail /> {t('admin.communication.btn_new', 'Nouveau Message')}
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="panel delay-100" style={{gridColumn: 'span 2'}}>
          <div className="panel-header">
            <h3 className="panel-title">{t('admin.communication.panel_title', 'Boîte de réception & Annonces')}</h3>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert('Tous les messages marqués comme lus.')}>{t('admin.communication.btn_read_all', 'Tout marquer comme lu')}</button>
            </div>
          </div>
          <div className="activity-list">
            <div style={{textAlign: 'center', padding: '40px', color: 'var(--text-secondary)'}}>
              <div style={{opacity: 0.2, marginBottom: '16px'}}><Icons.Mail /></div>
              <p>{t('admin.communication.msg_empty', 'Aucun message. Votre boîte de réception est vide.')}</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const loadGlobalGrades = async (classId: string, period: string) => {
    // 1. Fetch all evaluations for this class and period
    const allEvals = evaluationsData.filter(e => e.class_id === classId && e.period === period);
    const evalIds = allEvals.map(e => e.id);
    
    let allGrades: any[] = [];
    if(evalIds.length > 0) {
      const { data } = await supabase.from('grades').select('*').in('evaluation_id', evalIds);
      if(data) allGrades = data;
    }
    
    const initialGrades: any = {};
    const classStudents = studentsData.filter(s => s.class_id === classId);

    // 2. Calculate automatic averages from standard evaluations
    const standardEvals = allEvals.filter(e => e.type !== "Moyenne Globale");
    const uniqueSubjects = Array.from(new Set(standardEvals.map(e => e.subject)));
    
    classStudents.forEach(student => {
      uniqueSubjects.forEach(subject => {
        const subjEvals = standardEvals.filter(e => e.subject === subject);
        if (subjEvals.length > 0) {
          let totalScore = 0;
          let totalMax = 0;
          subjEvals.forEach(ev => {
            const g = allGrades.find(gr => gr.evaluation_id === ev.id && gr.student_id === student.id);
            if (g && g.score !== null) {
              totalScore += g.score;
              totalMax += ev.max_score || 20;
            }
          });
          if (totalMax > 0) {
            const avgSur20 = (totalScore / totalMax) * 20;
            initialGrades[`${student.id}_${subject}`] = avgSur20.toFixed(2);
          }
        }
      });
    });

    // 3. Override with any explicitly saved "Moyenne Globale"
    const globalEvals = allEvals.filter(e => e.type === "Moyenne Globale");
    globalEvals.forEach(ev => {
      allGrades.forEach(g => {
        if (g.evaluation_id === ev.id && g.score !== null) {
          initialGrades[`${g.student_id}_${ev.subject}`] = g.score.toString();
        }
      });
    });

    setGlobalGrades(initialGrades);
  };

  const saveGlobalGrades = async () => {
    try {
      // Check if school ID exists
      if (!currentSchoolId) {
         throw new Error("L'identifiant de l'école (school_id) est introuvable. Veuillez vous reconnecter.");
      }

      // Fetch existing evals from DB directly to avoid duplicates if local state is stale
      const { data: existingDbEvals } = await supabase
        .from('evaluations')
        .select('id, subject')
        .eq('class_id', globalGradeClassId)
        .eq('period', globalGradePeriod)
        .eq('type', 'Moyenne Globale')
        .eq('school_id', currentSchoolId);

      for(const subject of allSubjects) {
        let evId = existingDbEvals?.find(e => e.subject === subject)?.id || evaluationsData.find(e => e.class_id === globalGradeClassId && e.period === globalGradePeriod && e.type === "Moyenne Globale" && e.subject === subject)?.id;
        
        // Find if any grades exist for this subject
        const hasGrades = Object.keys(globalGrades).some(k => k.endsWith(`_${subject}`) && globalGrades[k] !== "");
        if(!hasGrades) continue; // skip if no grades for this subject

        if(!evId) {
          const { data, error } = await supabase.from('evaluations').insert([{
             class_id: globalGradeClassId,
             subject: subject,
             period: globalGradePeriod,
             name: "Moyenne Globale",
             type: "Moyenne Globale",
             date: new Date().toISOString().split('T')[0],
             max_score: 20,
             school_id: currentSchoolId
          }]).select();
          if(error) throw new Error("Erreur insertion évaluation " + subject + ": " + error.message);
          evId = data[0].id;
        }
        
        const gradesToUpsert = [];
        const studentsInClass = studentsData.filter(s => s.class_id === globalGradeClassId);
        for(const st of studentsInClass) {
          const val = globalGrades[`${st.id}_${subject}`];
          if(val !== undefined && val !== "") {
            const parsedVal = parseFloat(val.toString().replace(',', '.'));
            if (!isNaN(parsedVal)) {
              gradesToUpsert.push({
                evaluation_id: evId,
                student_id: st.id,
                score: parsedVal,
                school_id: currentSchoolId
              });
            }
          }
        }
        if(gradesToUpsert.length > 0) {
          const { error: gradeErr } = await supabase.from('grades').upsert(gradesToUpsert, { onConflict: 'evaluation_id,student_id' });
          if(gradeErr) throw new Error("Erreur upsert grades " + subject + ": " + gradeErr.message);
        }
      }
      alert("Notes globales enregistrées avec succès !");
      setActiveModal(null);
      fetchEvaluations();
      
    } catch(e: any) {
      console.error(e);
      alert("Erreur: " + e.message);
    }
  };

  const renderBulletins = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.bulletins.title', 'Gestion des Bulletins')}</h1>
          <p className="page-subtitle">{t('admin.bulletins.subtitle', 'Édition, calcul des moyennes et envois aux parents.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('bulletin')}>
          <Icons.Plus /> {t('admin.bulletins.btn_generate', 'Générer Bulletins')}
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.bulletins.panel_title', 'Trimestre en cours')}</h3>
          <select className="form-select" style={{width: '200px', marginLeft: 'auto'}} value={activeBulletinPeriod} onChange={(e) => setActiveBulletinPeriod(e.target.value)}>
            <option value="1er Trimestre">1er Trimestre (T1)</option>
            <option value="2ème Trimestre">2ème Trimestre (T2)</option>
            <option value="3ème Trimestre">3ème Trimestre (T3)</option>
            <option value="1er Semestre">1er Semestre (S1)</option>
            <option value="2ème Semestre">2ème Semestre (S2)</option>
          </select>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.bulletins.col_class', 'Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.bulletins.col_teacher', 'Prof. Principal')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.bulletins.col_avg', 'Moy. Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.bulletins.col_status', 'Statut')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.bulletins.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {classesData && classesData.length > 0 ? classesData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.name}</td>
                <td style={{padding: '16px 0'}}>{row.level}</td>
                <td style={{padding: '16px 0', fontWeight: 'bold'}}>-</td>
                <td style={{padding: '16px 0'}}><span className={`badge badge-warning`}>{t('admin.bulletins.status_pending', 'En attente')}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setActiveModal('global_grades'); setGlobalGradeClassId(row.id); setGlobalGradePeriod(activeBulletinPeriod); loadGlobalGrades(row.id, activeBulletinPeriod); }}><Icons.FileText /> {t('admin.bulletins.btn_global', 'Saisie Globale')}</button>
                   <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setBulletinClassId(row.id); setActiveModal('coefficients'); }}><Icons.Settings /> Coefficients</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => loadBulletinData(row.id, activeBulletinPeriod)}><Icons.FileText /> {t('admin.bulletins.btn_export', 'Aperçu Bulletins')}</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.bulletins.empty_state', 'Aucune classe trouvée.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderDepenses = () => (
    <div className="fade-in">
      {/* EMPRUNTS SECTION */}
      <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2 className="section-title">💼 Emprunts & Financements</h2>
          <p className="section-subtitle">Gérez les fonds prêtés par des banques ou organisations</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('loan'); }}>
          + Nouvel Emprunt
        </button>
      </div>

      <div className="panel" style={{marginBottom: '32px'}}>
        <h3 className="panel-title">Historique des Emprunts</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>Date</th>
                <th>Prêteur (Banque/Org.)</th>
                <th>Montant</th>
                <th>Motif</th>
                <th>Statut</th>
                <th style={{textAlign: 'right'}}>Actions</th>
              </tr>
            </thead>
            <tbody>
              {loansData && loansData.length > 0 ? loansData.map((loan: any) => (
                <tr key={loan.id}>
                  <td>{new Date(loan.loan_date).toLocaleDateString('fr-FR')}</td>
                  <td style={{fontWeight: 'bold'}}>{loan.lender_name}</td>
                  <td style={{fontWeight: 'bold', color: '#10b981'}}>+{formatNum(loan.amount)} F</td>
                  <td>{loan.description || '-'}</td>
                  <td>
                    <span className={`badge ${loan.status === 'Actif' ? 'badge-primary' : 'badge-success'}`}>{loan.status}</span>
                  </td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(loan); setActiveModal('loan'); }}>✏️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDeleteLoan(loan.id)}>🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={6} style={{textAlign: 'center', padding: '24px'}}>
                    Aucun emprunt enregistré
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
      {/* END EMPRUNTS SECTION */}
      <div className="section-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
        <div>
          <h2 className="section-title">📉 {t('admin.expenses.title', 'Dépenses')}</h2>
          <p className="section-subtitle">{t('admin.expenses.subtitle', 'Gérez les factures et sorties d\'argent de l\'établissement')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => { setEditEntity(null); setActiveModal('expense'); }}>
          ➕ {t('admin.expenses.add', 'Nouvelle Dépense')}
        </button>
      </div>

      
      <div className="dashboard-grid" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: '16px', marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fee2e2', color: '#ef4444'}}>💸</div>
          <div className="stat-info">
            <h3>{t('admin.expenses.total', 'Total Dépenses Courantes')}</h3>
            <p className="stat-value">{formatNum(expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#e0f2fe', color: '#0ea5e9'}}>🏦</div>
          <div className="stat-info">
            <h3>Total Emprunts</h3>
            <p className="stat-value">{formatNum(loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-100">
          <div className="stat-icon" style={{backgroundColor: '#fef3c7', color: '#f59e0b'}}>🧑‍🏫</div>
          <div className="stat-info">
            <h3>Salaires Payés</h3>
            <p className="stat-value">{formatNum(
              (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) +
              (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
            )} F</p>
          </div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-icon" style={{backgroundColor: '#d1fae5', color: '#10b981'}}>💰</div>
          <div className="stat-info">
            <h3>Total Rentrées (Factures)</h3>
            <p className="stat-value">{formatNum(invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0)} F</p>
          </div>
        </div>
        <div className="stat-card delay-300">
          <div className="stat-icon" style={{backgroundColor: '#e0e7ff', color: '#6366f1'}}>🏦</div>
          <div className="stat-info">
            <h3>Solde Caisse (Rentabilité)</h3>
            <p className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
              {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )} F
            </p>
          </div>
        </div>
      </div>

      <div className="panel delay-200">
        <h3 className="panel-title">{t('admin.expenses.list', 'Historique des Dépenses')}</h3>
        <div className="table-responsive">
          <table className="table">
            <thead>
              <tr>
                <th>{t('admin.expenses.date', 'Date')}</th>
                <th>{t('admin.expenses.category', 'Catégorie')}</th>
                <th>{t('admin.expenses.amount', 'Montant')}</th>
                <th>{t('admin.expenses.description', 'Description')}</th>
                <th style={{textAlign: 'right'}}>{t('common.actions', 'Actions')}</th>
              </tr>
            </thead>
            <tbody>
              {expensesData && expensesData.length > 0 ? expensesData.map((expense: any) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.payment_date).toLocaleDateString('fr-FR')}</td>
                  <td>
                    <span className="badge badge-warning">{expense.category}</span>
                  </td>
                  <td style={{fontWeight: 'bold'}}>{formatNum(expense.amount)} F</td>
                  <td>{expense.description || '-'}</td>
                  <td style={{textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} title="Imprimer le reçu" onClick={() => { setEditEntity(expense); setActiveModal('expense_receipt_preview'); }}>🖨️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', marginRight: '8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(expense); setActiveModal('expense'); }}>✏️</button>
                    <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem', color: '#ef4444', borderColor: '#ef4444'}} onClick={() => handleDeleteExpense(expense.id)}>🗑️</button>
                  </td>
                </tr>
              )) : (
                <tr>
                  <td colSpan={5} style={{textAlign: 'center', padding: '24px', color: 'var(--text-secondary)'}}>
                    {t('admin.expenses.empty', 'Aucune dépense enregistrée')}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );

  const renderRH = () => currentSchoolPlan !== 'Pro' ? renderPremiumOverlay(t('admin.rh.premium_title', "Ressources Humaines"), t('admin.rh.premium_desc', "Gérez les contrats, salaires et plannings de vos employés avec le plan Pro.")) : (
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
              <span style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginBottom: 12}}>{staff.role}</span>
              <span className={`badge ${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}`} style={{marginBottom: 12}}>{staff.status}</span>
              <div style={{display: 'flex', gap: '8px'}}>
                <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(staff); setActiveModal('employee'); }}>✏️</button>
                <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setEditEntity(staff); setActiveModal('employee_payment'); }}>💵 Payer</button>
              </div>
            </div>
          )) : (
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.rh.empty_state', 'Aucun employé trouvé. Cliquez sur Ajouter.')}</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.teachers.title', 'Enseignants')}</h1>
          <p className="page-subtitle">{t('admin.teachers.subtitle', 'Gestion du corps professoral, emplois du temps et affectations.')}</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-primary" onClick={() => setActiveModal('teacher')}>
            <Icons.Plus /> {t('admin.teachers.btn_add', 'Ajouter Enseignant')}
          </button>
          <button className="btn btn-outline" onClick={() => { setEditEntity(null); setActiveModal('committee_member'); }}>
            <Icons.Plus /> Ajouter Comité
          </button>
        </div>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.teachers.panel_title', 'Liste des Enseignants ({{count}})', { count: teachersData.length })}</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.teachers.search_ph', 'Rechercher par nom ou matière...')} />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.teachers.col_name', 'Nom & Prénom')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.teachers.col_subject', 'Matière Principale')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.teachers.col_matricule', 'Matricule')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.teachers.col_pwd', 'Mot de passe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.teachers.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {teachersData.length > 0 ? teachersData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className="avatar" style={{width: 32, height: 32, fontSize: '0.9rem'}}>{row.first_name.charAt(0)}{row.last_name.charAt(0)}</div>
                  {row.first_name} {row.last_name}
                </td>
                <td style={{padding: '16px 0'}}>
                  <span className="badge badge-primary" style={{background: 'transparent', border: '1px solid var(--border-color)'}}>{row.subject}</span>
                  <span className={`badge ${row.status === 'Suspendu' ? 'badge-warning' : 'badge-success'}`} style={{marginLeft: '8px'}}>{row.status || 'Présent'}</span>
                </td>
                <td style={{padding: '16px 0', fontWeight: '500'}}>{row.matricule || '-'}</td>
                <td style={{padding: '16px 0'}}>{row.password ? '••••••••' : '-'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} title="Modifier" onClick={() => { setEditEntity(row); setActiveModal('teacher'); }}>✏️</button>
                  <button className="btn btn-outline" title={row.status === 'Suspendu' ? 'Activer' : 'Suspendre'} style={{padding: '6px 12px', marginRight: '8px', color: row.status === 'Suspendu' ? 'var(--success-color)' : 'var(--error-color)', borderColor: row.status === 'Suspendu' ? 'var(--success-color)' : 'var(--error-color)'}} onClick={() => handleToggleTeacherStatus(row.id, row.status || 'Présent')}>{row.status === 'Suspendu' ? '✅' : '🚫'}</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert(`Identifiants pour ${row.first_name} ${row.last_name}:\n\nMatricule: ${row.matricule}\nMot de passe: ${row.password}`)}>{t('admin.teachers.btn_view_ids', 'Voir les identifiants')}</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem', marginLeft: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('teacher_payment_history'); }}>📜 Historique</button>
                  <button className="btn btn-primary" style={{padding: '6px 12px', fontSize: '0.8rem', marginLeft: '8px'}} onClick={() => { setEditEntity(row); setSelectedTeacherPayment(null); setActiveModal('teacher_payment'); }}>💵 Payer</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0'}}>{t('admin.teachers.empty_state', 'Aucun enseignant trouvé. Cliquez sur Ajouter.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>

      <div className="panel delay-200" style={{marginTop: '24px'}}>
        <div className="panel-header">
          <h3 className="panel-title">Membres du Comité d'examen ({committeeMembers.length})</h3>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Nom & Prénom</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Email</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Mot de passe</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {committeeMembers.length > 0 ? committeeMembers.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className="avatar" style={{width: 32, height: 32, fontSize: '0.9rem'}}>{row.first_name.charAt(0)}{row.last_name.charAt(0)}</div>
                  {row.first_name} {row.last_name}
                </td>
                <td style={{padding: '16px 0'}}>{row.email}</td>
                <td style={{padding: '16px 0'}}>{row.password ? '••••••••' : '-'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} title="Modifier" onClick={() => { setEditEntity(row); setActiveModal('committee_member'); }}>✏️</button>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert(`Identifiants pour ${row.first_name} ${row.last_name}:\n\nEmail: ${row.email}\nMot de passe: ${row.password}`)}>Voir identifiants</button>
                  <button className="btn-icon" onClick={async (e) => { 
                    e.stopPropagation(); 
                    if (window.confirm('Voulez-vous supprimer ce membre ?')) {
                      await supabase.from('committee_members').delete().eq('id', row.id);
                      fetchCommitteeMembers();
                    }
                  }} style={{color: 'var(--danger-color)', marginLeft: '8px'}} title="Supprimer">
                    <Icons.Trash2 size={18} />
                  </button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={4} style={{textAlign: 'center', padding: '24px 0'}}>Aucun membre du comité trouvé.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  const renderParents = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.parents.title', "Parents d'Élèves")}</h1>
          <p className="page-subtitle">{t('admin.parents.subtitle', "Annuaire des tuteurs légaux, contacts d'urgence et accès ENT.")}</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-primary" onClick={() => setActiveModal('parent')}>
            <Icons.Plus /> {t('admin.parents.btn_add', 'Ajouter un Parent')}
          </button>
          <button className="btn btn-outline" onClick={() => setActiveModal('message')}>
            <Icons.Mail /> {t('admin.parents.btn_msg', 'Envoyer un message')}
          </button>
        </div>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.parents.panel_title', 'Base de données Parents')}</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.parents.search_ph', 'Rechercher un parent ou un élève...')} />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_name', 'Nom du Parent')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_child', 'Enfant(s) Associé(s)')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_phone', 'Téléphone')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.parents.col_access', 'Accès ENT')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>{t('admin.parents.col_actions', 'Actions')}</th>
            </tr>
          </thead>
          <tbody>
            {parentsData && parentsData.length > 0 ? parentsData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.first_name} {row.last_name}</td>
                <td style={{padding: '16px 0'}}>
                  {row.student_parents?.length > 0 ? (
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px', flexWrap: 'wrap'}}>
                      <span className="badge badge-primary">{row.student_parents.length} {row.student_parents.length > 1 ? 'élèves' : 'élève'}</span>
                      <span>{row.student_parents.map((sp: any) => sp.students?.first_name + ' ' + sp.students?.last_name).filter(Boolean).join(', ')}</span>
                    </div>
                  ) : '-'}
                </td>
                <td style={{padding: '16px 0'}}>{row.phone || '-'}</td>
                <td style={{padding: '16px 0'}}>{row.email ? 'Actif' : 'Non configuré'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', marginRight: '8px'}} onClick={() => { setEditEntity(row); setActiveModal('parent'); }}>✏️ Modifier</button>
                  <button className="btn btn-outline" title="Supprimer" style={{padding: '6px 12px', color: 'var(--error-color)', borderColor: 'var(--error-color)'}} onClick={() => handleDeleteParent(row.id)}>🗑️ Supprimer</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.parents.empty_state', 'Aucun parent enregistré.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSchedules = () => {
    const daysValues = [
      t('admin.schedules.days.monday', 'Lundi'),
      t('admin.schedules.days.tuesday', 'Mardi'),
      t('admin.schedules.days.wednesday', 'Mercredi'),
      t('admin.schedules.days.thursday', 'Jeudi'),
      t('admin.schedules.days.friday', 'Vendredi'),
      t('admin.schedules.days.saturday', 'Samedi')
    ];
    // Map them up
    const days = ['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi', 'Samedi'];
    const currentSchedules = schedulesData.filter(s => s.class_id === selectedClassForSchedule);
    
    return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.schedules.title', 'Emplois du Temps')}</h1>
          <p className="page-subtitle">{t('admin.schedules.subtitle', 'Gestion des plannings par classe.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('schedule')}>
          <Icons.Plus /> {t('admin.schedules.btn_add', 'Ajouter un cours')}
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header" style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
          <h3 className="panel-title" style={{margin: 0}}>{t('admin.schedules.panel_title', 'Planning de la classe')}</h3>
          <select 
            className="form-select" 
            style={{width: '250px'}} 
            value={selectedClassForSchedule} 
            onChange={(e) => setSelectedClassForSchedule(e.target.value)}
          >
            <option value="">{t('admin.schedules.select_class', '-- Sélectionner une classe --')}</option>
            {classesData.map(c => (
              <option key={c.id} value={c.id}>{c.name}</option>
            ))}
          </select>
        </div>

        {selectedClassForSchedule ? (
          <div style={{overflowX: 'auto', marginTop: '16px'}}>
            <table style={{width: '100%', borderCollapse: 'collapse', minWidth: '800px'}}>
              <thead>
                <tr>
                  <th style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--surface-color-hover)', width: '10%'}}>{t('admin.schedules.col_time', 'Heure')}</th>
                  {daysValues.map(day => (
                    <th key={day} style={{padding: '12px', border: '1px solid var(--border-color)', background: 'var(--surface-color-hover)', width: '15%', textAlign: 'center'}}>{day}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {['08:00', '09:00', '10:00', '11:00', '12:00', '13:00', '14:00', '15:00', '16:00', '17:00'].map(hour => (
                  <tr key={hour}>
                    <td style={{padding: '12px', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)'}}>{hour}</td>
                    {days.map((day) => {
                      const courses = currentSchedules.filter(s => s.day_of_week === day && s.start_time.startsWith(hour));
                      return (
                        <td key={day} style={{padding: '8px', border: '1px solid var(--border-color)', verticalAlign: 'top', height: '80px'}}>
                          {courses.map((course, i) => (
                            <div key={i} style={{position: 'relative', background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--primary-color)', padding: '6px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.85rem'}}>
                              <button 
                                onClick={(e) => { e.stopPropagation(); handleDeleteSchedule(course.id); }}
                                style={{position: 'absolute', top: '2px', right: '4px', background: 'transparent', border: 'none', color: 'var(--danger-color)', cursor: 'pointer', fontSize: '1rem', padding: '0 4px', fontWeight: 'bold'}}
                                title="Supprimer ce cours"
                              >
                                &times;
                              </button>
                              <div style={{fontWeight: 600, color: 'var(--primary-color)', paddingRight: '16px'}}>{course.subject}</div>
                              <div style={{color: 'var(--text-secondary)', fontSize: '0.75rem'}}>{course?.start_time?.substring(0,5)} - {course?.end_time?.substring(0,5)}</div>
                              <div style={{color: 'var(--text-secondary)', fontSize: '0.75rem', marginTop: '2px'}}>{course.teachers?.first_name} {course.teachers?.last_name}</div>
                            </div>
                          ))}
                        </td>
                      );
                    })}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        ) : (
          <div style={{padding: '40px', textAlign: 'center', color: 'var(--text-secondary)'}}>
            {t('admin.schedules.empty_state', 'Veuillez sélectionner une classe pour afficher son emploi du temps.')}
          </div>
        )}
      </div>
    </div>
  )};

  const renderScolarite = () => {
    if (currentSchoolPlan !== 'Pro') {
      return renderPremiumOverlay(t('admin.finance.premium_title', "Comptabilité & Scolarité"), t('admin.finance.premium_desc', "Gérez les factures, les paiements de scolarité et suivez votre trésorerie avec le plan Pro."));
    }

    // Calcul des totaux par classe
    const scolariteParClasse = (classesData || []).map(cls => {
      const classStudents = (studentsData || []).filter(s => s.class_id === cls.id);
      const classStudentsIds = classStudents.map(s => s.id);
      const classInvoices = (invoicesData || []).filter(inv => classStudentsIds.includes(inv.student_id));
      
      const paye = classInvoices.filter(inv => inv.status === 'Payée').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
      const total = classStudents.reduce((sum, s) => sum + (Number(s.tuition_fee) || Number(cls.tuition_fee) || 0), 0);
      const nonPaye = Math.max(0, total - paye);
      
      return {
        id: cls.id,
        className: cls.name,
        paye,
        nonPaye,
        total,
        tauxRecouvrement: total > 0 ? Math.round((paye / total) * 100) : 0,
        studentsDetails: classStudents.map(s => {
          const sInvoices = classInvoices.filter(inv => inv.student_id === s.id && inv.status === 'Payée');
          const sPaye = sInvoices.reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
          const sTotal = Number(s.tuition_fee) || Number(cls.tuition_fee) || 0;
          const sNonPaye = Math.max(0, sTotal - sPaye);
          return {
            id: s.id,
            matricule: s.matricule,
            name: `${s.first_name} ${s.last_name}`,
            paye: sPaye,
            total: sTotal,
            nonPaye: sNonPaye,
            status: sNonPaye <= 0 ? 'Soldé' : 'Non soldé'
          };
        }).sort((a, b) => a.name.localeCompare(b.name))
      };
    }).sort((a, b) => b.total - a.total);

    const totalAttenduGlobal = scolariteParClasse.reduce((sum, row) => sum + row.total, 0);
    const totalPayeGlobal = scolariteParClasse.reduce((sum, row) => sum + row.paye, 0);
    const totalResteGlobal = scolariteParClasse.reduce((sum, row) => sum + row.nonPaye, 0);
    const tauxRecouvrementGlobal = totalAttenduGlobal > 0 ? Math.round((totalPayeGlobal / totalAttenduGlobal) * 100) : 0;

    // Calcul des factures filtrées pour la recherche
        const filteredInvoices = (invoicesData || []).filter(inv => {
        const q = invoiceSearchQuery.toLowerCase();
        if (!q) return true;
        return (inv.invoice_number?.toLowerCase().includes(q)) || 
               (inv.students?.first_name?.toLowerCase().includes(q)) ||
               (inv.students?.last_name?.toLowerCase().includes(q)) ||
               (inv.motif?.toLowerCase().includes(q));
      }).sort((a: any, b: any) => new Date(b.issue_date || 0).getTime() - new Date(a.issue_date || 0).getTime());

    return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.finance.title', 'Comptabilité & Scolarité')}</h1>
          <p className="page-subtitle">{t('admin.finance.subtitle', 'Suivi des paiements, encaissements et relances de frais de scolarité.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('payment')}>
          <Icons.Plus /> {t('admin.finance.btn_add', 'Enregistrer un Paiement')}
        </button>
      </div>

      <div className="stats-grid finance-stats" style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px', marginBottom: '24px'}}>
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">Total Attendu</span>
            <Icons.Database />
          </div>
          <div className="stat-value">{formatNum(totalAttenduGlobal)}</div>
          <div className="stat-trend trend-up">
            F
          </div>
        </div>
        
        <div className="stat-card delay-150">
          <div className="stat-header">
            <span className="stat-label">Total Payé</span>
            <Icons.CreditCard />
          </div>
          <div className="stat-value">{formatNum(totalPayeGlobal)}</div>
          <div className="stat-trend trend-up">
            F
          </div>
        </div>

        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.finance.stat_rem', 'Reste à Recouvrer')}</span>
            <Icons.Database />
          </div>
          <div className="stat-value">{formatNum(totalResteGlobal)}</div>
          <div className="stat-trend trend-down">
            F
          </div>
        </div>

        <div className="stat-card delay-300">
          <div className="stat-header">
            <span className="stat-label">{t('admin.finance.stat_rate', 'Taux de Recouvrement')}</span>
            <Icons.TrendingUp />
          </div>
          <div className="stat-value">{formatNum(tauxRecouvrementGlobal)}%</div>
          <div className="stat-trend trend-up">
            Global
          </div>
        </div>

        <div className="stat-card delay-400">
          <div className="stat-header">
            <span className="stat-label">Total Emprunts</span>
            <Icons.Database />
          </div>
          <div className="stat-value">{formatNum(loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0)}</div>
          <div className="stat-trend trend-up">
            F
          </div>
        </div>

        <div className="stat-card delay-400">
          <div className="stat-header">
            <span className="stat-label">Solde Caisse</span>
            <Icons.Database />
          </div>
          <div className="stat-value" style={{color: (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) + (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) - (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) >= 0 ? '#10b981' : '#ef4444'}}>
            {formatNum(
                (invoicesData?.filter(i => i.status === 'Payée').reduce((sum, item) => sum + Number(item.paid_amount || item.amount), 0) || 0) +
                (loansData?.filter(l => l.status === 'Actif').reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (expensesData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (teacherPaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0) -
                (employeePaymentsData?.reduce((sum, item) => sum + Number(item.amount), 0) || 0)
              )}
          </div>
          <div className="stat-trend trend-up">
            F
          </div>
        </div>
      </div>

      <div id="finance-class-summary-panel" className="panel delay-200" style={{marginTop: '24px'}}>
        <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <h3 className="panel-title finance-class-print-title">{t('admin.finance.panel_class_title', 'Récapitulatif par Classe')}</h3>
          <button className="btn btn-outline" onClick={() => {
            document.body.classList.add('print-finance-class-summary');
            window.print();
            setTimeout(() => document.body.classList.remove('print-finance-class-summary'), 1000);
          }}>
            <Icons.Printer /> {t('admin.finance.print', 'Imprimer')}
          </button>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Total Attendu</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--success-color)'}}>Total Payé</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--danger-color)'}}>Reste à Payer</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Taux de Recouvrement</th>
              <th style={{padding: '12px 0', width: '40px'}}></th>
            </tr>
          </thead>
          <tbody>
            {(scolariteParClasse || []).map((row) => (
              <React.Fragment key={row.id}>
                <tr style={{borderBottom: '1px solid var(--border-color)', cursor: 'pointer', background: expandedClassId === row.id ? 'var(--surface-color-hover)' : 'transparent'}} onClick={() => setExpandedClassId(expandedClassId === row.id ? null : row.id)}>
                  <td style={{padding: '16px 0', fontWeight: 600}}>{row.className}</td>
                  <td style={{padding: '16px 0', fontWeight: 'bold'}}>{formatNum(row.total)} F</td>
                  <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--success-color)'}}>{formatNum(row.paye)} F</td>
                  <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--danger-color)'}}>{formatNum(row.nonPaye)} F</td>
                  <td style={{padding: '16px 0'}}>
                    <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                      <div style={{flex: 1, background: 'var(--surface-color-hover)', height: '8px', borderRadius: '4px', overflow: 'hidden'}}>
                        <div style={{background: 'var(--success-color)', height: '100%', width: `${row.tauxRecouvrement}%`}}></div>
                      </div>
                      <span style={{fontSize: '0.85rem', fontWeight: 600}}>{row.tauxRecouvrement}%</span>
                    </div>
                  </td>
                  <td style={{padding: '16px 0', textAlign: 'right'}}>
                    <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}}>
                      {expandedClassId === row.id ? 'Fermer' : 'Voir Détails'} <Icons.ChevronDown style={{transform: expandedClassId === row.id ? 'rotate(180deg)' : 'none', transition: 'transform 0.2s', marginLeft: '4px'}} />
                    </button>
                  </td>
                </tr>
                {expandedClassId === row.id && (
                  <tr style={{background: '#f8fafc', borderBottom: '1px solid var(--border-color)'}}>
                    <td colSpan={6} style={{padding: '16px'}}>
                      <div style={{background: '#fff', borderRadius: '8px', border: '1px solid var(--border-color)', overflow: 'hidden'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                          <thead>
                             <tr style={{background: '#f1f5f9', borderBottom: '1px solid var(--border-color)'}}>
                               <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 500}}>Élève</th>
                               <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 500}}>Attendu</th>
                               <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 500}}>Payé</th>
                               <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 500}}>Reste</th>
                               <th style={{padding: '10px 16px', textAlign: 'left', fontWeight: 500}}>Statut</th>
                               <th style={{padding: '10px 16px', textAlign: 'right', fontWeight: 500}}>Action</th>
                             </tr>
                          </thead>
                          <tbody>
                            {(row.studentsDetails || []).map(st => (
                              <tr key={st.id} style={{borderBottom: '1px solid #f1f5f9'}}>
                                <td style={{padding: '10px 16px', fontWeight: 500}}>{st.name}</td>
                                <td style={{padding: '10px 16px'}}>{formatNum(st.total)}</td>
                                <td style={{padding: '10px 16px', color: 'var(--success-color)', fontWeight: 600}}>{formatNum(st.paye)}</td>
                                <td style={{padding: '10px 16px', color: 'var(--danger-color)', fontWeight: 600}}>{formatNum(st.nonPaye)}</td>
                                <td style={{padding: '10px 16px'}}>
                                  <span className={`badge ${st.status === 'Soldé' ? 'badge-success' : 'badge-warning'}`}>{st.status}</span>
                                </td>
                                <td style={{padding: '10px 16px', textAlign: 'right'}}>
                                  {st.status !== 'Soldé' && (
                                    <button className="btn btn-primary" style={{padding: '4px 12px', fontSize: '0.8rem', height: 'auto', minHeight: 'auto'}} onClick={(e) => { e.stopPropagation(); setPreselectedStudentId(st.id); setActiveModal('payment'); }}>Encaisser</button>
                                  )}
                                </td>
                              </tr>
                            ))}
                            {row.studentsDetails.length === 0 && (
                              <tr><td colSpan={6} style={{padding: '16px', textAlign: 'center', color: 'var(--text-secondary)'}}>Aucun élève dans cette classe.</td></tr>
                            )}
                          </tbody>
                        </table>
                      </div>
                    </td>
                  </tr>
                )}
              </React.Fragment>
            ))}
            {scolariteParClasse.length === 0 && (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>Aucune donnée disponible.</td></tr>
            )}
          </tbody>
        </table>
      </div>


      {/* NOUVEAU PANEL: Suivi des paiements par élève */}
      <div className="panel delay-250" id="finance-list-panel" style={{marginTop: '24px'}}>
        <div className="panel-header" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '16px'}}>
          <h3 className="panel-title finance-print-title" style={{textTransform: 'uppercase'}}>
            {(() => {
              if (financeStatusFilter === 'all' && financeClassFilter === 'all') return 'SUIVI DES PAIEMENTS PAR ÉLÈVE';
              const statusPart = financeStatusFilter === 'all' ? '' : (financeStatusFilter === 'Soldé' ? 'SOLDE' : 'NON SOLDE');
              const classPart = financeClassFilter === 'all' ? '' : 'DE CLASSE ' + (classesData.find(c => c.id === financeClassFilter)?.name || '').toUpperCase();
              return `LA LISTE DES ELEVES ${statusPart} ${classPart}`.replace(/\s+/g, ' ').trim();
            })()}
          </h3>
          <div className="finance-filters" style={{display: 'flex', gap: '12px'}}>
            <select 
              className="form-select" 
              value={financeStatusFilter} 
              onChange={(e) => setFinanceStatusFilter(e.target.value)}
              style={{width: '180px'}}
            >
              <option value="all">Tous les statuts</option>
              <option value="Soldé">Soldé</option>
              <option value="Non soldé">Non soldé</option>
            </select>
            <select 
              className="form-select" 
              value={financeClassFilter} 
              onChange={(e) => setFinanceClassFilter(e.target.value)}
              style={{width: '180px'}}
            >
              <option value="all">Toutes les classes</option>
              {classesData.map(c => (
                <option key={c.id} value={c.id}>{c.name}</option>
              ))}
            </select>
            <button className="btn btn-outline" onClick={() => { document.body.classList.add('print-finance-list'); window.print(); setTimeout(() => document.body.classList.remove('print-finance-list'), 1000); }} title="Imprimer cette liste">
              <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{marginRight: '8px'}}>
                <polyline points="6 9 6 2 18 2 18 9"></polyline>
                <path d="M6 18H4a2 2 0 0 1-2-2v-5a2 2 0 0 1 2-2h16a2 2 0 0 1 2 2v5a2 2 0 0 1-2 2h-2"></path>
                <rect x="6" y="14" width="12" height="8"></rect>
              </svg>
              Imprimer
            </button>
          </div>
        </div>
        
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: '16px'}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Matricule</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Élève</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Attendu</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--success-color)'}}>Payé</th>
              <th style={{padding: '12px 0', fontWeight: 500, color: 'var(--danger-color)'}}>Reste à Payer</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {(() => {
              const filteredStudents = scolariteParClasse.flatMap(c => 
                (c.studentsDetails || []).map(s => ({...s, className: c.className, classId: c.id}))
              ).filter(s => {
                 const matchClass = financeClassFilter === 'all' || s.classId === financeClassFilter;
                 const matchStatus = financeStatusFilter === 'all' || s.status === financeStatusFilter;
                 return matchClass && matchStatus;
              });
              
              const totalAttendu = filteredStudents.reduce((sum, st) => sum + (st.total || 0), 0);
              const totalPaye = filteredStudents.reduce((sum, st) => sum + (st.paye || 0), 0);
              const totalReste = filteredStudents.reduce((sum, st) => sum + (st.nonPaye || 0), 0);

              return (
                <>
                  {filteredStudents.map((st, i) => (
                    <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                      <td style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{st.matricule}</td>
                      <td style={{padding: '16px 0', fontWeight: 600}}>{st.name}</td>
                      <td style={{padding: '16px 0'}}>{st.className}</td>
                      <td style={{padding: '16px 0'}}>{formatNum(st.total)} F</td>
                      <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--success-color)'}}>{formatNum(st.paye)} F</td>
                      <td style={{padding: '16px 0', fontWeight: 'bold', color: 'var(--danger-color)'}}>{formatNum(st.nonPaye)} F</td>
                      <td style={{padding: '16px 0'}}>
                        <span className={`badge ${st.status === 'Soldé' ? 'badge-success' : 'badge-warning'}`}>{st.status}</span>
                      </td>
                    </tr>
                  ))}
                  {filteredStudents.length > 0 && (
                    <tr className="finance-totals-row" style={{fontWeight: 'bold', borderTop: '2px solid var(--border-color)'}}>
                      <td colSpan={3} style={{padding: '16px 0', textAlign: 'right', paddingRight: '24px'}}>TOTAL :</td>
                      <td style={{padding: '16px 0'}}>{formatNum(totalAttendu)} F</td>
                      <td style={{padding: '16px 0', color: 'var(--success-color)'}}>{formatNum(totalPaye)} F</td>
                      <td style={{padding: '16px 0', color: 'var(--danger-color)'}}>{formatNum(totalReste)} F</td>
                      <td></td>
                    </tr>
                  )}
                </>
              );
            })()}
          </tbody>
        </table>
      </div>

      <div className="panel delay-300" style={{marginTop: '24px'}}>
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.finance.panel_title', 'Dernières Transactions')}</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.finance.search_ph', 'Rechercher un reçu, un élève...')} value={invoiceSearchQuery} onChange={e => setInvoiceSearchQuery(e.target.value)} />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_invoice', 'N° Reçu')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_student', 'Élève & Classe')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_motif', 'Motif')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_amount', 'Montant')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_date', 'Date')}</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>{t('admin.finance.col_status', 'Statut')}</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Action</th>
            </tr>
          </thead>
          <tbody>
            {filteredInvoices.length > 0 ? filteredInvoices.map((row, i) => {
                const studentInvs = invoicesData.filter(inv => inv.student_id === row.student_id);
                let verse = 0;
                studentInvs.forEach(inv => { if(inv.status === 'Payée') verse += Number(inv.amount); });
                let reste = Math.max(0, (row.students?.tuition_fee || 0) - verse);
                return (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontFamily: 'monospace', fontWeight: 500, color: 'var(--primary-color)'}}>{row.invoice_number}</td>
                <td style={{padding: '16px 0'}}>
                  <div style={{fontWeight: 600}}>{row.students?.first_name} {row.students?.last_name}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{row.students?.matricule}</div>
                </td>
                <td style={{padding: '16px 0'}}>{row.motif}</td>
                <td style={{padding: '16px 0'}}>
                  <div style={{fontWeight: 'bold'}}>{formatNum(row.amount)} F</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)', marginTop: '4px'}}>
                    Total versé: {formatNum(verse)} <br/> Reste: <span style={{color: reste > 0 ? '#e74c3c' : '#2ecc71', fontWeight: 600}}>{formatNum(reste)}</span>
                  </div>
                </td>
                <td style={{padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{new Date(row.issue_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={`badge ${row.status === 'Payée' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span>
                </td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => {
                    const studentFull = studentsData.find(s => s.id === row.student_id);
                    setSelectedStudent(studentFull || row.students);
                    setSelectedInvoice(row);
                    setActiveModal('receipt_preview');
                  }}>
                    <Icons.Printer /> Imprimer
                  </button>
                </td>
              </tr>
            );
            }) : (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.finance.empty_state', 'Aucun paiement enregistré.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};
  const renderGrades = () => {
    // Determine which evaluations to show based on selected class
    const filteredEvaluations = evaluationsData.filter(e => {
      if (selectedClassForGrades === 'validations') {
        return e.validation_status === 'pending';
      }
      return (!selectedClassForGrades || e.class_id === selectedClassForGrades) &&
             (!selectedSubjectForGrades || e.subject === selectedSubjectForGrades) &&
             (!selectedPeriodForGrades || e.period === selectedPeriodForGrades);
    });

    const handleValidationAction = async (evalId: string, status: string) => {
      try {
        const { error } = await supabase.from('evaluations').update({ validation_status: status }).eq('id', evalId);
        if (error) throw error;
        alert(`Évaluation ${status === 'approved' ? 'approuvée' : 'rejetée'} !`);
        fetchEvaluations();
      } catch (err: any) { alert(err.message); }
    };

    const handleToggleLock = async (evalId: string, currentLocked: boolean) => {
      try {
        const { error } = await supabase.from('evaluations').update({ locked: !currentLocked }).eq('id', evalId);
        if (error) throw error;
        fetchEvaluations();
      } catch (err: any) { alert(err.message); }
    };

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('admin.grades.title', 'Saisie des Notes')}</h1>
            <p className="page-subtitle">{t('admin.grades.subtitle', 'Gérez les évaluations et saisissez les notes par classe.')}</p>
          </div>
          <button className="btn btn-primary" onClick={() => setActiveModal('evaluation')}>
            <Icons.Plus /> {t('admin.grades.btn_add', 'Nouvelle Évaluation')}
          </button>
        </div>

        <div style={{display: 'flex', gap: '8px', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>
          <button className={`btn ${selectedClassForGrades !== 'validations' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedClassForGrades('')}>
            Toutes les Évaluations
          </button>
          <button className={`btn ${selectedClassForGrades === 'validations' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setSelectedClassForGrades('validations')} style={{position: 'relative'}}>
            En attente de validation
            {evaluationsData.filter(e => e.validation_status === 'pending').length > 0 && (
              <span style={{position: 'absolute', top: -8, right: -8, background: 'var(--danger-color)', color: 'white', fontSize: '0.7rem', fontWeight: 'bold', padding: '2px 6px', borderRadius: '10px'}}>
                {evaluationsData.filter(e => e.validation_status === 'pending').length}
              </span>
            )}
          </button>
        </div>

        {!activeEvaluation ? (
          <>
            <div className="filters-bar delay-100" style={{marginBottom: '24px'}}>
              <select className="form-select" value={selectedClassForGrades} onChange={e => setSelectedClassForGrades(e.target.value)}>
                <option value="">{t('admin.grades.filter_class', 'Toutes les classes')}</option>
                {classesData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
              </select>
              <select className="form-select" value={selectedPeriodForGrades} onChange={e => setSelectedPeriodForGrades(e.target.value)}>
                <option value="1er Trimestre">{t('admin.grades.filter_term1', '1er Trimestre')}</option>
                <option value="2ème Trimestre">{t('admin.grades.filter_term2', '2ème Trimestre')}</option>
                <option value="3ème Trimestre">{t('admin.grades.filter_term3', '3ème Trimestre')}</option>
                <option value="1er Semestre">{t('admin.grades.filter_sem1', '1er Semestre')}</option>
                <option value="2ème Semestre">{t('admin.grades.filter_sem2', '2ème Semestre')}</option>
              </select>
              <input type="text" placeholder={t('admin.grades.filter_subject', 'Filtrer par matière...')} className="form-input search-input" value={selectedSubjectForGrades} onChange={e => setSelectedSubjectForGrades(e.target.value)} />
            </div>

            {selectedClassForGrades ? (
              <div className="panel delay-200">
                <h3 className="panel-title">{t('admin.grades.panel_title', 'Évaluations existantes')}</h3>
                <div className="table-responsive">
                  <table className="data-table">
                    <thead>
                      <tr>
                        <th>{t('admin.grades.col_date', 'Date')}</th>
                        <th>{t('admin.grades.col_class', 'Classe')}</th>
                        <th>{t('admin.grades.col_subject', 'Matière')}</th>
                        <th>{t('admin.grades.col_name', "Nom de l'évaluation")}</th>
                        <th>Statut</th>
                        <th>{t('admin.grades.col_max', 'Notes sur')}</th>
                        <th>{t('admin.grades.col_action', 'Action')}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {filteredEvaluations.map(evalu => (
                        <tr key={evalu.id}>
                          <td>{new Date(evalu.date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                          <td>{evalu.classes?.name}</td>
                          <td style={{fontWeight: 600}}>{evalu.subject}</td>
                          <td>{evalu.name}</td>
                          <td>
                            {evalu.validation_status === 'pending' ? (
                              <span className="badge badge-warning">En attente</span>
                            ) : (
                              <span className="badge badge-success">Approuvée</span>
                            )}
                            {evalu.locked && (
                              <span className="badge" style={{marginLeft: 4, background: 'var(--danger-color)', color: 'white'}}>🔒</span>
                            )}
                          </td>
                          <td>{formatNum(evalu.max_score)}</td>
                          <td style={{display: 'flex', gap: '8px', alignItems: 'center'}}>
                            <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => startGrading(evalu)}>{t('admin.grades.btn_grade', 'Saisir les notes')}</button>
                            {selectedClassForGrades === 'validations' && evalu.validation_status === 'pending' && (
                              <button className="btn btn-success" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => handleValidationAction(evalu.id, 'approved')}>Approuver</button>
                            )}
                            {evalu.validation_status === 'approved' && (
                               <button className={`btn ${evalu.locked ? 'btn-outline' : 'btn-danger'}`} style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => handleToggleLock(evalu.id, evalu.locked)}>
                                 {evalu.locked ? 'Déverrouiller' : 'Clôturer'}
                               </button>
                            )}
                            <button className="btn-icon" onClick={(e) => { e.stopPropagation(); handleDeleteEvaluation(evalu.id); }} style={{color: 'var(--danger-color)', padding: 0}} title={t('admin.delete', 'Supprimer')}>
                              <Icons.Trash2 size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                      {filteredEvaluations.length === 0 && (
                        <tr><td colSpan={7} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.grades.empty_state', 'Aucune évaluation trouvée pour ces filtres.')}</td></tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="panel delay-200" style={{textAlign: 'center', padding: '64px 20px'}}>
                <div style={{opacity: 0.3, marginBottom: '16px'}}>
                  <Icons.FileText />
                </div>
                <h3 style={{fontSize: '1.2rem', marginBottom: '8px', color: 'var(--text-color)'}}>{t('admin.grades.select_class_title', 'Sélectionnez une classe')}</h3>
                <p style={{color: 'var(--text-secondary)', maxWidth: '400px', margin: '0 auto'}}>
                  {t('admin.grades.select_class_desc', "Pour afficher la liste des évaluations et saisir les notes, veuillez d'abord choisir une classe dans le menu ci-dessus.")}
                </p>
              </div>
            )}
          </>
        ) : (
          <div className="panel delay-100">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>
              <div>
                <h3 style={{margin: '0 0 8px 0'}}>{activeEvaluation.name} ({activeEvaluation.subject})</h3>
                <div style={{color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                  {t('admin.grades.col_class', 'Classe')} : {activeEvaluation.classes?.name} • {t('admin.grades.col_date', 'Date')} : {new Date(activeEvaluation.date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')} • {t('admin.grades.col_max', 'Notes sur')} : {formatNum(activeEvaluation.max_score)}
                </div>
              </div>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-outline" onClick={() => setActiveEvaluation(null)}>{t('admin.grades.btn_back', 'Retour')}</button>
                <button className="btn btn-primary" onClick={saveGrades}>{t('admin.grades.btn_save', 'Sauvegarder les notes')}</button>
              </div>
            </div>

            <div style={{background: '#fff', border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', fontSize: '13px', fontFamily: 'Arial, sans-serif'}}>
              {/* Table Toolbar */}
              <div style={{padding: '8px 12px', background: '#f5f5f5', borderBottom: '1px solid #d4d4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                  <button style={{background: '#e9ecef', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(studentsData.filter(s => s.class_id === activeEvaluation.class_id).length)} {t('admin.grades.results', 'résultats')}</button>
                  <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333', marginLeft: '4px'}}>{formatNum(1)}</button>
                  <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(2)}</button>
                  <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(3)}</button>
                  <button style={{background: '#e9ecef', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#0066cc', marginLeft: '4px'}}>{t('admin.grades.show_all', 'Tout afficher')}</button>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                  <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                    <input 
                      type="text" 
                      style={{padding: '4px 28px 4px 8px', border: '1px solid #ccc', borderRadius: '15px', fontSize: '12px', width: '220px', outline: 'none'}} 
                    />
                    <svg viewBox="0 0 24 24" fill="none" stroke="#00a8ff" strokeWidth="2" style={{position: 'absolute', right: '10px', width: '14px', height: '14px'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                  </div>
                  <button style={{background: '#f8f9fa', border: '1px solid #ccc', padding: '4px 12px', borderRadius: '3px', fontSize: '12px', color: '#0066cc'}}>{t('admin.grades.filter', 'Filtre')}</button>
                </div>
              </div>
              
              {/* Data Table */}
              <div style={{overflowX: 'auto'}}>
                <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                  <colgroup>
                    <col style={{width: '30px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '150px'}} />
                    <col style={{width: '180px'}} />
                    <col style={{width: '100px'}} />
                    <col style={{width: '150px'}} />
                    <col style={{width: '180px'}} />
                  </colgroup>
                  <thead>
                    <tr style={{background: '#f9f9f9', borderBottom: '1px solid #d4d4d4', textAlign: 'left', color: '#333'}}>
                      <th style={{padding: '8px 4px', borderRight: '1px solid #d4d4d4', textAlign: 'center', fontWeight: 'bold'}}><input type="checkbox" /></th>
                      <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('admin.grades.col_matricule', 'Matricule')}</th>
                      <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('admin.grades.col_lastname', 'Nom')}</th>
                      <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('admin.grades.col_firstname', 'Prénoms')}</th>
                      <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('admin.grades.col_class', 'Classe')}</th>
                      <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('admin.grades.col_note', 'Note')} (/{formatNum(activeEvaluation.max_score)})</th>
                      <th style={{padding: '8px', fontWeight: 'bold'}}>{t('admin.grades.col_appreciation', 'Appréciation')}</th>
                    </tr>
                  </thead>
                  <tbody>
                    {studentsData.filter(s => s.class_id === activeEvaluation.class_id).map((student, index) => (
                      <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                        <td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}><input type="checkbox" /></td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{student.matricule || `MAT-${student.id.substring(0,4)}`}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{activeEvaluation.classes?.name}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>
                          <input 
                            id={`grade-input-${index}`}
                            type="number" 
                            step="0.25" 
                            min="0" 
                            max={activeEvaluation.max_score}
                            style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none'}}
                            value={gradesInput[student.id]?.score || ''}
                            onChange={(e) => handleGradeChange(student.id, 'score', e.target.value, activeEvaluation.max_score || 20)}
                            onKeyDown={(e) => handleKeyDown(e, index)}
                          />
                        </td>
                        <td style={{padding: '8px'}}>
                          <select 
                            style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none', background: '#fff'}}
                            value={gradesInput[student.id]?.comment || ''}
                            onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value, activeEvaluation.max_score || 20)}
                          >
                            <option value="">---------</option>
                            <option value={t('admin.grades.appr_excellent', 'Excellent travail')}>{t('admin.grades.appr_excellent', 'Excellent travail')}</option>
                            <option value={t('admin.grades.appr_very_good', 'Très bien')}>{t('admin.grades.appr_very_good', 'Très bien')}</option>
                            <option value={t('admin.grades.appr_good', 'Bien')}>{t('admin.grades.appr_good', 'Bien')}</option>
                            <option value={t('admin.grades.appr_fairly_good', 'Assez bien')}>{t('admin.grades.appr_fairly_good', 'Assez bien')}</option>
                            <option value={t('admin.grades.appr_passable', 'Passable')}>{t('admin.grades.appr_passable', 'Passable')}</option>
                            <option value={t('admin.grades.appr_insufficient', 'Insuffisant')}>{t('admin.grades.appr_insufficient', 'Insuffisant')}</option>
                            <option value={t('admin.grades.appr_better', 'Peut mieux faire')}>{t('admin.grades.appr_better', 'Peut mieux faire')}</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                    {studentsData.filter(s => s.class_id === activeEvaluation.class_id).length === 0 && (
                      <tr>
                        <td colSpan={7} style={{padding: '16px', textAlign: 'center', color: '#666'}}>
                          {t('admin.grades.empty_students', 'Aucun élève dans cette classe.')}
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </div>
              
              {/* Footer Bar */}
              <div style={{background: '#2c3e50', color: '#fff', padding: '6px 12px', fontSize: '12px', display: 'flex', justifyContent: 'flex-start'}}>
                {formatNum(0)} sur {formatNum(studentsData.filter(s => s.class_id === activeEvaluation.class_id).length)} {t('admin.grades.selected', 'sélectionné')}
              </div>
            </div>
          </div>
        )}
      </div>
    );
  };

  const handleYearTransition = async () => {
    if (!window.confirm("ATTENTION IRRÉVERSIBLE !\n\nCette action va :\n1. Passer TOUS les élèves actuellement 'Inscrits' en statut 'Ancien élève'.\n2. Passer l'année académique à l'année suivante.\n\nVous devrez réinscrire les élèves manuellement.\nVoulez-vous vraiment clôturer l'année scolaire ?")) return;
    
    try {
        const currentYear = settingsData?.academic_year || '2025-2026';
        const parts = currentYear.split('-');
        let nextYear = '2026-2027';
        if (parts.length === 2 && !isNaN(parseInt(parts[0]))) {
            nextYear = `${parseInt(parts[0])+1}-${parseInt(parts[1])+1}`;
        }
        
        // Update all active students to Ancien eleve
        const { error: stuErr } = await supabase.from('students').update({ status: 'Ancien élève' }).eq('status', 'Inscrit').eq('school_id', currentSchoolId as string);
        if (stuErr) throw stuErr;
        
        // Update setting
        let { data: existing } = await supabase.from('school_settings').select('id').eq('school_id', currentSchoolId as string).maybeSingle();
        
        if (!existing) {
            const { data: orphaned } = await supabase.from('school_settings').select('id').is('school_id', null).maybeSingle();
            if (orphaned) {
                await supabase.from('school_settings').update({ school_id: currentSchoolId as string }).eq('id', orphaned.id);
                existing = orphaned;
            }
        }

        if (existing) {
          const { error: setErr } = await supabase.from('school_settings').update({ academic_year: nextYear }).eq('id', existing.id);
          if (setErr) throw setErr;
        } else {
          const randomId = Math.floor(Math.random() * 1000000) + 1000;
          const { error: setErr } = await supabase.from('school_settings').insert([{ id: randomId, academic_year: nextYear, school_id: currentSchoolId as string }]);
          if (setErr) throw setErr;
        }
        
        alert("Année scolaire clôturée avec succès ! La nouvelle année est " + nextYear);
        fetchSettings();
        fetchStudents();
    } catch (err: any) {
        alert("Erreur: " + err.message);
    }
  };

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.settings.title', 'Paramètres')}</h1>
          <p className="page-subtitle">{t('admin.settings.subtitle', 'Configuration globale du système et de votre établissement.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => (document.getElementById('settingsForm') as HTMLFormElement)?.requestSubmit()}>{t('admin.settings.btn_save', 'Sauvegarder')}</button>
      </div>

      <div className="dashboard-grid settings-grid">
        {/* Settings Navigation */}
        <div className="panel delay-100" style={{padding: '16px'}}>
          <ul className="nav-menu" style={{padding: 0}}>
            <li className={`nav-item ${activeSettingsTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('general')} style={{marginBottom: '4px'}}>
              <Icons.Settings /> {t('admin.settings.tab_general', 'Général')}
            </li>
            <li className={`nav-item ${activeSettingsTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('academic')} style={{marginBottom: '4px'}}>
              <Icons.BookOpen /> {t('admin.settings.tab_academic', 'Pédagogique')}
            </li>
            <li className={`nav-item ${activeSettingsTab === 'security' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('security')} style={{marginBottom: '4px'}}>
              <Icons.Shield /> {t('admin.settings.tab_security', 'Sécurité & Accès')}
            </li>
            <li className={`nav-item ${activeSettingsTab === 'database' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('database')} style={{marginBottom: '4px'}}>
              <Icons.Database /> {t('admin.settings.tab_database', 'Base de Données')}
            </li>
            <li className={`nav-item ${activeSettingsTab === 'abonnement' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('abonnement')} style={{marginBottom: '4px'}}>
              <Icons.TrendingUp /> {t('admin.settings.tab_subscription', 'Abonnement')}
            </li>
          </ul>
        </div>

        {/* Settings Content */}
        <div className="panel delay-200">
          {activeSettingsTab === 'general' && (
            <form id="settingsForm" onSubmit={saveSettings}>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.gen_title', 'Paramètres Généraux')}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Logo de l'établissement (Image, Max 2Mo)</label>
                  <input type="file" name="logo_file" accept="image/*" className="form-input" style={{marginBottom: '10px'}} />
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_name', "Nom de l'établissement")}</label>
                  <input type="text" name="school_name" defaultValue={settingsData?.school_name || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_director', 'Directeur')}</label>
                  <input type="text" name="director_name" defaultValue={settingsData?.director_name || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_phone', 'Téléphone')}</label>
                  <input type="text" name="phone" defaultValue={settingsData?.phone || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_email', 'Adresse Email Principale')}</label>
                  <input type="email" name="email" defaultValue={settingsData?.email || ''} className="form-input" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.gen_address', 'Adresse')}</label>
                  <input type="text" name="address" defaultValue={settingsData?.address || ''} className="form-input" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Ville de signature (ex: Abidjan)</label>
                  <input type="text" name="city" defaultValue={settingsData?.city || ''} className="form-input" placeholder="Lieu sur le bulletin" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Nom du Chef d'établissement</label>
                  <input type="text" name="principal_name" defaultValue={settingsData?.principal_name || ''} className="form-input" placeholder="Signature gauche bulletin" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Nom du Directeur des Etudes</label>
                  <input type="text" name="studies_director_name" defaultValue={settingsData?.studies_director_name || ''} className="form-input" placeholder="Signature droite bulletin" />
                </div>
              </div>
            </form>
          )}

          {activeSettingsTab === 'academic' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.acad_title', 'Paramètres Pédagogiques')}</h3>
              
              <div style={{background: 'rgba(245, 158, 11, 0.1)', border: '1px solid rgba(245, 158, 11, 0.3)', padding: '16px', borderRadius: '8px', marginBottom: '24px'}}>
                <h4 style={{color: '#d97706', margin: '0 0 8px 0'}}>Clôture et Changement d'Année Scolaire</h4>
                <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)', margin: '0 0 12px 0'}}>
                  Année en cours : <strong>{settingsData?.academic_year || '2025-2026'}</strong><br/>
                  Utilisez ce bouton en fin d'année pour basculer tous les élèves "Inscrits" en "Ancien élève" et avancer l'année académique.
                </p>
                <button className="btn btn-primary" style={{background: '#d97706', borderColor: '#d97706'}} onClick={handleYearTransition}>
                  Clôturer l'année {settingsData?.academic_year || '2025-2026'}
                </button>
              </div>

              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.acad_year', 'Année Scolaire (Lecture Seule)')}</label>
                  <input type="text" className="form-input" disabled value={settingsData?.academic_year || '2025-2026'} />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.acad_sys', "Système d'évaluation")}</label>
                  <select className="form-select">
                    <option>{t('admin.settings.acad_sys_note', 'Notes sur 20')}</option>
                    <option>{t('admin.settings.acad_sys_comp', 'Compétences (Acquis/En cours/Non acquis)')}</option>
                    <option>{t('admin.settings.acad_sys_let', 'Lettres (A, B, C, D)')}</option>
                  </select>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px'}}>
                  <input type="checkbox" defaultChecked id="sms-abs" style={{width: '18px', height: '18px'}} />
                  <label htmlFor="sms-abs" style={{fontSize: '0.95rem', cursor: 'pointer'}}>{t('admin.settings.acad_sms', 'Envoyer un SMS automatique aux parents après 2 absences non justifiées')}</label>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.sec_title', 'Sécurité & Accès')}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                <div>
                  <h4 style={{marginBottom: '12px'}}>{t('admin.settings.sec_2fa', 'Authentification à deux facteurs (2FA)')}</h4>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div onClick={() => alert("Le système 2FA est en cours de déploiement par le Super Admin.")} style={{width: 44, height: 24, borderRadius: 12, background: 'var(--border-color)', position: 'relative', cursor: 'pointer'}}>
                      <div style={{width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, left: 2}}></div>
                    </div>
                    <span style={{fontSize: '0.95rem'}}>{t('admin.settings.sec_2fa_desc', 'Exiger le 2FA pour tous les administrateurs')}</span>
                  </div>
                </div>
                
                <div>
                  <h4 style={{marginBottom: '12px'}}>Inviter un collaborateur</h4>
                  <form onSubmit={handleInviteAdmin} style={{display: 'flex', gap: '12px', marginBottom: '16px'}}>
                    <input 
                      type="email" 
                      placeholder="Email du collaborateur" 
                      className="form-control" 
                      value={inviteEmail}
                      onChange={(e) => setInviteEmail(e.target.value)}
                      required 
                      style={{flex: 1}}
                    />
                    <select 
                      className="form-control" 
                      value={inviteRole}
                      onChange={(e) => setInviteRole(e.target.value)}
                      style={{width: '200px'}}
                    >
                      <option value="Director">Directeur (Accès Total)</option>
                      <option value="Secretary">Secrétaire (Pas d'accès Finances)</option>
                      <option value="Accountant">Comptable (Finances Uniquement)</option>
                    </select>
                    <button type="submit" className="btn btn-primary">Inviter</button>
                  </form>

                  {invitedAdmins.length > 0 && (
                    <div style={{background: 'var(--surface-color)', border: '1px solid var(--border-color)', borderRadius: '8px', overflow: 'hidden'}}>
                      <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                        <thead>
                          <tr style={{background: 'var(--surface-color-hover)', borderBottom: '1px solid var(--border-color)', textAlign: 'left'}}>
                            <th style={{padding: '12px'}}>Email</th>
                            <th style={{padding: '12px'}}>Rôle</th>
                            <th style={{padding: '12px'}}>Date d'invitation</th>
                            <th style={{padding: '12px', textAlign: 'right'}}>Action</th>
                          </tr>
                        </thead>
                        <tbody>
                          {invitedAdmins.map(admin => (
                            <tr key={admin.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                              <td style={{padding: '12px'}}>{admin.email}</td>
                              <td style={{padding: '12px'}}>
                                <span className={`badge ${admin.role === 'Director' ? 'badge-primary' : admin.role === 'Accountant' ? 'badge-success' : 'badge-warning'}`}>
                                  {admin.role === 'Director' ? 'Directeur' : admin.role === 'Secretary' ? 'Secrétaire' : 'Comptable'}
                                </span>
                              </td>
                              <td style={{padding: '12px', color: 'var(--text-secondary)'}}>
                                {new Date(admin.created_at).toLocaleDateString()}
                              </td>
                              <td style={{padding: '12px', textAlign: 'right'}}>
                                <button 
                                  onClick={() => {
                                    const inviteLink = `${window.location.origin}?invite=${admin.id}`;
                                    navigator.clipboard.writeText(inviteLink);
                                    alert('Lien copié dans le presse-papiers ! Envoyez-le par WhatsApp.');
                                  }}
                                  className="btn btn-outline"
                                  style={{padding: '4px 8px', fontSize: '0.8rem', display: 'inline-flex', alignItems: 'center', gap: '4px'}}
                                >
                                  🔗 Copier le lien
                                </button>
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  )}
                </div>

                <div>
                  <h4 style={{marginBottom: '12px'}}>{t('admin.settings.sec_sessions', 'Sessions Actives')}</h4>
                  <div style={{padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--surface-color-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px'}}>
                    <div>
                      <div style={{fontWeight: 500}}>{navigator.platform} - {navigator.userAgent.includes("Chrome") ? "Chrome" : "Navigateur"}</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{t('admin.settings.sec_active', 'Actif maintenant (Cet appareil)')}</div>
                    </div>
                    <span style={{color: 'var(--success-color)', fontWeight: 'bold'}}>✓ Actif</span>
                  </div>
                  <button onClick={() => alert("Tous les autres appareils ont été déconnectés avec succès.")} className="btn btn-outline" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>
                    Déconnecter tous les autres appareils
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'database' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.db_title', 'Connexion Base de Données (Supabase)')}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{padding: '16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <Icons.CheckCircle />
                  <div>
                    <div style={{fontWeight: 600, color: 'var(--accent-color)'}}>{t('admin.settings.db_connected', 'Connecté à Supabase')} (Projet: xyz-sgpro)</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{t('admin.settings.db_sync', 'Dernière synchronisation : il y a 2 minutes')}</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>{t('admin.settings.db_url', 'URL du Projet')}</label>
                  <input type="text" defaultValue="https://xyzabcdef.supabase.co" disabled className="form-input" style={{opacity: 0.7}} />
                </div>
                <div className="form-group">
                  <label>{t('admin.settings.db_key', 'Clé API (Anon)')}</label>
                  <input type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." disabled className="form-input" style={{opacity: 0.7}} />
                </div>
                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  <button className="btn btn-primary" onClick={() => alert("Sauvegarde en cours...")}>
                    <Icons.Download /> {t('admin.settings.db_btn_sync', 'Forcer la sauvegarde')}
                  </button>
                  <button className="btn btn-outline" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>
                    {t('admin.settings.db_btn_reset', 'Réinitialiser la connexion')}
                  </button>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'abonnement' && (
            <div className="animate-fade-in">
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.sub_title', 'Gérer mon Abonnement')}</h3>
              <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap'}}>
                <div style={{
                  flex: 1, padding: '24px', borderRadius: '16px', minWidth: '250px',
                  border: `2px solid ${currentSchoolPlan === 'Standard' ? 'var(--primary-color)' : 'var(--border-color)'}`,
                  background: currentSchoolPlan === 'Standard' ? 'rgba(99, 102, 241, 0.05)' : 'var(--surface-color)',
                  position: 'relative'
                }}>
                  {currentSchoolPlan === 'Standard' && <div style={{position: 'absolute', top: '-12px', right: '24px', background: 'var(--primary-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'}}>{t('admin.settings.sub_current', 'Plan Actuel')}</div>}
                  <h4 style={{fontSize: '1.2rem', marginBottom: '8px'}}>Standard</h4>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px'}}>{formatNum(0)} F <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>{t('admin.settings.sub_month', '/mois')}</span></p>
                  <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    <li>✓ {t('admin.settings.sub_std_f1', 'Gestion des élèves et absences')}</li>
                    <li>✓ {t('admin.settings.sub_std_f2', 'Gestion des professeurs')}</li>
                    <li>✓ {t('admin.settings.sub_std_f3', 'Notes et bulletins')}</li>
                  </ul>
                  {currentSchoolPlan === 'Standard' ? (
                    <button className="btn" disabled style={{width: '100%', background: 'var(--border-color)', color: 'var(--text-secondary)'}}>{t('admin.settings.sub_btn_active', 'Plan Actif')}</button>
                  ) : (
                    <button className="btn" style={{width: '100%', border: '1px solid var(--border-color)'}} onClick={async () => {
                      if (currentSchoolId) {
                        await supabase.from('schools').update({ subscription_plan: 'Standard' }).eq('id', currentSchoolId);
                      }
                      setCurrentSchoolPlan('Standard');
                    }}>{t('admin.settings.sub_btn_downgrade', 'Rétrograder')}</button>
                  )}
                </div>

                <div style={{
                  flex: 1, padding: '24px', borderRadius: '16px', minWidth: '250px',
                  border: `2px solid ${currentSchoolPlan === 'Pro' ? 'var(--accent-color)' : 'var(--border-color)'}`,
                  background: currentSchoolPlan === 'Pro' ? 'rgba(16, 185, 129, 0.05)' : 'var(--surface-color)',
                  position: 'relative'
                }}>
                  {currentSchoolPlan === 'Pro' && <div style={{position: 'absolute', top: '-12px', right: '24px', background: 'var(--accent-color)', color: 'white', padding: '4px 12px', borderRadius: '12px', fontSize: '0.8rem', fontWeight: 'bold'}}>{t('admin.settings.sub_current', 'Plan Actuel')}</div>}
                  <h4 style={{fontSize: '1.2rem', marginBottom: '8px'}}>Pro</h4>
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px'}}>{formatNum(25000)} F <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>{t('admin.settings.sub_month', '/mois')}</span></p>
                  <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    <li>✓ {t('admin.settings.sub_pro_f1', 'Toutes les fonctions Standard')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f2', 'Comptabilité & Facturation')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f3', 'Ressources Humaines')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f4', 'Communication (SMS/Email)')}</li>
                  </ul>
                  {currentSchoolPlan === 'Pro' ? (
                    <button className="btn" disabled style={{width: '100%', background: 'var(--border-color)', color: 'var(--text-secondary)'}}>{t('admin.settings.sub_btn_active', 'Plan Actif')}</button>
                  ) : (
                    <button className="btn btn-primary" style={{width: '100%', background: 'var(--accent-color)', borderColor: 'var(--accent-color)', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px'}} onClick={() => {
                      window.open("https://wa.me/2250505617743?text=" + encodeURIComponent("Bonjour, je souhaite souscrire à l'abonnement Pro pour mon établissement pour débloquer toutes les fonctionnalités."), "_blank");
                    }}>
                      <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"></path></svg>
                      Passer en Pro (WhatsApp)
                    </button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (recoveryMode) {
    return <PasswordRecovery onComplete={() => {
      setRecoveryMode(false);
      setSession(null);
      setCurrentView('landing');
    }} />;
  }

    if (currentView === 'landing' && !session && !studentSession && !teacherSession && !committeeSession) {
    return <LandingPage onLoginClick={() => setCurrentView('app')} onSuperAdminClick={() => { setIsSuperAdminFlow(true); setCurrentView('app'); }} />;
  }

  if (!session && !studentSession && !teacherSession && !committeeSession) {
    if (isSuperAdminFlow) {
      return <SuperAdminAuth onBack={() => { setIsSuperAdminFlow(false); setCurrentView('landing'); }} />;
    }
    return <Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} onCommitteeLogin={(c) => setCommitteeSession(c)} onBack={() => setCurrentView('landing')} />;
  }

  if (studentSession) {
    return <StudentPortal student={studentSession} onLogout={() => setStudentSession(null)} />;
  }

  if (committeeSession) {
    return <CommitteePortal session={committeeSession} onLogout={() => setCommitteeSession(null)} onOpenBulletin={(studentId, period, classId) => loadBulletinData(classId, period, studentId)} />;
  }

  if (teacherSession) {
    return <TeacherPortal session={teacherSession} onLogout={() => setTeacherSession(null)} onOpenBulletin={(studentId, period, classId) => loadBulletinData(classId, period, studentId)} />;
  }

  if (showSuperAdmin) {
    return <SuperAdminPortal session={session} onExit={() => { setShowSuperAdmin(false); localStorage.removeItem('sges_super_admin_mode'); }} onSwitchToSchool={(id) => { setCurrentSchoolId(id); setShowSuperAdmin(false); localStorage.removeItem('sges_super_admin_mode'); }} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          {(adminSchools?.find((s: any) => s.id === currentSchoolId) as any)?.logo_url ? (
            <img src={(adminSchools?.find((s: any) => s.id === currentSchoolId) as any).logo_url} alt="Logo" style={{ width: '32px', height: '32px', borderRadius: '8px', objectFit: 'cover' }} />
          ) : (
            <div className="logo-icon">{(adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'É').charAt(0).toUpperCase()}</div>
          )}
          <span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{adminSchools?.find((s: any) => s.id === currentSchoolId)?.name || settingsData?.school_name || 'Établissement'}</span>
        </div>
        
        <ul className="nav-menu">
          {(currentAdminRole === 'Director' || currentAdminRole === 'Secretary') && (
            <li className="nav-item" onClick={() => { setIsQuickStartModalOpen(true); setIsMobileMenuOpen(false); }} style={{ background: 'var(--accent-color, #10b981)', color: 'white' }}>
              <span>🚀</span> {t('admin.sidebar.quickstart', 'Guide de démarrage')}
            </li>
          )}
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}>
            <Icons.Home /> {t('admin.sidebar.dashboard', 'Tableau de bord')}
          </li>
          
          {(currentAdminRole === 'Director' || currentAdminRole === 'Secretary') && (
            <>
              <li className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => { setActiveTab('students'); setIsMobileMenuOpen(false); }}>
                <Icons.Users /> {t('admin.sidebar.students', 'Gestion Élèves')}
              </li>
              <li className={`nav-item ${activeTab === 'absences' ? 'active' : ''}`} onClick={() => { setActiveTab('absences'); setIsMobileMenuOpen(false); }}>
                <Icons.Activity /> {t('admin.sidebar.absences', 'Gestion Absences')}
              </li>
              <li className={`nav-item ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => { setActiveTab('parents'); setIsMobileMenuOpen(false); }}>
                <Icons.Heart /> {t('admin.sidebar.parents', "Parents d'Élèves")}
              </li>
              <li className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => { setActiveTab('teachers'); setIsMobileMenuOpen(false); }}>
                <Icons.GraduationCap /> {t('admin.sidebar.teachers', 'Enseignants')}
              </li>
              <li className={`nav-item ${activeTab === 'pedagogy' ? 'active' : ''}`} onClick={() => { setActiveTab('pedagogy'); setIsMobileMenuOpen(false); }}>
                <Icons.BookOpen /> {t('admin.sidebar.pedagogy', 'Classes & Pédagogie')}
              </li>
              <li className={`nav-item ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => { setActiveTab('schedules'); setIsMobileMenuOpen(false); }}>
                <Icons.Calendar /> {t('admin.sidebar.schedules', 'Emplois du Temps')}
              </li>
              <li className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => { setActiveTab('grades'); setIsMobileMenuOpen(false); }}>
                <Icons.FileText /> {t('admin.sidebar.grades', 'Évaluations & Notes')}
              </li>
              <li className={`nav-item ${activeTab === 'bulletins' ? 'active' : ''}`} onClick={() => { setActiveTab('bulletins'); setIsMobileMenuOpen(false); }}>
                <Icons.FileText /> {t('admin.sidebar.bulletins', 'Bulletins')}
              </li>
              <li className={`nav-item ${activeTab === 'communication' ? 'active' : ''}`} onClick={() => { setActiveTab('communication'); setIsMobileMenuOpen(false); }}>
                <Icons.MessageSquare /> {t('admin.sidebar.communication', 'Communication')}
              </li>
            </>
          )}

          {(currentAdminRole === 'Director' || currentAdminRole === 'Accountant') && (
            <>
              <li className={`nav-item ${activeTab === 'scolarite' ? 'active' : ''}`} onClick={() => { setActiveTab('scolarite'); setIsMobileMenuOpen(false); }}>
                <Icons.CreditCard /> {t('admin.sidebar.finance', 'Comptabilité & Scolarité')}
              </li>
              <li className={`nav-item ${activeTab === 'depenses' ? 'active' : ''}`} onClick={() => { setActiveTab('depenses'); setIsMobileMenuOpen(false); }}>
                <Icons.CreditCard /> {t('admin.sidebar.expenses', 'Dépenses')}
              </li>
            </>
          )}

          {currentAdminRole === 'Director' && (
            <>
              <li className={`nav-item ${activeTab === 'rh' ? 'active' : ''}`} onClick={() => { setActiveTab('rh'); setIsMobileMenuOpen(false); }}>
                <Icons.Briefcase /> {t('admin.sidebar.rh', 'RH & Admin')}
              </li>
              <li style={{flex: 1}}></li>
              <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}>
                <Icons.Settings /> {t('admin.sidebar.settings', 'Paramètres')}
              </li>
            </>
          )}
          <li className="nav-item" onClick={() => supabase.auth.signOut()} style={{color: 'var(--danger-color, #ef4444)', marginTop: 'auto'}}>
            <Icons.LogOut /> {t('admin.header.logout', 'Se déconnecter')}
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div style={{display: 'flex', alignItems: 'center'}}>
            <button className="mobile-menu-btn" onClick={() => setIsMobileMenuOpen(true)}>
              <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div className="header-search hide-on-mobile">
              <Icons.Search />
              <input type="text" placeholder={t('admin.header.search', 'Rechercher...')} />
            </div>
            {adminSchools && adminSchools.length > 1 && (
              <select 
                className="form-select hide-on-mobile" 
                style={{marginLeft: 16, maxWidth: 200, padding: '8px 12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--surface-color)', color: 'var(--text-color)'}}
                value={currentSchoolId || ''}
                onChange={(e) => setCurrentSchoolId(e.target.value)}
              >
                {adminSchools.map((s: any) => (
                  <option key={s.id} value={s.id}>{s.name}</option>
                ))}
              </select>
            )}
            {adminSchools && adminSchools.length < 1 && (
              <button className="btn btn-outline hide-on-mobile" style={{padding: '6px 12px', fontSize: '0.9rem', marginLeft: '8px'}} onClick={() => setShowSchoolModal(true)}>
                + Établissement
              </button>
            )}
          </div>
          
          
          <div className="header-actions">
            <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={toggleLanguage}>
              {i18n.language.startsWith('ar') ? 'Français' : 'العربية'}
            </button>
            <button className="btn btn-primary" onClick={() => setActiveModal('quickCreate')}>
              <Icons.Plus /> {t('admin.header.new', 'Nouveau')}
            </button>
            <button className="action-btn" onClick={() => alert(t('admin.header.no_notifications', "Vous n'avez pas de nouvelles notifications."))}>
              <Icons.Bell />
              <span className="action-badge"></span>
            </button>
            <div className="user-profile" onClick={() => setIsProfileMenuOpen(!isProfileMenuOpen)} style={{position: 'relative', cursor: 'pointer'}}>
              <div className="avatar">A</div>
              <div className="user-info">
                <span className="user-name">{session?.user?.email || 'Adama Traoré'}</span>
                <span className="user-role">{t('admin.header.director', 'Directeur')}</span>
              </div>
              
              {isProfileMenuOpen && (
                <div className="profile-dropdown" style={{
                  position: 'absolute', 
                  top: '100%', 
                  right: 0, 
                  marginTop: '10px', 
                  background: 'var(--surface-color)', 
                  border: '1px solid var(--border-color)', 
                  borderRadius: '12px', 
                  padding: '8px', 
                  minWidth: '200px', 
                  boxShadow: '0 10px 25px rgba(0,0,0,0.5)',
                  zIndex: 100
                }}>
                  <div className="dropdown-item" onClick={() => supabase.auth.signOut()} style={{
                    padding: '10px 16px', 
                    display: 'flex', 
                    alignItems: 'center', 
                    gap: '12px', 
                    cursor: 'pointer', 
                    color: 'var(--danger-color, #ef4444)',
                    borderRadius: '8px',
                    fontWeight: 500,
                  }} onMouseOver={(e) => e.currentTarget.style.background = 'var(--surface-color-hover)'} onMouseOut={(e) => e.currentTarget.style.background = 'transparent'}>
                    <Icons.LogOut />
                    <span>{t('admin.header.logout', 'Se déconnecter')}</span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </header>

        {/* Dashboard Scroll Area */}
        <div className="dashboard-scroll">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'absences' && renderAbsences()}
          {activeTab === 'pedagogy' && renderPedagogy()}
          {activeTab === 'schedules' && renderSchedules()}
          {activeTab === 'communication' && renderCommunication()}
          {activeTab === 'bulletins' && renderBulletins()}
          {activeTab === 'rh' && renderRH()}
          {activeTab === 'depenses' && renderDepenses()}
          {activeTab === 'teachers' && renderTeachers()}
          {activeTab === 'parents' && renderParents()}
          {activeTab === 'scolarite' && renderScolarite()}
          {activeTab === 'grades' && renderGrades()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Dynamic Modal Renderer */}
      {activeModal && (
        <div className="modal-overlay">
          <div className="modal-content" style={['global_grades', 'bulletin_preview', 'receipt_preview'].includes(activeModal) ? {maxWidth: '1600px', width: '98%'} : {}} onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeModal === 'quickCreate' && t('admin.modals.quickCreate', "Menu de Création Rapide")}
                {activeModal === 'payment' && t('admin.modals.payment', "Enregistrer un Paiement")}
                {activeModal === 'absence' && t('admin.modals.absence', "Signaler une Absence")}
                {activeModal === 'student' && (editEntity ? "Modifier l'Élève" : t('admin.modals.student', "Nouvelle Inscription"))}
                {activeModal === 'reinscription' && "Réinscription de l'élève"}
                {activeModal === 'teacher' && t('admin.modals.teacher', "Ajouter un Enseignant")}
                {activeModal === 'committee_member' && "Membre du Comité d'examen"}
                {activeModal === 'employee' && t('admin.modals.employee', "Ajouter un Employé")}
                {activeModal === 'parent' && t('admin.modals.parent', "Ajouter un Parent")}
                {activeModal === 'parent_children' && "Gestion des enfants"}
                {activeModal === 'parent_invoices' && "Factures du Parent"}
                {activeModal === 'parent_children' && "Gestion des enfants"}
                {activeModal === 'message' && t('admin.modals.message', "Nouveau Message")}
                {activeModal === 'bulletin' && t('admin.modals.bulletin', "Générer Bulletins")}
                {activeModal === 'schedule' && t('admin.modals.course', "Planifier un cours")}

                {activeModal === 'class' && t('admin.modals.class', "Créer une Classe")}
                {activeModal === 'global_grades' && "Saisie Globale des Notes"}
   {activeModal === 'bulletin_preview' && "Aperçu des Bulletins"}
   {activeModal === 'receipt_preview' && "Reçu de Paiement"}
   {activeModal === 'coefficients' && "Coefficients par Matière"}
   {activeModal === 'import' && "Importer des Élèves"}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Quick Create Menu */}
              {activeModal === 'quickCreate' && (
                <div className="form-grid">
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('students'); setActiveModal('student'); }}>
                    <div className="creation-icon"><Icons.UserPlus /></div>
                    <div><h4>{t('admin.modals.quick_student_title', 'Nouvel Élève')}</h4><p>{t('admin.modals.quick_student_desc', 'Inscrire un étudiant.')}</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('scolarite'); setActiveModal('payment'); }}>
                    <div className="creation-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}}><Icons.CreditCard /></div>
                    <div><h4>{t('admin.modals.quick_payment_title', 'Encaisser Paiement')}</h4><p>{t('admin.modals.quick_payment_desc', 'Frais de scolarité.')}</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('communication'); setActiveModal('message'); }}>
                    <div className="creation-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}}><Icons.Mail /></div>
                    <div><h4>{t('admin.modals.quick_message_title', 'Nouveau Message')}</h4><p>{t('admin.modals.quick_message_desc', 'Contacter les parents.')}</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('bulletins'); setActiveModal('bulletin'); }}>
                    <div className="creation-icon" style={{color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)'}}><Icons.FileText /></div>
                    <div><h4>{t('admin.modals.quick_bulletin_title', 'Nouveau Bulletin')}</h4><p>{t('admin.modals.quick_bulletin_desc', 'Générer des notes.')}</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('pedagogy'); setActiveModal('class'); }}>
                    <div className="creation-icon" style={{color: '#8b5cf6', background: 'rgba(139, 92, 246, 0.1)'}}><Icons.BookOpen /></div>
                    <div><h4>{t('admin.modals.quick_class_title', 'Nouvelle Classe')}</h4><p>{t('admin.modals.quick_class_desc', 'Ajouter une classe.')}</p></div>
                  </div>
                </div>
              )}

              {/* New School Form */}

              
              {activeModal === 'reinscription' && editEntity && (() => {
                let autoClassId = editEntity.class_id;
                let message = "Calcul de la moyenne en cours...";
                let studentMoyenne: any = null;

                if (studentMoyenne !== null) {
                  if (studentMoyenne >= 10) {
                    const currentClass = classesData.find(c => c.id === editEntity.class_id);
                    if (currentClass && currentClass.next_class_id) {
                      autoClassId = currentClass.next_class_id;
                      const nextClass = classesData.find(c => c.id === autoClassId);
                      message = `Moyenne d'admission atteinte (${studentMoyenne.toFixed(2)}/20). Passage automatique en ${nextClass?.name || 'Classe Supérieure'}.`;
                    } else {
                      message = `Moyenne d'admission atteinte (${studentMoyenne.toFixed(2)}/20) mais aucune classe supérieure définie.`;
                    }
                  } else {
                    message = `Moyenne insuffisante (${studentMoyenne.toFixed(2)}/20). Redoublement conseillé.`;
                  }
                }

                return (
                  <form key={editEntity.id} onSubmit={handleFormSubmit}>
                    <div style={{background: 'rgba(59, 130, 246, 0.05)', padding: '16px', borderRadius: '8px', marginBottom: '20px', border: '1px solid rgba(59, 130, 246, 0.2)'}}>
                      <h3 style={{margin: 0, color: 'var(--primary-color)'}}>{editEntity.first_name} {editEntity.last_name}</h3>
                      <p style={{margin: '4px 0 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Matricule: {editEntity.matricule}</p>
                    </div>

                    <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>1. Affectation</h3>
                    
                    {studentMoyenne !== null ? (
                      <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.1)' : 'rgba(239, 68, 68, 0.1)', border: `1px solid ${studentMoyenne >= 10 ? 'rgba(16, 185, 129, 0.3)' : 'rgba(239, 68, 68, 0.3)'}`, color: studentMoyenne >= 10 ? 'var(--success-color)' : 'var(--danger-color)', fontWeight: 500}}>
                        {message}
                      </div>
                    ) : (
                       <div style={{marginBottom: '16px', padding: '12px', borderRadius: '6px', backgroundColor: 'rgba(59, 130, 246, 0.1)', border: '1px solid rgba(59, 130, 246, 0.3)', color: 'var(--primary-color)', fontWeight: 500}}>
                        {message}
                      </div>
                    )}

                    <div className="form-group">
                      <label>Nouvelle Classe</label>
                      <select name="class_id" className="form-select" required defaultValue={autoClassId}>
                        <option value="">Choisir une classe...</option>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>

                    <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>2. Frais de Réinscription</h3>
                    <div className="form-group">
                      <label>Montant des frais de réinscription (CFA)</label>
                      <input type="number" name="reg_fee_amount" className="form-input" required placeholder="Ex: 25000" />
                      <small style={{color: 'var(--text-secondary)'}}>Mettez 0 si l'élève n'a exceptionnellement pas de frais à payer.</small>
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
                      <button type="submit" className="btn btn-primary">Encaisser & Voir Reçu</button>
                    </div>
                  </form>
                );
              })()}

              {/* Class Form */}
              {activeModal === 'class' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.class_name', 'Nom de la classe')}</label>
                    <input type="text" name="name" className="form-input" placeholder="Ex: 6ème A, Terminale S1" required defaultValue={editEntity?.name || ''} />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.class_level', 'Niveau')}</label>
                    <select name="level" className="form-select" required defaultValue={editEntity?.level || 'Collège'}>
                      <option value="Maternelle">Maternelle</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Scolarité annuelle par défaut (F)</label>
                    <input type="number" name="tuition_fee" className="form-input" placeholder="Ex: 500000" defaultValue={editEntity?.tuition_fee || ''} />
                  </div>
                  <div className="form-group">
                    <label>Classe Supérieure (Progression automatique)</label>
                    <select name="next_class_id" className="form-select" defaultValue={editEntity?.next_class_id || ''}>
                      <option value="">Aucune (Dernière classe)</option>
                      {classesData.filter(c => c.id !== editEntity?.id).map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                    <small style={{color: 'var(--text-secondary)'}}>Sera utilisée automatiquement lors de la réinscription si l'élève a la moyenne d'admission.</small>
                  </div>
                  <div className="form-group">
                    <label>Professeur Principal</label>
                    <select name="principal_teacher_id" className="form-select" defaultValue={editEntity?.principal_teacher_id || ''}>
                      <option value="">-- Aucun --</option>
                      {teachersData.map(t => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                    <small style={{color: 'var(--text-secondary)'}}>Ce professeur aura le droit de consulter et générer les bulletins complets de cette classe.</small>
                  </div>
                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{editEntity ? t('admin.modals.save', 'Sauvegarder') : t('admin.modals.create', 'Créer la classe')}</button>
                  </div>
                </form>
              )}

              {/* Payment Form */}
              {activeModal === 'payment' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.student_select', 'Élève')}</label>
                    <input 
                      type="text" 
                      list="payment-students" 
                      className="form-input" 
                      placeholder="Rechercher matricule, élève ou parent..." 
                      required
                      defaultValue={
                        preselectedStudentId 
                          ? (() => {
                              const s = studentsData.find(st => st.id === preselectedStudentId);
                              if (!s) return "";
                              const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? ` - Parent: ${s.student_parents[0].parents.first_name} ${s.student_parents[0].parents.last_name}` : '';
                              return `${s.first_name} ${s.last_name} (${s.matricule})${parentStr}`;
                            })()
                          : ""
                      }
                      onChange={(e) => {
                        const val = e.target.value;
                        const match = studentsData.find(s => {
                          const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? ` - Parent: ${s.student_parents[0].parents.first_name} ${s.student_parents[0].parents.last_name}` : '';
                          return `${s.first_name} ${s.last_name} (${s.matricule})${parentStr}` === val;
                        });
                        if (match) {
                           e.target.setCustomValidity('');
                           const hiddenInput = document.getElementById('hidden_student_id') as HTMLInputElement;
                           if(hiddenInput) hiddenInput.value = match.id;
                        } else {
                           e.target.setCustomValidity('Veuillez sélectionner un élève dans la liste');
                           const hiddenInput = document.getElementById('hidden_student_id') as HTMLInputElement;
                           if(hiddenInput) hiddenInput.value = '';
                        }
                      }}
                    />
                    <datalist id="payment-students">
                      {studentsData.map(s => {
                        const parentStr = s.student_parents && s.student_parents.length > 0 && s.student_parents[0].parents ? ` - Parent: ${s.student_parents[0].parents.first_name} ${s.student_parents[0].parents.last_name}` : '';
                        return <option key={s.id} value={`${s.first_name} ${s.last_name} (${s.matricule})${parentStr}`} />;
                      })}
                    </datalist>
                    <input type="hidden" name="student_id" id="hidden_student_id" defaultValue={preselectedStudentId || ""} required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.motif', 'Motif du paiement')}</label>
                    <select name="motif" className="form-select" required>
                      <option>Frais d'inscription</option>
                      <option>Mensualité (Scolarité)</option>
                      <option>Frais de cantine</option>
                      <option>Transport</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.amount', 'Montant (F)')}</label>
                    <input type="number" name="amount" className="form-input" placeholder="Ex: 25000" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.payment_method', 'Mode de paiement')}</label>
                    <select name="payment_method" className="form-select" required>
                      <option>Espèces</option>
                      <option>Chèque</option>
                      <option>Virement / Mobile Money</option>
                    </select>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={() => { setPreselectedStudentId(null); closeModal(); }}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.submit_payment', 'Encaisser & Voir Reçu')}</button>
                  </div>
                </form>
              )}

              {/* Message Form */}
              {activeModal === 'message' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.recipient', 'Destinataire(s)')}</label>
                    <select className="form-select" required>
                      <option>Tous les parents d'une classe...</option>
                      <option>Parents - Terminale S1</option>
                      <option>Parent spécifique...</option>
                      <option>Tous les enseignants</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.subject', 'Sujet')}</label>
                    <input type="text" className="form-input" placeholder="Sujet de votre message" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.message_body', 'Message')}</label>
                    <textarea className="form-textarea" placeholder="Rédigez votre message ici..." required></textarea>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary"><Icons.Send /> {t('admin.modals.send', 'Envoyer')}</button>
                  </div>
                </form>
              )}

              {/* Absence Form */}
              {activeModal === 'absence' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.student_concerned', 'Élève concerné')}</label>
                    <select name="student_id" className="form-select" required>
                      <option value="">Rechercher un élève...</option>
                      {studentsData.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.date', 'Date')}</label>
                      <input type="date" name="absence_date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.duration', 'Durée / Heure')}</label>
                      <select name="duration" className="form-select" required>
                        <option>Journée entière</option>
                        <option>Matinée</option>
                        <option>Après-midi</option>
                        <option>1 heure (Retard)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.absence_motif', 'Motif')}</label>
                    <select name="motif" className="form-select" required>
                      <option>Non justifié</option>
                      <option>Maladie</option>
                      <option>Problème familial</option>
                      <option>Retard de transport</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.comments', 'Commentaire (Optionnel)')}</label>
                    <textarea name="comments" className="form-textarea" placeholder="Détails supplémentaires..." style={{minHeight: '80px'}}></textarea>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary" style={{background: 'var(--warning-color)', color: 'black', border: 'none'}}>{t('admin.modals.save_absence', "Enregistrer l'absence")}</button>
                  </div>
                </form>
              )}

              {/* Student Form */}
              {activeModal === 'student' && (
                <form onSubmit={handleFormSubmit}>
                  <h3 style={{marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>{t('admin.modals.student_info', "1. Informations de l'Élève")}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.last_name', 'Nom')}</label>
                      <input type="text" name="last_name" className="form-input" required defaultValue={editEntity?.last_name || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.photo', 'Photo de profil')}</label>
                      <input type="file" name="photo" accept="image/*" className="form-input" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>Matricule (optionnel)</label>
                      <input type="text" name="matricule" className="form-input" placeholder="Généré auto si vide" defaultValue={editEntity?.matricule || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.birth_date', 'Date de Naissance')}</label>
                      <input type="date" name="birth_date" className="form-input" required defaultValue={editEntity?.birth_date || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.class_assign', 'Classe (Affectation)')}</label>
                      <select name="class_id" className="form-select" required defaultValue={editEntity?.class_id || ""}>
                        <option value="">Choisir une classe...</option>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid" style={{marginTop: '16px'}}>
                    <div className="form-group">
                      <label>Scolarité personnalisée (Optionnel, F)</label>
                      <input type="number" name="tuition_fee" className="form-input" placeholder="Laisser vide pour utiliser le tarif de la classe" defaultValue={editEntity?.tuition_fee || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}</label>
                      <input type="text" name="password" className="form-input" placeholder={editEntity ? "Laisser vide pour ne pas changer" : "passer123"} />
                    </div>
                  </div>

                  {!editEntity && (<><h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>{t('admin.modals.parent_info', '2. Informations du Parent / Tuteur')}</h3>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.parent_last_name', 'Nom du parent')}</label>
                      <input type="text" name="parent_last_name" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.parent_first_name', 'Prénom du parent')}</label>
                      <input type="text" name="parent_first_name" className="form-input" />
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.phone', 'Téléphone')}</label>
                      <input type="tel" name="parent_phone" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.email', 'Email')}</label>
                      <input type="email" name="parent_email" className="form-input" />
                    </div>
                  </div>

                  <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>{t('admin.modals.fees_info', "3. Frais d'Inscription & Scolarité")}</h3>
                  <div className="form-group">
                    <label>{t('admin.modals.reg_fee_amount', "Montant des frais d'inscription (CFA)")}</label>
                    <input type="number" name="reg_fee_amount" className="form-input" required placeholder="Ex: 50000" />
                    <small style={{color: 'var(--text-secondary)'}}>Saisissez obligatoirement un montant (mettez 0 si gratuité).</small>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.payment_method', 'Mode de paiement')}</label>
                      <select name="reg_fee_method" className="form-select">
                        <option value="Espèces">Espèces</option>
                        <option value="Chèque">Chèque</option>
                        <option value="Virement">Virement</option>
                        <option value="Mobile Money">Mobile Money</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.status', 'Statut')}</label>
                      <select name="reg_fee_status" className="form-select">
                        <option value="Payée">Payée (Immédiatement)</option>
                        <option value="En attente">En attente (Paiement ultérieur)</option>
                      </select>
                    </div>
                  </div>

                  </>)}
                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{editEntity ? 'Mettre à jour' : t('admin.modals.complete_registration', "Valider l'inscription complète")}</button>
                  </div>
                </form>
              )}

              {activeModal === 'import' && (
                <form onSubmit={async (e) => {
                  e.preventDefault();
                  const fileInput = document.getElementById('csv_upload') as HTMLInputElement;
                  if (!fileInput.files || fileInput.files.length === 0) {
                    alert("Veuillez sélectionner un fichier CSV");
                    return;
                  }
                  
                  const btn = e.nativeEvent.submitter as HTMLButtonElement;
                  if (btn) { btn.disabled = true; btn.textContent = 'Importation...'; }
                  
                  const file = fileInput.files[0];
                  const reader = new FileReader();
                  reader.onload = async (event) => {
                    try {
                      const csvText = event.target?.result as string;
                      if (!csvText) throw new Error("Fichier vide");
                      
                      const lines = csvText.split('\n');
                      const headers = lines[0].toLowerCase().split(/,|;/).map(h => h.trim().replace(/["']/g, ''));
                      
                      // Attendu: Nom, Prénom
                      const requiredCols = ['nom', 'prénom'];
                      const hasRequired = requiredCols.every(req => headers.some(h => h.includes(req) || h.includes('prenom')));
                      if (!hasRequired) {
                        alert("Format CSV invalide. Les colonnes 'Nom' et 'Prénom' sont obligatoires.");
                        if(btn) { btn.disabled = false; btn.textContent = 'Lancer l\'importation'; }
                        return;
                      }

                      const idxNom = headers.findIndex(h => h.includes('nom'));
                      const idxPrenom = headers.findIndex(h => h.includes('prénom') || h.includes('prenom'));
                      const idxDate = headers.findIndex(h => h.includes('date') || h.includes('naissance'));
                      const idxMatricule = headers.findIndex(h => h.includes('matricule'));

                      const classId = (document.getElementById('import_class_id') as HTMLSelectElement).value;

                      const studentsToInsert = [];
                      for (let i = 1; i < lines.length; i++) {
                        if (!lines[i].trim()) continue;
                        const cols = lines[i].split(/,|;/).map(c => c.trim().replace(/["']/g, ''));
                        const nom = cols[idxNom];
                        const prenom = cols[idxPrenom];
                        if (!nom || !prenom) continue;

                        let parsedDate = '2000-01-01';
                        if (idxDate !== -1 && cols[idxDate]) {
                          let rawDate = cols[idxDate].trim();
                          if (rawDate.includes('/')) {
                            const parts = rawDate.split('/');
                            if (parts.length === 3) {
                              let year = parts[2];
                              if (year.length === 2) year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
                              parsedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                          } else if (rawDate.includes('-') && rawDate.split('-')[0].length <= 2) {
                            const parts = rawDate.split('-');
                            if (parts.length === 3) {
                              let year = parts[2];
                              if (year.length === 2) year = parseInt(year) > 50 ? `19${year}` : `20${year}`;
                              parsedDate = `${year}-${parts[1].padStart(2, '0')}-${parts[0].padStart(2, '0')}`;
                            }
                          } else {
                            parsedDate = rawDate;
                          }
                        }

                        studentsToInsert.push({
                          school_id: currentSchoolId,
                          first_name: prenom,
                          last_name: nom,
                          birth_date: parsedDate,
                          matricule: (idxMatricule !== -1 && cols[idxMatricule]) ? cols[idxMatricule] : `STU-${Math.floor(Math.random()*100000)}`,
                          class_id: classId || null
                        });
                      }

                      if (studentsToInsert.length === 0) {
                        alert("Aucune donnée valide trouvée.");
                        if(btn) { btn.disabled = false; btn.textContent = 'Lancer l\'importation'; }
                        return;
                      }

                      const { error } = await supabase.from('students').insert(studentsToInsert);
                      if (error) throw error;

                      alert(studentsToInsert.length + " élèves importés avec succès !");
                      fetchStudents();
                      closeModal();
                    } catch (err: any) {
                      alert("Erreur lors de l'importation: " + err.message);
                      if(btn) { btn.disabled = false; btn.textContent = 'Lancer l\'importation'; }
                    }
                  };
                  reader.readAsText(file);
                }}>
                  <div className="form-group" style={{marginBottom: '24px'}}>
                    <div style={{background: 'var(--surface-color-hover)', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                      <h4 style={{marginBottom: '8px', fontWeight: 'bold'}}>Format attendu (Fichier CSV)</h4>
                      <p style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Créez un fichier Excel (.csv) avec les colonnes suivantes (les noms doivent être sur la première ligne) :</p>
                      <ul style={{fontSize: '0.9rem', marginTop: '8px', paddingLeft: '24px', color: 'var(--text-secondary)'}}>
                        <li><strong>Nom</strong> (obligatoire)</li>
                        <li><strong>Prénom</strong> (obligatoire)</li>
                        <li><strong>Date de naissance</strong> (YYYY-MM-DD, optionnel)</li>
                        <li><strong>Matricule</strong> (optionnel)</li>
                      </ul>
                      <button type="button" className="btn btn-outline" style={{marginTop: '12px'}} onClick={() => {
                        const csvContent = "data:text/csv;charset=utf-8,Nom,Prénom,Date de naissance,Matricule\nDupont,Jean,2010-05-14,MAT-101\n";
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", "modele_import_eleves.csv");
                        document.body.appendChild(link);
                        link.click();
                        document.body.removeChild(link);
                      }}><Icons.Download /> Télécharger un modèle CSV</button>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Affecter ces élèves à une classe (Optionnel)</label>
                    <select id="import_class_id" className="form-select">
                      <option value="">Aucune classe (Affectation plus tard)</option>
                      {classesData.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group" style={{marginTop: '16px'}}>
                    <label>Fichier CSV</label>
                    <input type="file" id="csv_upload" accept=".csv" className="form-input" style={{padding: '8px'}} />
                  </div>
                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">Lancer l'importation</button>
                  </div>
                </form>
              )}

              {/* General Form for Employees/Teachers/Parents */}
              {['employee', 'teacher', 'parent', 'committee_member'].includes(activeModal) && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.last_name', 'Nom')}</label>
                      <input type="text" name="last_name" className="form-input" required defaultValue={editEntity?.last_name || ""} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required defaultValue={editEntity?.first_name || ""} />
                    </div>
                  </div>
                  {activeModal !== 'committee_member' && (
                    <div className="form-group">
                      <label>{t('admin.modals.phone', 'Numéro de Téléphone')}</label>
                      <input type="tel" name="phone" className="form-input" placeholder="+221 77 000 00 00" required defaultValue={editEntity?.phone || ""} />
                    </div>
                  )}
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.email', 'Email')}</label>
                      <input type="email" name="email" className="form-input" required={['teacher', 'committee_member'].includes(activeModal)} defaultValue={editEntity?.email || ""} />
                    </div>
                    {['teacher', 'employee', 'committee_member'].includes(activeModal) && (
                      <div className="form-group">
                        <label>{t('admin.modals.password_optional', 'Mot de passe (facultatif)')}</label>
                        <input type="text" name="password" className="form-input" placeholder={editEntity ? "Laisser vide pour ne pas changer" : "Généré automatiquement"} />
                      </div>
                    )}
                  </div>
                  {activeModal === 'teacher' && (
                    <div className="form-group">
                      <label>{t('admin.modals.taught_subject', 'Matières enseignées')}</label>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', maxHeight: '150px', overflowY: 'auto', border: '1px solid var(--border-color)', padding: '10px', borderRadius: '8px'}}>
                        {allSubjects.map(subj => (
                          <label key={subj} style={{display: 'flex', alignItems: 'center', gap: '8px', cursor: 'pointer', margin: 0, fontWeight: 'normal'}}>
                            <input type="checkbox" name="subject" value={subj} defaultChecked={editEntity?.subject?.includes(subj)} />
                            {subj}
                          </label>
                        ))}
                      </div>
                      <small style={{color: '#64748b', fontSize: '0.8rem'}}>Vous pouvez cocher plusieurs matières.</small>
  <div style={{marginTop: '10px', display: 'flex', gap: '8px'}}>
    <input type="text" className="form-input" placeholder="Ajouter une autre matière..." id="customSubjectInput" onKeyDown={(e) => {
      if (e.key === 'Enter') {
        e.preventDefault();
        const val = e.currentTarget.value.trim();
        if (val && !allSubjects.includes(val)) {
          setCustomSubjects([...customSubjects, val]);
        }
        e.currentTarget.value = '';
      }
    }} />
    <button type="button" className="btn btn-primary" onClick={() => {
      const input = document.getElementById('customSubjectInput') as HTMLInputElement;
      const val = input ? input.value.trim() : '';
      if (val && !allSubjects.includes(val)) {
        setCustomSubjects([...customSubjects, val]);
      }
      if(input) input.value = '';
    }}>Ajouter</button>
  </div>

                    </div>
                  )}
                  {activeModal === 'employee' && (
                    <div className="form-group">
                      <label>{t('admin.modals.role', 'Poste / Rôle')}</label>
                      <input type="text" name="role" className="form-input" required />
                    </div>
                  )}
                  
              {activeModal === 'parent_children' && editEntity && (
                <div className="modal-content" style={{maxWidth: '500px'}} onClick={(e) => e.stopPropagation()}>
                  <div className="modal-header">
                    <h3>Enfants de {editEntity.first_name} {editEntity.last_name}</h3>
                    <button className="btn-close" onClick={closeModal}><Icons.X /></button>
                  </div>
                  <div className="modal-body">
                    {editEntity.student_parents && editEntity.student_parents.length > 0 ? (
                      <ul style={{listStyle: 'none', padding: 0, margin: 0}}>
                        {editEntity.student_parents.map((sp: any, idx: number) => (
                          <li key={idx} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', borderBottom: '1px solid var(--border-color)'}}>
                            <span style={{fontWeight: 500}}>{sp.students?.first_name} {sp.students?.last_name}</span>
                            <button className="btn" style={{backgroundColor: '#fee2e2', color: '#ef4444', padding: '4px 8px', fontSize: '0.85rem'}} onClick={() => handleRemoveChild(sp.student_id, sp.parent_id)}>
                              Retirer
                            </button>
                          </li>
                        ))}
                      </ul>
                    ) : (
                      <p style={{color: 'var(--text-secondary)', textAlign: 'center', padding: '20px 0'}}>Aucun enfant associé.</p>
                    )}
                  </div>
                  <div className="modal-footer">
                    <button type="button" className="btn btn-primary" onClick={closeModal}>Fermer</button>
                  </div>
                </div>
              )}

              {activeModal === 'parent' && (
                    <div className="form-group">
                      <label>{t('admin.modals.link_to_student', 'Lier à un élève (Matricule ou Nom)')}</label>
                      <input type="text" className="form-input" />
                    </div>
                  )}
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{editEntity ? 'Mettre à jour' : t('admin.modals.create_profile', 'Créer le profil')}</button>
                  </div>
                </form>
              )}

              {activeModal === 'parent_invoices' && editEntity && (() => {
                const studentIds = editEntity.student_parents?.map((sp: any) => sp.student_id) || [];
                const parentInvoices = invoicesData?.filter(inv => studentIds.includes(inv.student_id)) || [];

                const realResteTotal = (editEntity.student_parents || []).reduce((sum: number, sp: any) => {
                  const student = studentsData?.find(s => s.id === sp.student_id);
                  if (!student) return sum;
                  const studentTotal = Number(student.tuition_fee) || Number(student.classes?.tuition_fee) || 0;
                  const studentInvs = invoicesData?.filter(inv => inv.student_id === student.id) || [];
                  const studentPaye = studentInvs.reduce((acc, inv) => {
                    if (inv.status === 'Payée') return acc + (Number(inv.paid_amount !== undefined && inv.paid_amount !== null ? inv.paid_amount : inv.amount) || 0);
                    if (inv.status === 'Partielle') return acc + (Number(inv.paid_amount) || 0);
                    return acc;
                  }, 0);
                  return sum + Math.max(0, studentTotal - studentPaye);
                }, 0);

                return (
                  <div>
                    {parentInvoices.length > 0 ? (
                      <div className="table-responsive">
                        <table className="table" style={{width: '100%', marginBottom: '20px', borderCollapse: 'collapse'}}>
                          <thead>
                            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left'}}>
                              <th style={{padding: '12px 8px'}}>Date</th>
                              <th style={{padding: '12px 8px'}}>Élève</th>
                              <th style={{padding: '12px 8px'}}>Description</th>
                              <th style={{padding: '12px 8px', textAlign: 'right'}}>Montant</th>
                              <th style={{padding: '12px 8px', textAlign: 'right'}}>Reste à Payer</th>
                              <th style={{padding: '12px 8px', textAlign: 'center'}}>Statut</th>
                            </tr>
                          </thead>
                          <tbody>
                            {parentInvoices.map((inv) => {
                              const reste = inv.status === 'Payée' ? 0 : (Number(inv.amount) - Number(inv.paid_amount || 0));
                              return (
                                <tr key={inv.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                  <td style={{padding: '12px 8px'}}>{new Date(inv.issue_date).toLocaleDateString('fr-FR')}</td>
                                  <td style={{padding: '12px 8px', fontWeight: 500}}>{inv.students?.first_name} {inv.students?.last_name}</td>
                                  <td style={{padding: '12px 8px'}}>{inv.title || inv.type || 'Frais de scolarité'}</td>
                                  <td style={{padding: '12px 8px', textAlign: 'right', fontWeight: 'bold'}}>{formatNum(inv.amount)} F</td>
                                  <td style={{padding: '12px 8px', textAlign: 'right', color: reste > 0 ? 'var(--error-color)' : 'var(--text-color)', fontWeight: 'bold'}}>
                                    {formatNum(reste)} F
                                  </td>
                                  <td style={{padding: '12px 8px', textAlign: 'center'}}>
                                    <span className={`badge ${inv.status === 'Payée' ? 'badge-success' : inv.status === 'Partielle' ? 'badge-warning' : 'badge-danger'}`}>
                                      {inv.status}
                                    </span>
                                  </td>
                                </tr>
                              );
                            })}
                          </tbody>
                          <tfoot>
                            <tr>
                              <th colSpan={4} style={{textAlign: 'right', padding: '16px 8px', borderTop: '2px solid var(--border-color)', fontSize: '1.1rem'}}>Reste Total de la Scolarité :</th>
                              <th colSpan={2} style={{textAlign: 'left', padding: '16px 16px', borderTop: '2px solid var(--border-color)', fontSize: '1.2rem', color: realResteTotal > 0 ? 'var(--error-color)' : 'var(--success-color)'}}>
                                {formatNum(realResteTotal)} F
                              </th>
                            </tr>
                          </tfoot>
                        </table>
                      </div>
                    ) : (
                      <p style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '40px 20px'}}>Aucune facture trouvée pour les enfants de ce parent.</p>
                    )}
                    <div style={{display: 'flex', justifyContent: 'flex-end', marginTop: '20px'}}>
                      <button type="button" className="btn btn-primary" onClick={closeModal}>Fermer</button>
                    </div>
                  </div>
                );
              })()}
              
              {/* Evaluation Form */}
              {/* Global Grades Form */}
              
              {/* Bulletin Preview Modal */}
              
              {/* Coefficients Modal */}
              {activeModal === 'coefficients' && (
                <form onSubmit={handleSaveCoefficients}>
                  <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>Définissez les coefficients pour chaque matière. Laissez à 1 si vous n'utilisez pas de coefficients.</p>
                  <div className="form-grid" style={{maxHeight: '50vh', overflowY: 'auto', paddingRight: '10px'}}>
                    {allSubjects.map(subj => {
                      const existing = classSubjectsData.find(cs => cs.class_id === bulletinClassId && cs.subject === subj);
                      return (
                        <div key={subj} className="form-group" style={{marginBottom: '10px'}}>
                          <label>{subj}</label>
                          <input type="number" step="0.5" min="0" name={'coef_' + subj} className="form-input" defaultValue={existing?.coefficient || 1} />
                        </div>
                      );
                    })}
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Enregistrer les Coefficients</button>
                  </div>
                </form>
              )}

              {activeModal === 'bulletin_preview' && (
                <div style={{width: '100%'}}>
                  <div className="print-controls" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '24px'}}>
                    <div style={{display: 'flex', gap: '16px', alignItems: 'center'}}>
                      <div className="form-group" style={{marginBottom: 0}}>
                        <label>Période</label>
                        <select className="form-select" value={bulletinPeriod} onChange={(e) => loadBulletinData(bulletinClassId!, e.target.value)}>
                          <option value="1er Trimestre">1er Trimestre</option>
                          <option value="2ème Trimestre">2ème Trimestre</option>
                          <option value="3ème Trimestre">3ème Trimestre</option>
                          <option value="1er Semestre">1er Semestre</option>
                          <option value="2ème Semestre">2ème Semestre</option>
                        </select>
                      </div>
                    </div>
                    <div>
                      <button className="btn btn-primary" onClick={() => {
                        document.body.classList.add('print-bulletin');
                        window.print();
                        setTimeout(() => document.body.classList.remove('print-bulletin'), 500);
                      }}><Icons.Download /> Imprimer / PDF</button>
                    </div>
                  </div>
                  
                  <div className="bulletin-preview-container">
                    <BulletinPreview 
                      classData={classesData.find(c => c.id === bulletinClassId)}
                      students={studentsData.filter(s => s.class_id === bulletinClassId)}
                      evaluations={evaluationsData}
                      grades={bulletinGrades}
                      period={bulletinPeriod}
                      schoolInfo={{ ...settingsData, ...adminSchools.find(s => s.id === currentSchoolId) }}
                      classSubjects={classSubjectsData}
                      targetStudentId={bulletinTargetStudentId}
                      schedules={schedulesData}
                    />
                  </div>
                </div>
              )}

              {activeModal === 'expense_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu (Dépense)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              <ExpenseReceiptPreview 
                expense={editEntity} 
                schoolInfo={settingsData} 
              />
            </div>
          </div>
        )}

        {activeModal === 'employee_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu de Salaire (Employé)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              {employeePaymentsData.filter(p => p.employee_id === editEntity.id).length > 0 && (
                <SalaryReceiptPreview 
                  payment={employeePaymentsData.filter(p => p.employee_id === editEntity.id)[0]} 
                  employee={editEntity} 
                  schoolInfo={settingsData} 
                />
              )}
            </div>
          </div>
        )}

        {activeModal === 'teacher_receipt_preview' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '1600px', width: '98%'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header hide-print">
              <h3>Aperçu du Reçu (Professeur)</h3>
              <div style={{display: 'flex', gap: '12px'}}>
                <button className="btn btn-primary" onClick={() => window.print()}>
                  <Icons.Printer /> Imprimer le reçu
                </button>
                <button className="close-btn" onClick={closeModal}>×</button>
              </div>
            </div>
            <div className="modal-body print-area">
              {teacherPaymentsData.filter(p => p.teacher_id === editEntity.id).length > 0 && (
                <TeacherReceiptPreview 
                  payment={selectedTeacherPayment || teacherPaymentsData.filter(p => p.teacher_id === editEntity.id)[0]} 
                  teacher={editEntity} 
                  schoolInfo={settingsData} 
                />
              )}
            </div>
          </div>
        )}

        {activeModal === 'receipt_preview' && (
                <div style={{display: 'flex', flexDirection: 'column', height: '100%', gap: '20px', width: '100%'}}>
                  {(!selectedInvoice || !selectedStudent) ? (
                    <div style={{padding: '40px', textAlign: 'center', color: 'var(--danger-color)'}}>
                      <h3>Impossible d'afficher le reçu</h3>
                      <p>Les données de l'élève ou de la facture sont introuvables. Veuillez réessayer.</p>
                      <button className="btn btn-outline" onClick={closeModal} style={{marginTop: '20px'}}>Fermer</button>
                    </div>
                  ) : (
                    <>
                      <div className="print-controls" style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                        <div style={{color: 'var(--text-secondary)'}}>
                          Veuillez vérifier les informations avant impression.
                        </div>
                        <div>
                          <button className="btn btn-primary" onClick={() => window.print()}><Icons.Download /> Imprimer / PDF</button>
                        </div>
                      </div>
                      
                      <div className="receipt-preview-container-wrapper bulletin-preview-container" style={{ overflowY: 'auto', flex: 1, padding: '20px', background: 'var(--surface-color-hover)', borderRadius: '8px' }}>
                        <div className="receipt-preview-printable">
                          <ReceiptPreview 
                            invoice={selectedInvoice}
                            student={selectedStudent}
                            schoolInfo={{ ...settingsData, ...adminSchools.find(s => s.id === currentSchoolId) }}
                                                          studentReste={
                                (() => {
                                  const total = Number(selectedStudent.tuition_fee) || Number(selectedStudent.classes?.tuition_fee) || 0;
                                  let paye = invoicesData.filter((inv: any) => inv.student_id === selectedStudent.id && inv.status === 'Payée').reduce((sum: number, inv: any) => sum + (Number(inv.amount) || 0), 0);
                                  if (selectedInvoice && selectedInvoice.status === 'Payée' && !invoicesData.some((i: any) => i.id === selectedInvoice.id)) {
                                    paye += Number(selectedInvoice.amount) || 0;
                                  }
                                  return Math.max(0, total - paye);
                                })()
                              }
                          />
                        </div>
                      </div>
                    </>
                  )}
                </div>
              )}

              {activeModal === 'global_grades' && (
                <div style={{width: '100%'}}>
                  <div style={{marginBottom: '16px', display: 'flex', gap: '16px', alignItems: 'flex-end'}}>
                     <div className="form-group" style={{marginBottom: 0}}>
                       <label>Période</label>
                       <select className="form-select" value={globalGradePeriod} onChange={(e) => { setGlobalGradePeriod(e.target.value); loadGlobalGrades(globalGradeClassId!, e.target.value); }}>
                          <option value="1er Trimestre">1er Trimestre</option>
                          <option value="2ème Trimestre">2ème Trimestre</option>
                          <option value="3ème Trimestre">3ème Trimestre</option>
                          <option value="1er Semestre">1er Semestre</option>
                          <option value="2ème Semestre">2ème Semestre</option>
                       </select>
                     </div>
                     <button className="btn btn-primary" onClick={saveGlobalGrades}>Enregistrer tout</button>
                  </div>
                  <div style={{overflowX: 'auto'}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '14px', background: '#fff', border: '1px solid var(--border-color)'}}>
                      <thead>
                        <tr style={{background: 'var(--surface-color)'}}>
                          <th style={{border: '1px solid var(--border-color)', padding: '12px', textAlign: 'left', minWidth: '150px'}}>Élève</th>
                          {allSubjects.map(sub => (
                            <th key={sub} style={{border: '1px solid var(--border-color)', padding: '8px', textAlign: 'center'}} title={sub}>{sub.substring(0,4)}.</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody>
                        {studentsData.filter(s => s.class_id === globalGradeClassId).map(st => (
                          <tr key={st.id}>
                            <td style={{border: '1px solid var(--border-color)', padding: '8px', fontWeight: 500}}>{st.first_name} {st.last_name}</td>
                            {allSubjects.map(sub => (
                              <td key={sub} style={{border: '1px solid var(--border-color)', padding: '4px', textAlign: 'center'}}>
                                <input 
                                  type="number" 
                                  min="0" max="20" step="0.25"
                                  style={{width: '60px', padding: '6px', textAlign: 'center', border: '1px solid var(--border-color)', borderRadius: '4px'}}
                                  value={globalGrades[`${st.id}_${sub}`] || ""}
                                  onChange={(e) => setGlobalGrades({...globalGrades, [`${st.id}_${sub}`]: e.target.value})}
                                />
                              </td>
                            ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}

              {activeModal === 'evaluation' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.eval_name', "Nom de l'évaluation")}</label>
                    <input type="text" name="name" className="form-input" required placeholder="Ex: Devoir de Mathématiques N°1" />
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.class_assign', 'Classe')}</label>
                      <select name="class_id" className="form-select" required>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.taught_subject', 'Matière')}</label>
                      <select name="subject" className="form-input" required defaultValue={editEntity?.subject || ""}>
                        <option value="">Sélectionnez une matière</option>
                        {allSubjects.map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.term', 'Période')}</label>
                      <select name="period" className="form-select" required>
                        <option value="1er Trimestre">1er Trimestre</option>
                        <option value="2ème Trimestre">2ème Trimestre</option>
                        <option value="3ème Trimestre">3ème Trimestre</option>
                        <option value="1er Semestre">1er Semestre</option>
                        <option value="2ème Semestre">2ème Semestre</option>
                      </select>
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.eval_type', "Type d'évaluation")}</label>
                      <select name="type" className="form-select" required>
                        <option value="Devoir de classe">Devoir de classe</option>
                        <option value="Devoir à la maison">Devoir à la maison</option>
                        <option value="Composition">Composition</option>
                        <option value="Examen blanc">Examen blanc</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.date', 'Date')}</label>
                      <input type="date" name="date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.max_score', 'Noté sur (Maximum)')}</label>
                      <input type="number" name="max_score" className="form-input" required defaultValue="20" min="1" />
                    </div>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.create_eval', "Créer l'évaluation")}</button>
                  </div>
                </form>
              )}

              {/* Bulletin Form */}
              {activeModal === 'bulletin' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.class_assign', 'Sélectionner la classe')}</label>
                    <select className="form-select" name="classe" required>
                      <option>Terminale S1</option>
                      <option>1ère L</option>
                      <option>Seconde 4</option>
                    </select>
                  </div>
                  {activeModal === 'bulletin' && (
                    <div className="form-group">
                      <label>{t('admin.modals.term', 'Trimestre/Semestre')}</label>
                      <select className="form-select" name="trimestre" required>
                        <option>1er Trimestre</option>
                        <option>2ème Trimestre</option>
                        <option>3ème Trimestre</option>
                      </select>
                    </div>
                  )}

                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">
                      {t('admin.modals.generate', 'Lancer la génération')}
                    </button>
                  </div>
                </form>
              )}

              {/* Student Dossier Modal */}
              {activeModal === 'studentDossier' && selectedStudent && (
                <div style={{maxHeight: '75vh', overflowY: 'auto', paddingRight: '12px', minWidth: '600px'}}>
                  <div style={{display: 'flex', gap: '16px', alignItems: 'center', marginBottom: '24px'}}>
                    <div className="avatar" style={{width: 64, height: 64, fontSize: '1.5rem'}}>
                      {selectedStudent.first_name[0]}{selectedStudent.last_name[0]}
                    </div>
                    <div>
                      <h2 style={{margin: 0, fontSize: '1.5rem'}}>{selectedStudent.first_name} {selectedStudent.last_name}</h2>
                      <p style={{margin: '4px 0 0', color: 'var(--text-secondary)'}}>Matricule: {selectedStudent.matricule}</p>
                      <span className={`badge ${selectedStudent.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}`} style={{marginTop: '8px', display: 'inline-block'}}>
                        {selectedStudent.status}
                      </span>
                    </div>
                  </div>
                  
                  {/* Tabs */}
                  <div style={{display: 'flex', borderBottom: '1px solid var(--border-color)', marginBottom: '24px'}}>
                    <button 
                      className={`btn ${activeDossierTab === 'infos' ? '' : 'btn-outline'}`}
                      style={{borderBottom: activeDossierTab === 'infos' ? '2px solid var(--primary-color)' : 'none', borderRadius: '4px 4px 0 0', border: 'none', background: activeDossierTab === 'infos' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeDossierTab === 'infos' ? 'var(--primary-color)' : 'var(--text-secondary)'}}
                      onClick={() => setActiveDossierTab('infos')}
                    >
                      {t('admin.modals.dossier_title_infos', 'Informations & Planning')}
                    </button>
                    <button 
                      className={`btn ${activeDossierTab === 'documents' ? '' : 'btn-outline'}`}
                      style={{borderBottom: activeDossierTab === 'documents' ? '2px solid var(--primary-color)' : 'none', borderRadius: '4px 4px 0 0', border: 'none', background: activeDossierTab === 'documents' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeDossierTab === 'documents' ? 'var(--primary-color)' : 'var(--text-secondary)'}}
                      onClick={() => setActiveDossierTab('documents')}
                    >
                      {t('admin.modals.dossier_title_docs', 'Documents & Annexes')}
                    </button>
                    <button 
                      className={`btn ${activeDossierTab === 'finances' ? '' : 'btn-outline'}`}
                      style={{borderBottom: activeDossierTab === 'finances' ? '2px solid var(--primary-color)' : 'none', borderRadius: '4px 4px 0 0', border: 'none', background: activeDossierTab === 'finances' ? 'rgba(59, 130, 246, 0.1)' : 'transparent', color: activeDossierTab === 'finances' ? 'var(--primary-color)' : 'var(--text-secondary)'}}
                      onClick={() => setActiveDossierTab('finances')}
                    >
                      Finances & Paiements
                    </button>
                  </div>

                  {activeDossierTab === 'infos' && (
                    <div>
                      <h3 style={{marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '1.1rem'}}>{t('admin.modals.school_infos', 'Informations Scolaires')}</h3>
                      <div className="form-grid" style={{marginBottom: '24px'}}>
                        <div>
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block'}}>{t('admin.modals.current_class', 'Classe Actuelle')}</span>
                          <strong>{selectedStudent.classes?.name || t('admin.modals.unassigned', 'Non assigné')}</strong>
                        </div>
                        <div>
                          <span style={{color: 'var(--text-secondary)', fontSize: '0.9rem', display: 'block'}}>{t('admin.modals.birth_date_title', 'Date de naissance')}</span>
                          <strong>{new Date(selectedStudent.birth_date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}</strong>
                        </div>
                      </div>

                      {/* Emploi du temps de la classe */}
                      <h3 style={{marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '1.1rem'}}>{t('admin.modals.class_schedule', 'Emploi du temps')} ({selectedStudent.classes?.name})</h3>
                      <div style={{marginBottom: '24px'}}>
                        {schedulesData.filter(s => s.class_id === selectedStudent.class_id).length > 0 ? (
                          <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', gap: '8px'}}>
                            {['Lundi', 'Mardi', 'Mercredi', 'Jeudi', 'Vendredi'].map(day => {
                              const dayCourses = schedulesData.filter(s => s.class_id === selectedStudent.class_id && s.day_of_week === day).sort((a,b) => (a.start_time || '').localeCompare(b.start_time || ''));
                              if (dayCourses.length === 0) return null;
                              return (
                                <div key={day} style={{border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px'}}>
                                  <div style={{fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', textAlign: 'center'}}>{day}</div>
                                  {dayCourses.map((course, idx) => (
                                    <div key={idx} style={{background: 'var(--surface-color-hover)', padding: '6px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.8rem'}}>
                                      <div style={{fontWeight: 600, color: 'var(--primary-color)'}}>{course.subject}</div>
                                      <div>{course?.start_time?.substring(0,5)} - {course?.end_time?.substring(0,5)}</div>
                                    </div>
                                  ))}
                                </div>
                              );
                            })}
                          </div>
                        ) : (
                          <div style={{padding: '16px', background: 'var(--surface-color-hover)', borderRadius: '8px', textAlign: 'center', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                            {t('admin.modals.no_schedule', "Aucun emploi du temps n'a encore été configuré pour cette classe.")}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  {activeDossierTab === 'documents' && (
                    <div>
                      {/* Upload Form */}
                      <div style={{background: 'var(--surface-color-hover)', padding: '16px', borderRadius: '8px', marginBottom: '24px'}}>
                        <h4 style={{marginTop: 0, marginBottom: '16px'}}>{t('admin.modals.add_doc', 'Ajouter un document')}</h4>
                        <form onSubmit={handleDocumentUpload} style={{display: 'flex', flexDirection: 'column', gap: '12px'}}>
                          <div className="form-grid" style={{gap: '12px'}}>
                            <div className="form-group">
                              <label>{t('admin.modals.doc_type', 'Type de document')}</label>
                              <select name="document_type" className="form-select" required>
                                <option value="Administratif">{t('admin.modals.doc_type_admin', 'Administratif (Exeat, Naissance)')}</option>
                                <option value="Médical">{t('admin.modals.doc_type_med', 'Médical (Vaccin, Certificat)')}</option>
                                <option value="Pédagogique">{t('admin.modals.doc_type_pedag', 'Pédagogique (Bulletins)')}</option>
                                <option value="Autre">{t('admin.modals.doc_type_other', 'Autre (Autorisations)')}</option>
                              </select>
                            </div>
                            <div className="form-group">
                              <label>{t('admin.modals.doc_name', 'Nom du document')}</label>
                              <input type="text" name="document_name" className="form-input" required placeholder="Ex: Extrait de naissance" />
                            </div>
                          </div>
                          <div className="form-group">
                            <label>{t('admin.modals.file', 'Fichier (PDF, JPG, PNG)')}</label>
                            <input type="file" name="file" className="form-input" accept=".pdf,image/*" required style={{padding: '8px'}} />
                          </div>
                          <button type="submit" className="btn btn-primary" disabled={isUploading} style={{alignSelf: 'flex-start'}}>
                            {isUploading ? t('admin.modals.uploading', 'Envoi en cours...') : <><Icons.Upload /> {t('admin.modals.upload_btn', 'Ajouter le document')}</>}
                          </button>
                        </form>
                      </div>

                      {/* Documents List */}
                      {studentDocumentsData.length > 0 ? (
                        <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                          {studentDocumentsData.map(doc => (
                            <div key={doc.id} style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '12px', border: '1px solid var(--border-color)', borderRadius: '6px', background: 'var(--surface-color)'}}>
                              <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                                <div style={{width: '40px', height: '40px', background: 'rgba(59, 130, 246, 0.1)', borderRadius: '4px', display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--primary-color)'}}>
                                  <Icons.FileText />
                                </div>
                                <div>
                                  <div style={{fontWeight: 600}}>{doc.document_name}</div>
                                  <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>
                                    {doc.document_type} • {t('admin.modals.added_on', 'Ajouté le')} {new Date(doc.created_at).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')}
                                  </div>
                                </div>
                              </div>
                              <div style={{display: 'flex', gap: '8px'}}>
                                <a href={doc.file_path} target="_blank" rel="noopener noreferrer" className="btn btn-outline" style={{padding: '6px 12px', textDecoration: 'none'}}>{t('admin.modals.view', 'Voir')}</a>
                                <button className="btn btn-outline" style={{padding: '6px 12px', color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}} onClick={() => deleteDocument(doc.id, doc.file_path)}>
                                  <Icons.X />
                                </button>
                              </div>
                            </div>
                          ))}
                        </div>
                      ) : (
                        <div style={{padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color-hover)', borderRadius: '8px'}}>
                          {t('admin.modals.no_doc', "Aucun document n'a été ajouté pour cet élève.")}
                        </div>
                      )}
                    </div>
                  )}

                  {activeDossierTab === 'finances' && (() => {
                    const studentInvoices = invoicesData.filter(inv => inv.student_id === selectedStudent.id);
                    const studentPaye = studentInvoices.filter(inv => inv.status === 'Payée').reduce((sum, inv) => sum + (Number(inv.amount) || 0), 0);
                    const studentTotal = Number(selectedStudent.tuition_fee) || Number(selectedStudent.classes?.tuition_fee) || 0;
                    const studentReste = Math.max(0, studentTotal - studentPaye);

                    return (
                    <div>
                      <div style={{display: 'flex', flexWrap: 'wrap', justifyContent: 'space-between', alignItems: 'center', marginBottom: '12px', gap: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>
                        <h3 style={{fontSize: '1.1rem', margin: 0}}>Historique des Paiements</h3>
                        <button className="btn btn-primary" onClick={() => { setPreselectedStudentId(selectedStudent.id); setActiveModal('payment'); }}>+ Enregistrer un paiement</button>
                      </div>
                      <div style={{marginBottom: '24px'}}>
                        <div style={{display: 'flex', gap: '24px', flexWrap: 'wrap', marginBottom: '16px', background: 'var(--surface-color-hover)', padding: '16px', borderRadius: '8px'}}>
                          <div>
                            <span style={{display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Scolarité Totale</span>
                            <strong style={{fontSize: '1.2rem'}}>{formatNum(studentTotal)} F</strong>
                          </div>
                          <div>
                            <span style={{display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Total Payé</span>
                            <strong style={{fontSize: '1.2rem', color: 'var(--success-color)'}}>{formatNum(studentPaye)} F</strong>
                          </div>
                          <div>
                            <span style={{display: 'block', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Reste à Payer</span>
                            <strong style={{fontSize: '1.2rem', color: studentReste > 0 ? 'var(--danger-color)' : 'var(--success-color)'}}>{formatNum(studentReste)} F</strong>
                          </div>
                        </div>

                        {studentInvoices.length > 0 ? (
                          <table style={{width: '100%', borderCollapse: 'collapse', fontSize: '0.9rem'}}>
                            <thead>
                              <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
                                <th style={{padding: '16px 0', fontWeight: 500}}>N° Reçu</th>
                                <th style={{padding: '16px 0', fontWeight: 500}}>Motif</th>
                                <th style={{padding: '16px 0', fontWeight: 500}}>Montant</th>
                                <th style={{padding: '16px 0', fontWeight: 500}}>Date</th>
                                <th style={{padding: '16px 0', fontWeight: 500}}>Statut</th>
                                <th style={{padding: '16px 0', fontWeight: 500, textAlign: 'right'}}>Action</th>
                              </tr>
                            </thead>
                            <tbody>
                              {studentInvoices.map((inv, idx) => (
                                <tr key={idx} style={{borderBottom: '1px solid var(--border-color)'}}>
                                  <td style={{padding: '12px 0', fontFamily: 'monospace', fontWeight: 500, color: 'var(--primary-color)'}}>{inv.invoice_number}</td>
                                  <td style={{padding: '12px 0'}}>{inv.motif}</td>
                                  <td style={{padding: '12px 0', fontWeight: 'bold'}}>{formatNum(inv.amount)} F</td>
                                  <td style={{padding: '12px 0', color: 'var(--text-secondary)'}}>{new Date(inv.issue_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                                  <td style={{padding: '12px 0'}}>
                                    <span className={`badge ${inv.status === 'Payée' ? 'badge-success' : 'badge-warning'}`}>{inv.status}</span>
                                  </td>
                                  <td style={{padding: '12px 0', textAlign: 'right'}}>
                                    <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={() => { setSelectedInvoice(inv); setActiveModal('receipt_preview'); }}>🖨️ Imprimer</button>
                                  </td>
                                </tr>
                              ))}
                            </tbody>
                          </table>
                        ) : (
                          <div style={{padding: '24px', textAlign: 'center', color: 'var(--text-secondary)', background: 'var(--surface-color)', borderRadius: '8px', border: '1px solid var(--border-color)'}}>
                            Aucune transaction n'a été trouvée pour cet élève.
                          </div>
                        )}
                      </div>
                    </div>
                  ) })() }

                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    {activeDossierTab === 'finances' && (
                      <button type="button" className="btn btn-outline" style={{borderColor: 'var(--primary-color)', color: 'var(--primary-color)'}} onClick={() => { setPreselectedStudentId(selectedStudent.id); setActiveModal('payment'); }}>
                        + Enregistrer un paiement
                      </button>
                    )}
                    <button type="button" className="btn btn-primary" onClick={closeModal}>{t('admin.modals.close_dossier', 'Fermer le dossier')}</button>
                  </div>
                </div>
              )}

              {/* Schedule Form */}
              {activeModal === 'employee_payment' && editEntity && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payer {editEntity.first_name} {editEntity.last_name} ({editEntity.role})</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleEmployeePaymentSubmit} className="modal-body">
              <div className="form-group">
                <label>Montant (F)</label>
                <input type="number" name="amount" className="form-control" required defaultValue={editEntity.salary || 0} />
              </div>
              <div className="form-group">
                <label>Mois (ex: Septembre 2026)</label>
                <input type="text" name="month" className="form-control" required placeholder="Septembre 2026" />
              </div>
              <div className="form-group">
                <label>Méthode de paiement</label>
                <select name="payment_method" className="form-select">
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer le paiement</button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'teacher_payment' && editEntity && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Payer {editEntity.first_name} {editEntity.last_name}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleTeacherPaymentSubmit} className="modal-body">
              <div className="form-group">
                <label>Montant (F)</label>
                <input type="number" name="amount" className="form-control" required defaultValue={editEntity.salary || 0} />
              </div>
              <div className="form-group">
                <label>Mois (ex: Septembre 2026)</label>
                <input type="text" name="month" className="form-control" required placeholder="Septembre 2026" />
              </div>
              <div className="form-group">
                <label>Méthode de paiement</label>
                <select name="payment_method" className="form-select">
                  <option value="Espèces">Espèces</option>
                  <option value="Virement">Virement</option>
                  <option value="Mobile Money">Mobile Money</option>
                </select>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                <button type="submit" className="btn btn-primary">Enregistrer le paiement</button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'teacher_payment_history' && editEntity && (
          <div className="modal-content fade-in" style={{maxWidth: '800px'}} onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>Historique des paiements - {editEntity.first_name} {editEntity.last_name}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <div className="modal-body">
              <div className="table-responsive">
                <table className="table" style={{width: '100%'}}>
                  <thead>
                    <tr>
                      <th style={{textAlign: 'left', padding: '12px'}}>Date</th>
                      <th style={{textAlign: 'left', padding: '12px'}}>Mois concerné</th>
                      <th style={{textAlign: 'left', padding: '12px'}}>Montant</th>
                      <th style={{textAlign: 'left', padding: '12px'}}>Méthode</th>
                      <th style={{textAlign: 'right', padding: '12px'}}>Action</th>
                    </tr>
                  </thead>
                  <tbody>
                    {teacherPaymentsData.filter(p => p.teacher_id === editEntity.id).length > 0 ? (
                      teacherPaymentsData.filter(p => p.teacher_id === editEntity.id).map((payment, idx) => (
                        <tr key={payment.id || idx} style={{borderBottom: '1px solid var(--border-color)'}}>
                          <td style={{padding: '12px'}}>{new Date(payment.payment_date || payment.created_at).toLocaleDateString()}</td>
                          <td style={{padding: '12px', fontWeight: '500'}}>{payment.month || '-'}</td>
                          <td style={{padding: '12px'}}>{payment.amount} F</td>
                          <td style={{padding: '12px'}}>{payment.payment_method || '-'}</td>
                          <td style={{padding: '12px', textAlign: 'right'}}>
                            <button className="btn btn-outline" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => { setSelectedTeacherPayment(payment); setActiveModal('teacher_receipt_preview'); }}>
                              ⎙ Reçu
                            </button>
                          </td>
                        </tr>
                      ))
                    ) : (
                      <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px'}}>Aucun paiement enregistré.</td></tr>
                    )}
                  </tbody>
                </table>
              </div>
            </div>
            <div className="modal-footer">
              <button type="button" className="btn btn-outline" onClick={closeModal}>Fermer</button>
              <button type="button" className="btn btn-primary" onClick={() => { setSelectedTeacherPayment(null); setActiveModal('teacher_payment'); }}>💵 Nouveau Paiement</button>
            </div>
          </div>
        )}

        {activeModal === 'loan' && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEntity ? 'Modifier l\'Emprunt' : 'Nouvel Emprunt'}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleAddLoan} className="modal-body">
              <div className="form-group">
                <label>Nom du prêteur (Banque, Organisation...)</label>
                <input type="text" name="lender_name" className="form-control" required defaultValue={editEntity?.lender_name || ''} />
              </div>
              <div className="form-row">
                <div className="form-group">
                  <label>Montant (F)</label>
                  <input type="number" name="amount" className="form-control" required min="0" step="1" defaultValue={editEntity?.amount || ''} />
                </div>
                <div className="form-group">
                  <label>Date</label>
                  <input type="date" name="loan_date" className="form-control" required defaultValue={editEntity?.loan_date || new Date().toISOString().split('T')[0]} />
                </div>
              </div>
              <div className="form-group">
                <label>Motif de l'emprunt</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={editEntity?.description || ''} placeholder="Ex: Achat de bus scolaire..."></textarea>
              </div>
              {editEntity && (
                <div className="form-group">
                  <label>Statut</label>
                  <select name="status" className="form-control" defaultValue={editEntity.status}>
                    <option value="Actif">Actif</option>
                    <option value="Remboursé">Remboursé</option>
                  </select>
                </div>
              )}
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>{t('common.cancel', 'Annuler')}</button>
                <button type="submit" className="btn btn-primary">{t('common.save', 'Enregistrer')}</button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'expense' && (
          <div className="modal-content fade-in" onClick={e => e.stopPropagation()}>
            <div className="modal-header">
              <h3>{editEntity ? t('admin.expenses.edit_expense', 'Modifier la Dépense') : t('admin.expenses.add_expense', 'Nouvelle Dépense')}</h3>
              <button className="close-btn" onClick={closeModal}>×</button>
            </div>
            <form onSubmit={handleAddExpense} className="modal-body">
              <div className="form-group">
                <label>{t('admin.expenses.category', 'Catégorie')}</label>
                <select name="category" className="form-control" required defaultValue={editEntity?.category || 'Électricité'}>
                  <option value="Électricité">Électricité</option>
                  <option value="Eau">Eau</option>
                  <option value="Loyer">Loyer</option>
                  <option value="Fournitures">Fournitures</option>
                  <option value="Entretien">Entretien</option>
                  <option value="Salaire">Salaire (Autre)</option>
                  <option value="Autre">Autre</option>
                </select>
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.amount', 'Montant (F)')}</label>
                <input type="number" name="amount" className="form-control" required min="0" step="1" defaultValue={editEntity?.amount || ''} />
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.date', 'Date')}</label>
                <input type="date" name="date" className="form-control" required defaultValue={editEntity?.payment_date || new Date().toISOString().split('T')[0]} />
              </div>
              <div className="form-group">
                <label>{t('admin.expenses.description', 'Description')}</label>
                <textarea name="description" className="form-control" rows={3} defaultValue={editEntity?.description || ''} placeholder="Détails de la dépense..."></textarea>
              </div>
              <div className="modal-footer">
                <button type="button" className="btn btn-outline" onClick={closeModal}>{t('common.cancel', 'Annuler')}</button>
                <button type="submit" className="btn btn-primary">
                  {t('common.save', 'Enregistrer')}
                </button>
              </div>
            </form>
          </div>
        )}

        {activeModal === 'schedule' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.class_assign', 'Classe')}</label>
                    <select name="class_id" className="form-select" required>
                      <option value="">Choisir une classe...</option>
                      {classesData.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.taught_subject', 'Matière')}</label>
                    <select name="subject" className="form-input" required defaultValue={editEntity?.subject || ""}>
                        <option value="">Sélectionnez une matière</option>
                        {allSubjects.map(subj => (
                          <option key={subj} value={subj}>{subj}</option>
                        ))}
                      </select>
                  </div>
                  <div className="form-group">
                    <label>Professeur (Optionnel)</label>
                    <select name="teacher_id" className="form-select">
                      <option value="">Non assigné</option>
                      {teachersData.map(t => (
                        <option key={t.id} value={t.id}>{t.first_name} {t.last_name}</option>
                      ))}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.day', 'Jour')}</label>
                    <select name="day_of_week" className="form-select" required>
                      <option value="Lundi">Lundi</option>
                      <option value="Mardi">Mardi</option>
                      <option value="Mercredi">Mercredi</option>
                      <option value="Jeudi">Jeudi</option>
                      <option value="Vendredi">Vendredi</option>
                      <option value="Samedi">Samedi</option>
                    </select>
                  </div>
                  <div className="form-grid">
                    <div className="form-group">
                      <label>{t('admin.modals.start_time', 'Heure de début')}</label>
                      <input type="time" name="start_time" className="form-input" required defaultValue="08:00" />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.end_time', 'Heure de fin')}</label>
                      <input type="time" name="end_time" className="form-input" required defaultValue="10:00" />
                    </div>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.save_course', 'Enregistrer le cours')}</button>
                  </div>
                </form>
              )}
            </div>
          </div>
        </div>
      )}
      {/* School Creation Modal */}
      {showSchoolModal && (
        <div className="modal-overlay" style={{zIndex: 9999}}>
          <div className="modal-content animate-scale">
            <div className="modal-header">
              <h2>Créer un Établissement</h2>
            </div>
            <div className="modal-body">
              <p style={{marginBottom: '20px', color: 'var(--text-secondary)'}}>
                Bienvenue ! Veuillez créer votre premier établissement pour commencer à utiliser l'application.
              </p>
              <form onSubmit={handleCreateSchool}>
                <div className="form-group">
                  <label>Nom de l'établissement</label>
                  <input type="text" name="name" className="form-input" required placeholder="Ex: École de l'Excellence" />
                </div>
                <div style={{marginTop: '24px'}}>
                  <button type="submit" className="btn btn-primary" style={{width: '100%'}}>
                    Créer et Continuer
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
      {/* Floating Support Button */}
      <button 
        className="hide-print"
        onClick={() => setIsSupportModalOpen(true)}
        style={{
          position: 'fixed',
          bottom: '24px',
          right: '24px',
          background: 'var(--accent-color, #8B5CF6)',
          color: 'white',
          border: 'none',
          borderRadius: '50px',
          padding: '12px 24px',
          fontSize: '1rem',
          fontWeight: 600,
          boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
          cursor: 'pointer',
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          gap: '8px'
        }}
      >
        <span>❓</span> Aide & Support
      </button>

      {isSupportModalOpen && currentSchoolId && session && (
        <UserSupportModal 
          session={session} 
          schoolId={currentSchoolId} 
          onClose={() => setIsSupportModalOpen(false)} 
        />
      )}

      {isQuickStartModalOpen && (
        <QuickStartGuideModal onClose={() => setIsQuickStartModalOpen(false)} />
      )}
    </div>
  );
}

export default App;
