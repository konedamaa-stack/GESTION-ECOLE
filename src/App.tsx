import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import { useTranslation } from 'react-i18next';
import Auth from './components/Auth';
import StudentPortal from './components/StudentPortal';
import TeacherPortal from './components/TeacherPortal';
import { PieChart, Pie, Cell, ResponsiveContainer, Tooltip } from 'recharts';
import './App.css';

// Custom SVG Icons
// ...
const Icons = {
  Home: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" /></svg>,
  Users: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  BookOpen: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  Calendar: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><rect x="3" y="4" width="18" height="18" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="2" x2="16" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="8" y1="2" x2="8" y2="6" strokeLinecap="round" strokeLinejoin="round" /><line x1="3" y1="10" x2="21" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  MessageSquare: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" /></svg>,
  Settings: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><circle cx="12" cy="12" r="3" strokeLinecap="round" strokeLinejoin="round"/><path strokeLinecap="round" strokeLinejoin="round" d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 0 1 0 2.83 2 2 0 0 1-2.83 0l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-2 2 2 2 0 0 1-2-2v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 0 1-2.83 0 2 2 0 0 1 0-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1-2-2 2 2 0 0 1 2-2h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 0 1 0-2.83 2 2 0 0 1 2.83 0l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 2-2 2 2 0 0 1 2 2v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 0 1 2.83 0 2 2 0 0 1 0 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 2 2 2 2 0 0 1-2 2h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>,
  Search: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="var(--text-secondary)" strokeWidth="2"><circle cx="11" cy="11" r="8" strokeLinecap="round" strokeLinejoin="round"/><line x1="21" y1="21" x2="16.65" y2="16.65" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Bell: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M18 8A6 6 0 0 0 6 8c0 7-3 9-3 9h18s-3-2-3-9"/><path strokeLinecap="round" strokeLinejoin="round" d="M13.73 21a2 2 0 0 1-3.46 0"/></svg>,
  Activity: () => <svg className="stat-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="22 12 18 12 15 21 9 3 6 12 2 12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  UserPlus: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="8.5" cy="7" r="4" /><line x1="20" y1="8" x2="20" y2="14" strokeLinecap="round" strokeLinejoin="round"/><line x1="23" y1="11" x2="17" y2="11" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  CheckCircle: () => <svg className="stat-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Send: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="22" y1="2" x2="11" y2="13" strokeLinecap="round" strokeLinejoin="round"/><polygon points="22 2 15 22 11 13 2 9 22 2" strokeLinecap="round" strokeLinejoin="round"/></svg>,
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
  Upload: () => <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 8 12 3 7 8" strokeLinecap="round" strokeLinejoin="round"/><line x1="12" y1="3" x2="12" y2="15" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

function App() {
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
  const [activeTab, setActiveTab] = useState(() => localStorage.getItem('sges_tab') || 'dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [activeModal, setActiveModal] = useState<string | null>(null);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isProfileMenuOpen, setIsProfileMenuOpen] = useState(false);
  const [currentSchoolPlan, setCurrentSchoolPlan] = useState<string>('Standard');
  const [selectedStudent, setSelectedStudent] = useState<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedClassForSchedule, setSelectedClassForSchedule] = useState<string>('');
  
  const [activeDossierTab, setActiveDossierTab] = useState<'infos' | 'documents'>('infos');
  const [studentDocumentsData, setStudentDocumentsData] = useState<any[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  
  const [selectedClassForGrades, setSelectedClassForGrades] = useState<string>('');
  const [selectedSubjectForGrades, setSelectedSubjectForGrades] = useState<string>('');
  const [selectedPeriodForGrades, setSelectedPeriodForGrades] = useState<string>('1er Trimestre');
  const [evaluationsData, setEvaluationsData] = useState<any[]>([]);
  const [activeEvaluation, setActiveEvaluation] = useState<any>(null);
  const [gradesInput, setGradesInput] = useState<Record<string, {score: string, comment: string}>>({});
  const [currentSchoolId, setCurrentSchoolId] = useState<string | null>(null);
  const [adminSchools, setAdminSchools] = useState<{id: string, name: string}[]>([]);

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [absencesData, setAbsencesData] = useState<any[]>([]);
  const [schedulesData, setSchedulesData] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any | null>(null);

  const toggleLanguage = () => {
    const newLang = i18n.language.startsWith('ar') ? 'fr' : 'ar';
    i18n.changeLanguage(newLang);
    document.documentElement.dir = newLang === 'ar' ? 'rtl' : 'ltr';
    document.documentElement.lang = newLang;
  };

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: false }).format(Number(num));
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
    } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (studentSession) localStorage.setItem('sges_student', JSON.stringify(studentSession));
    else localStorage.removeItem('sges_student');
  }, [studentSession]);

  useEffect(() => {
    if (teacherSession) localStorage.setItem('sges_teacher', JSON.stringify(teacherSession));
    else localStorage.removeItem('sges_teacher');
  }, [teacherSession]);

  useEffect(() => {
    localStorage.setItem('sges_tab', activeTab);
  }, [activeTab]);

  useEffect(() => {
    if (currentSchoolId) localStorage.setItem('sges_school_id', currentSchoolId);
  }, [currentSchoolId]);

  useEffect(() => {
    if (session) {
      setCurrentSchoolPlan('Standard');
    }
  }, [session]);

  useEffect(() => {
    if (session && currentSchoolId) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchEmployees();
      fetchInvoices();
      fetchAbsences();
      fetchSchedules();
      fetchEvaluations();
      fetchSettings();
    }
  }, [session, currentSchoolId]);

  useEffect(() => {
    if (activeModal === 'studentDossier' && selectedStudent) {
      fetchStudentDocuments(selectedStudent.id);
    }
  }, [activeModal, selectedStudent]);

  const fetchStudents = async () => {
    const { data } = await supabase.from('students').select(`*, classes ( name )`);
    if (data) setStudentsData(data);
  };
  const fetchClasses = async () => {
    const { data } = await supabase.from('classes').select('*');
    if (data) setClassesData(data);
  };
  const fetchTeachers = async () => {
    const { data } = await supabase.from('teachers').select('*');
    if (data) setTeachersData(data);
  };
  const fetchEmployees = async () => {
    const { data } = await supabase.from('employees').select('*');
    if (data) setEmployeesData(data);
  };
  const fetchInvoices = async () => {
    const { data } = await supabase.from('invoices').select(`*, students ( first_name, last_name, matricule )`);
    if (data) setInvoicesData(data);
  };
  const fetchAbsences = async () => {
    const { data } = await supabase.from('absences').select(`*, students ( first_name, last_name, classes(name) )`);
    if (data) setAbsencesData(data);
  };
  const fetchSchedules = async () => {
    const { data } = await supabase.from('schedules').select(`*, classes(name), teachers(first_name, last_name)`);
    if (data) setSchedulesData(data);
  };
  const fetchStudentDocuments = async (studentId: string) => {
    const { data } = await supabase.from('student_documents').select('*').eq('student_id', studentId);
    if (data) setStudentDocumentsData(data);
  };
  const fetchEvaluations = async () => {
    const { data } = await supabase.from('evaluations').select(`*, classes(name)`);
    if (data) setEvaluationsData(data);
  };
  const fetchSettings = async () => {
    const { data } = await supabase.from('school_settings').select('*').single();
    if (data) setSettingsData(data);
  };

  const saveSettings = async (e: any) => {
    e.preventDefault();
    if (!currentSchoolId) return;
    const formData = new FormData(e.target);
    const settingsObj = {
      school_name: formData.get('school_name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      director_name: formData.get('director_name'),
    };
    
    const { data: existing } = await supabase.from('school_settings').select('id').single();
    let error;
    if (existing) {
      const { error: err } = await supabase.from('school_settings').update(settingsObj);
      error = err;
    } else {
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

  const closeModal = () => setActiveModal(null);

  const handleFormSubmit = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    
    if (activeModal === 'newSchool') {
      try {
        const schoolName = formData.get('name') as string;
        if (!schoolName) return;
        const { data: newSchool, error: schoolError } = await supabase.from('schools').insert([{ name: schoolName }]).select().single();
        if (schoolError) throw schoolError;
        
        const { error: adminError } = await supabase.from('school_admins').insert([{
          user_id: session?.user.id,
          }]);
        if (adminError) throw adminError;
        
        alert("Nouvel établissement créé avec succès !");
        
        const { data } = await supabase.from('school_admins').select('school_id, schools(name)').eq('user_id', session?.user.id);
        if (data) {
          const schoolsList = data.map((d: any) => ({ id: d.school_id, name: d.schools?.name || 'École' }));
          setAdminSchools(schoolsList);
          setCurrentSchoolId(newSchool.id);
        }
        closeModal();
      } catch (err: any) {
        alert("Erreur lors de la création : " + err.message);
      }
      return;
    }

    if (!currentSchoolId) {
      alert("Erreur: ID de l'établissement introuvable.");
      return;
    }
    
    try {
      if (activeModal === 'class') {
        const className = formData.get('name') as string;
        const classLevel = formData.get('level') as string;
        if (!className) return;
        const { error } = await supabase.from('classes').insert([{ 
          name: className, 
          level: classLevel || 'Non défini',
          }]);
        if (error) throw error;
        alert("Classe créée avec succès !");
        fetchClasses();
        closeModal();
        return;
      }

      if (activeModal === 'student') {
        const matricule = 'ELV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000);
        const password = formData.get('password') || 'passer123';
        const student = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          matricule: matricule,
          class_id: formData.get('class_id'),
          birth_date: formData.get('birth_date'),
          email: formData.get('email'),
          password: password,
        };
        const { data: studentData, error: studentError } = await supabase.from('students').insert([student]).select();
        if (studentError) throw studentError;
        
        const newStudentId = studentData[0].id;

        if (formData.get('parent_first_name') && formData.get('parent_last_name')) {
          const parent = {
            first_name: formData.get('parent_first_name'),
            last_name: formData.get('parent_last_name'),
            phone: formData.get('parent_phone'),
            email: formData.get('parent_email'),
          };
          const { data: parentData, error: parentError } = await supabase.from('parents').insert([parent]).select();
          if (!parentError && parentData && parentData.length > 0) {
            await supabase.from('student_parents').insert([{
              student_id: newStudentId,
              parent_id: parentData[0].id,
              relation_type: 'Parent'
            }]);
          }
        }

        if (formData.get('reg_fee_amount')) {
          const invoice = {
            student_id: newStudentId,
            amount: formData.get('reg_fee_amount'),
            motif: 'Frais d\'inscription et Scolarité',
            payment_method: formData.get('reg_fee_method'),
            status: 'Payée',
            invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
          };
          await supabase.from('invoices').insert([invoice]);
        }

        alert("Inscription réussie ! L'élève, ses parents et ses frais ont été enregistrés.");
        fetchStudents();
      } 
      else if (activeModal === 'teacher') {
        const teacherMatricule = 'PRF-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000);
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
        const { error } = await supabase.from('teachers').insert([teacher]);
        if (error) throw error;
        alert(`Le professeur a été créé.\n\nEmail : ${teacher.email}\nMot de passe : ${password}\n\nVeuillez transmettre ces informations au professeur.`);
        fetchTeachers();
      }
      else if (activeModal === 'employee') {
        const employee = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          role: formData.get('role'),
          phone: formData.get('phone'),
          email: formData.get('email'),
        };
        const { error } = await supabase.from('employees').insert([employee]);
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
        const { error } = await supabase.from('absences').insert([absence]);
        if (error) throw error;
        fetchAbsences();
      }
      else if (activeModal === 'payment') {
        const invoice = {
          student_id: formData.get('student_id'),
          amount: formData.get('amount'),
          motif: formData.get('motif'),
          payment_method: formData.get('payment_method'),
          status: 'Payée',
          invoice_number: 'FAC-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
        };
        const { error } = await supabase.from('invoices').insert([invoice]);
        if (error) throw error;
        fetchInvoices();
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
        const { error } = await supabase.from('schedules').insert([schedule]);
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
        const { error } = await supabase.from('evaluations').insert([evaluation]);
        if (error) throw error;
        fetchEvaluations();
      }
      else if (activeModal === 'bulletin') {
        alert("Génération terminée ! Le document va être téléchargé.");
        const blob = new Blob(["----- BULLETINS SGES PRO -----\n\nClasse : " + formData.get('classe') + "\nPériode : " + formData.get('trimestre') + "\n\nCeci est un document généré automatiquement pour tous les élèves de la classe.\n[Signature: Direction]"], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `bulletins_${formData.get('classe')}.txt`;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
      else if (activeModal === 'course') {
        alert("Le cours a été planifié avec succès !");
      }
      else if (activeModal === 'message') {
        alert("Le message a été envoyé avec succès !");
      }
      else if (activeModal === 'parent') {
        alert("Le parent a été ajouté avec succès !");
      }
      
      closeModal();
    } catch (error: any) {
      alert("Erreur: " + error.message);
    }
  };

  const handleDocumentUpload = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!selectedStudent || !currentSchoolId) return;
    
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

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: string) => {
    setGradesInput(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
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

  const renderDashboard = () => {
    // Computing Dynamic Data
    const totalStudents = studentsData.length;
    const totalTeachers = teachersData.length;
    const totalClasses = classesData.length;
    const totalAbsences = absencesData.length;

    // Last 3 absences
    const recentAbsences = [...absencesData].sort((a, b) => new Date(b.date).getTime() - new Date(a.date).getTime()).slice(0, 4);
    
    // Upcoming evaluations
    const upcomingEvals = [...evaluationsData]
      .filter(e => new Date(e.date) >= new Date())
      .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime())
      .slice(0, 4);

    // Data for PieChart
    const classDistribution = classesData.map(c => ({
      name: c.name,
      value: studentsData.filter(s => s.class_id === c.id).length
    })).filter(c => c.value > 0);
    const COLORS = ['#3b82f6', '#10b981', '#f59e0b', '#ec4899', '#8b5cf6', '#06b6d4'];

    return (
      <div className="animate-fade-in">
        <div className="page-header">
          <div>
            <h1 className="page-title">{t('dashboard.welcome', 'Bienvenue, {{name}} 👋', {name: session?.user?.email?.split('@')[0] || 'Adama'})}</h1>
            <p className="page-subtitle">{t('dashboard.overview', "Voici l'aperçu de votre établissement pour aujourd'hui.")}</p>
          </div>
          <button className="btn btn-outline" onClick={() => {
            alert(t('dashboard.generating_report', "Génération du rapport en cours..."));
            const reportContent = t('dashboard.report_content', "----- RAPPORT GLOBAL SGES PRO -----\n\nTotal Élèves: {{students}}\nProfesseurs: {{teachers}}\nClasses: {{classes}}\nAbsences Totales: {{absences}}\n\nCe rapport a été généré automatiquement.", {
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

        {/* Dynamic Stats */}
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
          
          <div className="stat-card delay-300">
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
    const filteredStudents = studentsData.filter(s => 
      (s.first_name + ' ' + s.last_name + ' ' + s.matricule).toLowerCase().includes(searchQuery.toLowerCase())
    );

    return (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.students.title', 'Gestion des Élèves')}</h1>
          <p className="page-subtitle">{t('admin.students.subtitle', 'Annuaire complet, dossiers scolaires et suivi des absences.')}</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-outline" onClick={() => setActiveModal('absence')} style={{color: 'var(--warning-color)', borderColor: 'var(--warning-color)'}}>
            <Icons.Activity /> {t('admin.students.btn_absence', 'Signaler Absence')}
          </button>
          <button className="btn btn-outline" onClick={() => setActiveModal('import')}><Icons.Download /> {t('admin.students.btn_import', 'Importer')}</button>
          <button className="btn btn-primary" onClick={() => setActiveModal('student')}>
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

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.students.panel_title', 'Annuaire des Élèves')}</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input 
              type="text" 
              placeholder={t('admin.students.search_ph', 'Rechercher par nom, matricule...')} 
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
        </div>
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
                <td style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{formatNum(row.matricule)}</td>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.first_name} {row.last_name}</td>
                <td style={{padding: '16px 0'}}>{row.classes?.name || t('admin.students.unassigned', 'Non assigné')}</td>
                <td style={{padding: '16px 0'}}><span className={`badge ${row.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
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
          <h1 className="page-title">{t('admin.pedagogy.title', 'Pédagogie & Évaluations')}</h1>
          <p className="page-subtitle">{t('admin.pedagogy.subtitle', 'Suivi des cours, cahiers de textes et gestion des devoirs.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('course')}>
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

      <div className="panel delay-300">
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
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.pedagogy.empty_state', 'Aucune évaluation enregistrée.')}</td></tr>
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
          <h3 className="panel-title">{t('admin.bulletins.panel_title', 'Trimestre en cours (T2)')}</h3>
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
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => alert("Génération du PDF en cours...")}><Icons.Download /> {t('admin.bulletins.btn_export', 'Exporter')}</button>
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
              <span className={`badge ${staff.status === 'Actif' ? 'badge-success' : 'badge-warning'}`}>{staff.status}</span>
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
        <button className="btn btn-primary" onClick={() => setActiveModal('teacher')}>
          <Icons.Plus /> {t('admin.teachers.btn_add', 'Ajouter Enseignant')}
        </button>
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
                <td style={{padding: '16px 0'}}><span className="badge badge-primary" style={{background: 'transparent', border: '1px solid var(--border-color)'}}>{row.subject}</span></td>
                <td style={{padding: '16px 0', fontWeight: '500'}}>{formatNum(row.matricule) || '-'}</td>
                <td style={{padding: '16px 0'}}>{row.password ? '••••••••' : '-'}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert(`Identifiants pour ${row.first_name} ${row.last_name}:\n\nMatricule: ${row.matricule}\nMot de passe: ${row.password}`)}>{t('admin.teachers.btn_view_ids', 'Voir les identifiants')}</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0'}}>{t('admin.teachers.empty_state', 'Aucun enseignant trouvé. Cliquez sur Ajouter.')}</td></tr>
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
            <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.parents.empty_state', 'Aucun parent enregistré.')}</td></tr>
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
                    <td style={{padding: '12px', border: '1px solid var(--border-color)', textAlign: 'center', fontWeight: 500, color: 'var(--text-secondary)'}}>{formatNum(hour)}</td>
                    {days.map((day) => {
                      const courses = currentSchedules.filter(s => s.day_of_week === day && s.start_time.startsWith(hour));
                      return (
                        <td key={day} style={{padding: '8px', border: '1px solid var(--border-color)', verticalAlign: 'top', height: '80px'}}>
                          {courses.map((course, i) => (
                            <div key={i} style={{background: 'rgba(59, 130, 246, 0.1)', borderLeft: '3px solid var(--primary-color)', padding: '6px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.85rem'}}>
                              <div style={{fontWeight: 600, color: 'var(--primary-color)'}}>{course.subject}</div>
                              <div style={{color: 'var(--text-secondary)', fontSize: '0.75rem'}}>{formatNum(course.start_time.substring(0,5))} - {formatNum(course.end_time.substring(0,5))}</div>
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

  const renderScolarite = () => currentSchoolPlan !== 'Pro' ? renderPremiumOverlay(t('admin.finance.premium_title', "Comptabilité & Scolarité"), t('admin.finance.premium_desc', "Gérez les factures, les paiements de scolarité et suivez votre trésorerie avec le plan Pro.")) : (
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

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">{t('admin.finance.stat_rate', 'Taux de Recouvrement')}</span>
            <Icons.TrendingUp />
          </div>
          <div className="stat-value">{formatNum(0)}%</div>
          <div className="stat-trend trend-up">
            {t('admin.finance.stat_rate_desc', 'Ce mois-ci')}
          </div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">{t('admin.finance.stat_rem', 'Reste à Recouvrer')}</span>
            <Icons.Database />
          </div>
          <div className="stat-value">{formatNum(0)}</div>
          <div className="stat-trend trend-down">
            FCFA
          </div>
        </div>

        <div className="stat-card delay-300">
          <div className="stat-header">
            <span className="stat-label">{t('admin.finance.stat_today', 'Paiements du Jour')}</span>
            <Icons.CreditCard />
          </div>
          <div className="stat-value">{formatNum(0)}</div>
          <div className="stat-trend trend-up">
            FCFA {t('admin.finance.stat_today_desc', "aujourd'hui")}
          </div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">{t('admin.finance.panel_title', 'Dernières Transactions')}</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder={t('admin.finance.search_ph', 'Rechercher un reçu, un élève...')} />
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
            </tr>
          </thead>
          <tbody>
            {invoicesData.length > 0 ? invoicesData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontFamily: 'monospace', fontWeight: 500, color: 'var(--primary-color)'}}>{formatNum(row.invoice_number)}</td>
                <td style={{padding: '16px 0'}}>
                  <div style={{fontWeight: 600}}>{row.students?.first_name} {row.students?.last_name}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{formatNum(row.students?.matricule)}</div>
                </td>
                <td style={{padding: '16px 0'}}>{row.motif}</td>
                <td style={{padding: '16px 0', fontWeight: 'bold'}}>{formatNum(row.amount)} FCFA</td>
                <td style={{padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{new Date(row.issue_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={`badge ${row.status === 'Payée' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>{t('admin.finance.empty_state', 'Aucun paiement enregistré.')}</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
  const renderGrades = () => {
    // Determine which evaluations to show based on selected class
    const filteredEvaluations = evaluationsData.filter(e => 
      (!selectedClassForGrades || e.class_id === selectedClassForGrades) &&
      (!selectedSubjectForGrades || e.subject === selectedSubjectForGrades) &&
      (!selectedPeriodForGrades || e.period === selectedPeriodForGrades)
    );

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
                      <th>{t('admin.grades.col_type', 'Type')}</th>
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
                        <td><span className="badge" style={{background: 'var(--surface-color-hover)'}}>{evalu.type}</span></td>
                        <td>{formatNum(evalu.max_score)}</td>
                        <td>
                          <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.8rem'}} onClick={() => startGrading(evalu)}>{t('admin.grades.btn_grade', 'Saisir les notes')}</button>
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
                    {studentsData.filter(s => s.class_id === activeEvaluation.class_id).map((student) => (
                      <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                        <td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}><input type="checkbox" /></td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{formatNum(student.matricule) || `MAT-${formatNum(student.id.substring(0,4))}`}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{activeEvaluation.classes?.name}</td>
                        <td style={{padding: '8px', borderRight: '1px solid #eee'}}>
                          <input 
                            type="number" 
                            step="0.25" 
                            min="0" 
                            max={activeEvaluation.max_score}
                            style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none'}}
                            value={gradesInput[student.id]?.score || ''}
                            onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                          />
                        </td>
                        <td style={{padding: '8px'}}>
                          <select 
                            style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none', background: '#fff'}}
                            value={gradesInput[student.id]?.comment || ''}
                            onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value)}
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

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">{t('admin.settings.title', 'Paramètres')}</h1>
          <p className="page-subtitle">{t('admin.settings.subtitle', 'Configuration globale du système et de votre établissement.')}</p>
        </div>
        <button className="btn btn-primary" onClick={() => (document.getElementById('settingsForm') as HTMLFormElement)?.requestSubmit()}>{t('admin.settings.btn_save', 'Sauvegarder')}</button>
      </div>

      <div className="dashboard-grid" style={{gridTemplateColumns: '250px 1fr'}}>
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
              </div>
            </form>
          )}

          {activeSettingsTab === 'academic' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>{t('admin.settings.acad_title', 'Paramètres Pédagogiques')}</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{t('admin.settings.acad_year', 'Année Scolaire en cours')}</label>
                  <select className="form-select">
                    <option>{formatNum(2026)} - {formatNum(2027)}</option>
                    <option>{formatNum(2025)} - {formatNum(2026)}</option>
                  </select>
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
                    <div style={{width: 44, height: 24, borderRadius: 12, background: 'var(--primary-color)', position: 'relative', cursor: 'pointer'}}>
                      <div style={{width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, right: 2}}></div>
                    </div>
                    <span style={{fontSize: '0.95rem'}}>{t('admin.settings.sec_2fa_desc', 'Exiger le 2FA pour tous les administrateurs')}</span>
                  </div>
                </div>
                <div>
                  <h4 style={{marginBottom: '12px'}}>{t('admin.settings.sec_roles', 'Gestion des Rôles')}</h4>
                  <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <span className="badge badge-primary">{t('admin.settings.sec_role_dir', 'Directeur')}</span>
                    <span className="badge badge-success">{t('admin.settings.sec_role_dsi', 'Administrateur DSI')}</span>
                    <span className="badge" style={{border: '1px solid var(--border-color)', background: 'transparent'}}>{t('admin.settings.sec_role_teacher', 'Enseignant')}</span>
                    <span className="badge" style={{border: '1px solid var(--border-color)', background: 'transparent'}}>{t('admin.settings.sec_role_parent', 'Parent')}</span>
                  </div>
                  <button className="btn btn-outline" style={{marginTop: '12px', fontSize: '0.8rem'}}>{t('admin.settings.sec_btn_perm', 'Configurer les permissions')}</button>
                </div>
                <div>
                  <h4 style={{marginBottom: '12px'}}>{t('admin.settings.sec_sessions', 'Sessions Actives')}</h4>
                  <div style={{padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--surface-color-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontWeight: 500}}>Windows PC - Chrome</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Dakar, SN • {t('admin.settings.sec_active', 'Actif maintenant')}</div>
                    </div>
                    <button className="btn btn-outline" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>{t('admin.settings.sec_btn_logout', 'Déconnecter')}</button>
                  </div>
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
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px'}}>{formatNum(0)} FCFA <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>{t('admin.settings.sub_month', '/mois')}</span></p>
                  <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    <li>✓ {t('admin.settings.sub_std_f1', 'Gestion des élèves et absences')}</li>
                    <li>✓ {t('admin.settings.sub_std_f2', 'Gestion des professeurs')}</li>
                    <li>✓ {t('admin.settings.sub_std_f3', 'Notes et bulletins')}</li>
                  </ul>
                  {currentSchoolPlan === 'Standard' ? (
                    <button className="btn" disabled style={{width: '100%', background: 'var(--border-color)', color: 'var(--text-secondary)'}}>{t('admin.settings.sub_btn_active', 'Plan Actif')}</button>
                  ) : (
                    <button className="btn" style={{width: '100%', border: '1px solid var(--border-color)'}} onClick={async () => {
                      const { error } = await supabase.from('schools').update({ subscription_plan: 'Standard' }).eq('id', currentSchoolId);
                      if (!error) {
                        setCurrentSchoolPlan('Standard');
                        setAdminSchools(adminSchools.map(s => s.id === currentSchoolId ? {...s, plan: 'Standard'} : s));
                      }
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
                  <p style={{fontSize: '1.5rem', fontWeight: 'bold', marginBottom: '16px'}}>{formatNum(25000)} FCFA <span style={{fontSize: '0.9rem', color: 'var(--text-secondary)', fontWeight: 'normal'}}>{t('admin.settings.sub_month', '/mois')}</span></p>
                  <ul style={{listStyle: 'none', padding: 0, margin: '0 0 24px 0', display: 'flex', flexDirection: 'column', gap: '8px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>
                    <li>✓ {t('admin.settings.sub_pro_f1', 'Toutes les fonctions Standard')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f2', 'Comptabilité & Facturation')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f3', 'Ressources Humaines')}</li>
                    <li>✓ {t('admin.settings.sub_pro_f4', 'Communication (SMS/Email)')}</li>
                  </ul>
                  {currentSchoolPlan === 'Pro' ? (
                    <button className="btn" disabled style={{width: '100%', background: 'var(--border-color)', color: 'var(--text-secondary)'}}>{t('admin.settings.sub_btn_active', 'Plan Actif')}</button>
                  ) : (
                    <button className="btn btn-primary" style={{width: '100%', background: 'var(--accent-color)', borderColor: 'var(--accent-color)'}} onClick={async () => {
                      const { error } = await supabase.from('schools').update({ subscription_plan: 'Pro' }).eq('id', currentSchoolId);
                      if (!error) {
                        setCurrentSchoolPlan('Pro');
                        setAdminSchools(adminSchools.map(s => s.id === currentSchoolId ? {...s, plan: 'Pro'} : s));
                        alert('Félicitations ! Vous avez débloqué le plan Pro.');
                      }
                    }}>{t('admin.settings.sub_btn_upgrade', 'Passer en Pro')}</button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!session && !studentSession && !teacherSession) {
    return <Auth onStudentLogin={(s) => setStudentSession(s)} onTeacherLogin={(t) => setTeacherSession(t)} />;
  }

  if (studentSession) {
    return <StudentPortal student={studentSession} onLogout={() => setStudentSession(null)} />;
  }

  if (teacherSession) {
    return <TeacherPortal session={teacherSession} onLogout={() => setTeacherSession(null)} />;
  }

  return (
    <div className="app-container">
      {/* Sidebar Overlay for Mobile */}
      <div className={`sidebar-overlay ${isMobileMenuOpen ? 'open' : ''}`} onClick={() => setIsMobileMenuOpen(false)}></div>
      
      {/* Sidebar */}
      <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
        <div className="sidebar-logo">
          <div className="logo-icon">{adminSchools.find(s => s.id === currentSchoolId)?.name?.charAt(0) || 'S'}</div>
          <span className="logo-text" style={{ fontSize: '1.1rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '180px' }}>{settingsData?.school_name || 'SGES Pro'}</span>
        </div>
        
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => { setActiveTab('dashboard'); setIsMobileMenuOpen(false); }}>
            <Icons.Home /> {t('admin.sidebar.dashboard', 'Tableau de bord')}
          </li>
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
            <Icons.BookOpen /> {t('admin.sidebar.pedagogy', 'Pédagogie')}
          </li>
          <li className={`nav-item ${activeTab === 'schedules' ? 'active' : ''}`} onClick={() => { setActiveTab('schedules'); setIsMobileMenuOpen(false); }}>
            <Icons.Calendar /> {t('admin.sidebar.schedules', 'Emplois du Temps')}
          </li>
          <li className={`nav-item ${activeTab === 'grades' ? 'active' : ''}`} onClick={() => { setActiveTab('grades'); setIsMobileMenuOpen(false); }}>
            <Icons.FileText /> {t('admin.sidebar.grades', 'Notes & Bulletins')}
          </li>
          <li className={`nav-item ${activeTab === 'bulletins' ? 'active' : ''}`} onClick={() => { setActiveTab('bulletins'); setIsMobileMenuOpen(false); }}>
            <Icons.FileText /> {t('admin.sidebar.bulletins', 'Bulletins')}
          </li>
          <li className={`nav-item ${activeTab === 'scolarite' ? 'active' : ''}`} onClick={() => { setActiveTab('scolarite'); setIsMobileMenuOpen(false); }}>
            <Icons.CreditCard /> {t('admin.sidebar.finance', 'Comptabilité & Scolarité')}
          </li>
          <li className={`nav-item ${activeTab === 'rh' ? 'active' : ''}`} onClick={() => { setActiveTab('rh'); setIsMobileMenuOpen(false); }}>
            <Icons.Briefcase /> {t('admin.sidebar.rh', 'RH & Admin')}
          </li>
          <li className={`nav-item ${activeTab === 'communication' ? 'active' : ''}`} onClick={() => { setActiveTab('communication'); setIsMobileMenuOpen(false); }}>
            <Icons.MessageSquare /> {t('admin.sidebar.communication', 'Communication')}
          </li>
          <li style={{flex: 1}}></li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => { setActiveTab('settings'); setIsMobileMenuOpen(false); }}>
            <Icons.Settings /> {t('admin.sidebar.settings', 'Paramètres')}
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
            <div className="header-search">
              <Icons.Search />
              <input type="text" placeholder={t('admin.header.search', 'Rechercher...')} />
            </div>
          </div>
          
          <div className="header-actions">
            <button className="btn btn-outline" style={{padding: '4px 8px'}} onClick={toggleLanguage}>
              {i18n.language.startsWith('ar') ? 'Français' : 'العربية'}
            </button>
            <div style={{display: 'flex', alignItems: 'center', gap: '8px', marginRight: '16px', background: 'var(--surface-color-hover)', padding: '4px 8px', borderRadius: '8px'}}>
              <Icons.Briefcase />
              <select 
                className="form-select" 
                style={{padding: '4px 24px 4px 8px', fontSize: '0.85rem', width: 'auto', border: 'none', background: 'transparent', fontWeight: 600, color: 'var(--text-color)'}}
                value={currentSchoolId || 'PLACEHOLDER'}
                onChange={(e) => {
                  if (e.target.value === 'NEW') {
                    setActiveModal('newSchool');
                  } else if (e.target.value !== 'PLACEHOLDER') {
                    setCurrentSchoolId(e.target.value);
                  }
                }}
              >
                {adminSchools.length === 0 && <option value="PLACEHOLDER" disabled>{t('admin.header.no_school', 'Aucun établissement')}</option>}
                {adminSchools.map(school => (
                  <option key={school.id} value={school.id}>{school.name}</option>
                ))}
                <option value="NEW">{t('admin.header.new_school', '+ Nouvel établissement')}</option>
              </select>
            </div>
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
                    <span>{t('admin.header.logout', 'Déconnexion')}</span>
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
          {activeTab === 'teachers' && renderTeachers()}
          {activeTab === 'parents' && renderParents()}
          {activeTab === 'scolarite' && renderScolarite()}
          {activeTab === 'grades' && renderGrades()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Dynamic Modal Renderer */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeModal === 'quickCreate' && t('admin.modals.quickCreate', "Menu de Création Rapide")}
                {activeModal === 'payment' && t('admin.modals.payment', "Enregistrer un Paiement")}
                {activeModal === 'absence' && t('admin.modals.absence', "Signaler une Absence")}
                {activeModal === 'student' && t('admin.modals.student', "Nouvelle Inscription")}
                {activeModal === 'teacher' && t('admin.modals.teacher', "Ajouter un Enseignant")}
                {activeModal === 'employee' && t('admin.modals.employee', "Ajouter un Employé")}
                {activeModal === 'parent' && t('admin.modals.parent', "Ajouter un Parent")}
                {activeModal === 'message' && t('admin.modals.message', "Nouveau Message")}
                {activeModal === 'bulletin' && t('admin.modals.bulletin', "Générer Bulletins")}
                {activeModal === 'course' && t('admin.modals.course', "Planifier un cours")}
                {activeModal === 'newSchool' && t('admin.modals.newSchool', "Créer un Établissement")}
                {activeModal === 'class' && t('admin.modals.class', "Créer une Classe")}
              </h2>
              <button className="close-btn" onClick={closeModal}>
                <Icons.X />
              </button>
            </div>
            
            <div className="modal-body">
              {/* Quick Create Menu */}
              {activeModal === 'quickCreate' && (
                <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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

              {/* Class Form */}
              {activeModal === 'class' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.class_name', 'Nom de la classe')}</label>
                    <input type="text" name="name" className="form-input" placeholder="Ex: 6ème A, Terminale S1" required />
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.class_level', 'Niveau')}</label>
                    <select name="level" className="form-select" required>
                      <option value="Maternelle">Maternelle</option>
                      <option value="Primaire">Primaire</option>
                      <option value="Collège">Collège</option>
                      <option value="Lycée">Lycée</option>
                      <option value="Autre">Autre</option>
                    </select>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.create', 'Créer la classe')}</button>
                  </div>
                </form>
              )}

              {/* Payment Form */}
              {activeModal === 'payment' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.student_select', 'Élève')}</label>
                    <select name="student_id" className="form-select" required>
                      <option value="">Sélectionner un élève...</option>
                      {studentsData.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
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
                    <label>{t('admin.modals.amount', 'Montant (FCFA)')}</label>
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
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.submit', 'Valider le paiement')}</button>
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
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.last_name', 'Nom')}</label>
                      <input type="text" name="last_name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required />
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.birth_date', 'Date de Naissance')}</label>
                      <input type="date" name="birth_date" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.class_assign', 'Classe (Affectation)')}</label>
                      <select name="class_id" className="form-select" required>
                        <option value="">Choisir une classe...</option>
                        {classesData.map(cls => (
                          <option key={cls.id} value={cls.id}>{cls.name}</option>
                        ))}
                      </select>
                    </div>
                  </div>
                  <div style={{marginTop: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.password_default', 'Mot de passe (par défaut: passer123)')}</label>
                      <input type="text" name="password" className="form-input" placeholder="passer123" />
                    </div>
                  </div>

                  <h3 style={{marginTop: '24px', marginBottom: '16px', color: 'var(--primary-color)', fontSize: '1.1rem', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px'}}>{t('admin.modals.parent_info', '2. Informations du Parent / Tuteur')}</h3>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.parent_last_name', 'Nom du parent')}</label>
                      <input type="text" name="parent_last_name" className="form-input" />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.parent_first_name', 'Prénom du parent')}</label>
                      <input type="text" name="parent_first_name" className="form-input" />
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
                    <input type="number" name="reg_fee_amount" className="form-input" placeholder="Ex: 50000" />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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

                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">{t('admin.modals.complete_registration', "Valider l'inscription complète")}</button>
                  </div>
                </form>
              )}

              {/* General Form for Employees/Teachers/Parents */}
              {['employee', 'teacher', 'parent'].includes(activeModal) && (
                <form onSubmit={handleFormSubmit}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.last_name', 'Nom')}</label>
                      <input type="text" name="last_name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label>{t('admin.modals.first_name', 'Prénom(s)')}</label>
                      <input type="text" name="first_name" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>{t('admin.modals.phone', 'Numéro de Téléphone')}</label>
                    <input type="tel" name="phone" className="form-input" placeholder="+221 77 000 00 00" required />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>{t('admin.modals.email', 'Email')}</label>
                      <input type="email" name="email" className="form-input" required={activeModal === 'teacher'} />
                    </div>
                    {['teacher', 'employee'].includes(activeModal) && (
                      <div className="form-group">
                        <label>{t('admin.modals.password_optional', 'Mot de passe (facultatif)')}</label>
                        <input type="text" name="password" className="form-input" placeholder="Généré automatiquement" />
                      </div>
                    )}
                  </div>
                  {activeModal === 'teacher' && (
                    <div className="form-group">
                      <label>{t('admin.modals.taught_subject', 'Matière enseignée')}</label>
                      <input type="text" name="subject" className="form-input" required />
                    </div>
                  )}
                  {activeModal === 'employee' && (
                    <div className="form-group">
                      <label>{t('admin.modals.role', 'Poste / Rôle')}</label>
                      <input type="text" name="role" className="form-input" required />
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
                    <button type="submit" className="btn btn-primary">{t('admin.modals.create_profile', 'Créer le profil')}</button>
                  </div>
                </form>
              )}

              {/* Evaluation Form */}
              {activeModal === 'evaluation' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>{t('admin.modals.eval_name', "Nom de l'évaluation")}</label>
                    <input type="text" name="name" className="form-input" required placeholder="Ex: Devoir de Mathématiques N°1" />
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
                      <input type="text" name="subject" className="form-input" required placeholder="Ex: Mathématiques" />
                    </div>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
              {['bulletin', 'course'].includes(activeModal) && (
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
                  {activeModal === 'course' && (
                    <>
                      <div className="form-group">
                        <label>{t('admin.modals.taught_subject', 'Matière')}</label>
                        <input type="text" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label>{t('admin.modals.date_time', 'Date et Heure')}</label>
                        <input type="datetime-local" className="form-input" required />
                      </div>
                    </>
                  )}
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>{t('admin.modals.cancel', 'Annuler')}</button>
                    <button type="submit" className="btn btn-primary">
                      {activeModal === 'bulletin' ? t('admin.modals.generate', 'Lancer la génération') : t('admin.modals.plan', 'Planifier')}
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
                  </div>

                  {activeDossierTab === 'infos' && (
                    <div>
                      <h3 style={{marginBottom: '12px', borderBottom: '1px solid var(--border-color)', paddingBottom: '8px', fontSize: '1.1rem'}}>{t('admin.modals.school_infos', 'Informations Scolaires')}</h3>
                      <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px', marginBottom: '24px'}}>
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
                              const dayCourses = schedulesData.filter(s => s.class_id === selectedStudent.class_id && s.day_of_week === day).sort((a,b) => a.start_time.localeCompare(b.start_time));
                              if (dayCourses.length === 0) return null;
                              return (
                                <div key={day} style={{border: '1px solid var(--border-color)', borderRadius: '6px', padding: '8px'}}>
                                  <div style={{fontWeight: 600, borderBottom: '1px solid var(--border-color)', paddingBottom: '4px', marginBottom: '8px', textAlign: 'center'}}>{day}</div>
                                  {dayCourses.map((course, idx) => (
                                    <div key={idx} style={{background: 'var(--surface-color-hover)', padding: '6px', borderRadius: '4px', marginBottom: '4px', fontSize: '0.8rem'}}>
                                      <div style={{fontWeight: 600, color: 'var(--primary-color)'}}>{course.subject}</div>
                                      <div>{course.start_time.substring(0,5)} - {course.end_time.substring(0,5)}</div>
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
                          <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '12px'}}>
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

                  <div style={{marginTop: '32px', display: 'flex', justifyContent: 'flex-end'}}>
                    <button type="button" className="btn btn-primary" onClick={closeModal}>{t('admin.modals.close_dossier', 'Fermer le dossier')}</button>
                  </div>
                </div>
              )}

              {/* Schedule Form */}
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
                    <input type="text" name="subject" className="form-input" required placeholder="Ex: Mathématiques" />
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
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
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
    </div>
  );
}

export default App;
