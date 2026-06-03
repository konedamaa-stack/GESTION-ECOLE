import { useState, useEffect } from 'react';
import { supabase } from './lib/supabase';
import type { Session } from '@supabase/supabase-js';
import Auth from './components/Auth';
import './App.css';

// Custom SVG Icons
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
  GraduationCap: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M22 10v6M2 10l10-5 10 5-10 5z"/><path d="M6 12v5c3 3 9 3 12 0v-5"/></svg>,
  Heart: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>,
  CreditCard: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><rect x="1" y="4" width="22" height="16" rx="2" ry="2" strokeLinecap="round" strokeLinejoin="round" /><line x1="1" y1="10" x2="23" y2="10" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  TrendingUp: () => <svg className="stat-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18" strokeLinecap="round" strokeLinejoin="round"/><polyline points="17 6 23 6 23 12" strokeLinecap="round" strokeLinejoin="round"/></svg>
};

function App() {
  const [session, setSession] = useState<Session | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [activeSettingsTab, setActiveSettingsTab] = useState('general');
  const [activeModal, setActiveModal] = useState<string | null>(null);

  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [classesData, setClassesData] = useState<any[]>([]);
  const [teachersData, setTeachersData] = useState<any[]>([]);
  const [employeesData, setEmployeesData] = useState<any[]>([]);
  const [invoicesData, setInvoicesData] = useState<any[]>([]);
  const [absencesData, setAbsencesData] = useState<any[]>([]);
  const [settingsData, setSettingsData] = useState<any | null>(null);

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
    if (session) {
      fetchStudents();
      fetchClasses();
      fetchTeachers();
      fetchEmployees();
      fetchInvoices();
      fetchAbsences();
      fetchSettings();
    }
  }, [session]);

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
  const fetchSettings = async () => {
    const { data } = await supabase.from('school_settings').select('*').single();
    if (data) setSettingsData(data);
  };

  const saveSettings = async (e: any) => {
    e.preventDefault();
    const formData = new FormData(e.target);
    const updates = {
      school_name: formData.get('school_name'),
      address: formData.get('address'),
      phone: formData.get('phone'),
      email: formData.get('email'),
      director_name: formData.get('director_name'),
    };
    const { error } = await supabase.from('school_settings').update(updates).eq('id', 1);
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
    
    try {
      if (activeModal === 'student') {
        const student = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          matricule: 'ELV-' + new Date().getFullYear() + '-' + Math.floor(Math.random() * 10000),
          class_id: formData.get('class_id'),
          birth_date: formData.get('birth_date'),
        };
        const { error } = await supabase.from('students').insert([student]);
        if (error) throw error;
        fetchStudents();
      } 
      else if (activeModal === 'teacher') {
        const teacher = {
          first_name: formData.get('first_name'),
          last_name: formData.get('last_name'),
          subject: formData.get('subject'),
          phone: formData.get('phone'),
          email: formData.get('email'),
        };
        const { error } = await supabase.from('teachers').insert([teacher]);
        if (error) throw error;
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
      
      closeModal();
    } catch (err: any) {
      alert("Erreur : " + err.message);
    }
  };

  const renderDashboard = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Bienvenue, Adama 👋</h1>
          <p className="page-subtitle">Voici l'aperçu de votre établissement pour aujourd'hui.</p>
        </div>
        <button className="btn btn-outline" onClick={() => alert("Rapport en cours de téléchargement...")}>
          Télécharger le rapport
        </button>
      </div>

      {/* Stats */}
      <div className="stats-grid">
        <div className="stat-card delay-100" onClick={() => setActiveTab('students')} style={{cursor: 'pointer'}}>
          <div className="stat-header">
            <span className="stat-label">Total Élèves</span>
            <Icons.Users />
          </div>
          <div className="stat-value">1,248</div>
          <div className="stat-trend trend-up">
            ↑ 12% vs le mois dernier
          </div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">Présence Aujourd'hui</span>
            <Icons.CheckCircle />
          </div>
          <div className="stat-value">96.4%</div>
          <div className="stat-trend trend-up">
            ↑ 0.5% vs hier
          </div>
        </div>

        <div className="stat-card delay-300">
          <div className="stat-header">
            <span className="stat-label">Nouvelles Inscriptions</span>
            <Icons.UserPlus />
          </div>
          <div className="stat-value">42</div>
          <div className="stat-trend trend-up">
            ↑ 5% vs l'année dernière
          </div>
        </div>
      </div>

      {/* Grid Panels */}
      <div className="dashboard-grid">
        {/* Recent Activity */}
        <div className="panel delay-200">
          <div className="panel-header">
            <h3 className="panel-title">Activité Récente</h3>
            <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}}>Tout voir</button>
          </div>
          <div className="activity-list">
            <div className="activity-item">
              <div className="activity-dot" style={{backgroundColor: 'var(--primary-color)'}}></div>
              <div className="activity-content">
                <h4>Bulletin trimestriel publié</h4>
                <p>Les bulletins du 2ème trimestre pour la classe Terminale S1 ont été générés.</p>
                <span className="activity-time">Il y a 2 heures</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" style={{backgroundColor: 'var(--accent-color)'}}></div>
              <div className="activity-content">
                <h4>Nouveau message parent</h4>
                <p>Mme. Dubois a envoyé un message concernant l'absence de Thomas.</p>
                <span className="activity-time">Il y a 4 heures</span>
              </div>
            </div>
            <div className="activity-item">
              <div className="activity-dot" style={{backgroundColor: 'var(--warning-color)'}}></div>
              <div className="activity-content">
                <h4>Alerte absence</h4>
                <p>L'élève Karim N'Diaye (1ère L) a dépassé le seuil de 5 absences non justifiées.</p>
                <span className="activity-time">Il y a 1 jour</span>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="panel delay-300">
          <div className="panel-header">
            <h3 className="panel-title">Actions Rapides</h3>
          </div>
          <div className="quick-actions">
            <div className="quick-action-btn" onClick={() => setActiveModal('student')}>
              <div className="stat-icon" style={{width: 48, height: 48, marginBottom: 8}}><Icons.Plus /></div>
              Inscrire Élève
            </div>
            <div className="quick-action-btn" onClick={() => setActiveModal('absence')}>
              <div className="stat-icon" style={{width: 48, height: 48, marginBottom: 8, color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}}><Icons.Activity /></div>
              Signaler Absence
            </div>
            <div className="quick-action-btn" onClick={() => setActiveModal('message')}>
              <div className="stat-icon" style={{width: 48, height: 48, marginBottom: 8, color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}}><Icons.Send /></div>
              SMS Parents
            </div>
            <div className="quick-action-btn" onClick={() => setActiveTab('scolarite')}>
              <div className="stat-icon" style={{width: 48, height: 48, marginBottom: 8, color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)'}}><Icons.CreditCard /></div>
              Scolarité
            </div>
          </div>
        </div>
      </div>
    </div>
  );

  const renderStudents = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Élèves</h1>
          <p className="page-subtitle">Annuaire complet, dossiers scolaires et suivi des absences.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-outline" onClick={() => setActiveModal('absence')} style={{color: 'var(--warning-color)', borderColor: 'var(--warning-color)'}}>
            <Icons.Activity /> Signaler Absence
          </button>
          <button className="btn btn-outline" onClick={() => setActiveModal('import')}><Icons.Download /> Importer</button>
          <button className="btn btn-primary" onClick={() => setActiveModal('student')}>
            <Icons.Plus /> Inscrire
          </button>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">Effectif Total</span>
            <Icons.Users />
          </div>
          <div className="stat-value">1,248</div>
          <div className="stat-trend trend-up">52% Filles / 48% Garçons</div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">Absences Non Justifiées</span>
            <Icons.Activity />
          </div>
          <div className="stat-value">14</div>
          <div className="stat-trend trend-down">Alerte : 3 élèves en décrochage</div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">Annuaire des Élèves</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder="Rechercher par nom, matricule..." />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Matricule</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Nom & Prénom</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {studentsData.length > 0 ? studentsData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontFamily: 'monospace', color: 'var(--primary-color)'}}>{row.matricule}</td>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.first_name} {row.last_name}</td>
                <td style={{padding: '16px 0'}}>{row.classes?.name || 'Non assigné'}</td>
                <td style={{padding: '16px 0'}}><span className={`badge ${row.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => setActiveModal('studentDossier')}>Dossier</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{padding: '24px 0', textAlign: 'center', color: 'var(--text-secondary)'}}>Aucun élève trouvé. Cliquez sur Inscrire.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderAbsences = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Absences</h1>
          <p className="page-subtitle">Suivi des présences et justification des absences.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('absence')}>
          <Icons.Plus /> Signaler une Absence
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">Registre des Absences</h3>
          <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveModal('message')}>
            <Icons.Mail /> Notifier les parents
          </button>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Élève</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Motif / Justification</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Date/Durée</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {absencesData.length > 0 ? absencesData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.students?.first_name} {row.students?.last_name}</td>
                <td style={{padding: '16px 0'}}>{row.students?.classes?.name || 'Non assigné'}</td>
                <td style={{padding: '16px 0'}}>
                  <span className="badge badge-warning">{row.motif}</span>
                </td>
                <td style={{padding: '16px 0', color: 'var(--text-secondary)'}}>{row.duration}</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveModal('message')}>Contacter Parent</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>Aucune absence enregistrée.</td></tr>
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
          <h1 className="page-title">Pédagogie & Évaluations</h1>
          <p className="page-subtitle">Suivi des cours, cahiers de textes et gestion des devoirs.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('course')}>
          <Icons.Plus /> Planifier un cours
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">Classes Actives</span>
            <Icons.BookOpen />
          </div>
          <div className="stat-value">24</div>
          <div className="stat-trend trend-up">Toutes les classes ont un emploi du temps</div>
        </div>
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">Évaluations cette semaine</span>
            <Icons.FileText />
          </div>
          <div className="stat-value">18</div>
          <div className="stat-trend trend-up">5 devoirs sur table, 13 contrôles continus</div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">Prochaines Évaluations</h3>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Date</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Matière</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Professeur</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {[
              { date: 'Demain, 08:00', subject: 'Mathématiques', class: 'Terminale S1', prof: 'Mme. Fall', status: 'Planifié', badge: 'badge-primary' },
              { date: 'Vendredi, 10:00', subject: 'SVT', class: '1ère S3', prof: 'M. Dubois', status: 'Planifié', badge: 'badge-primary' },
              { date: 'Hier', subject: 'Français', class: 'Seconde 4', prof: 'Mme. Kone', status: 'Correction', badge: 'badge-warning' },
              { date: 'Lundi dernier', subject: 'Physique', class: 'Terminale S1', prof: 'M. Diallo', status: 'Notes publiées', badge: 'badge-success' },
            ].map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.date}</td>
                <td style={{padding: '16px 0'}}>{row.subject}</td>
                <td style={{padding: '16px 0', color: 'var(--text-secondary)'}}>{row.class}</td>
                <td style={{padding: '16px 0'}}>{row.prof}</td>
                <td style={{padding: '16px 0'}}><span className={`badge ${row.badge}`}>{row.status}</span></td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderCommunication = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Communication ENT</h1>
          <p className="page-subtitle">Messagerie interne, annonces et liaison avec les familles.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('message')}>
          <Icons.Mail /> Nouveau Message
        </button>
      </div>

      <div className="dashboard-grid">
        <div className="panel delay-100" style={{gridColumn: 'span 2'}}>
          <div className="panel-header">
            <h3 className="panel-title">Boîte de réception & Annonces</h3>
            <div style={{display: 'flex', gap: '8px'}}>
              <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert('Tous les messages marqués comme lus.')}>Tout marquer comme lu</button>
            </div>
          </div>
          <div className="activity-list">
            {[
              { sender: 'Mme. Dubois (Parent)', subject: 'Absence de Thomas - Certificat médical', time: '10:45', read: false },
              { sender: 'Direction', subject: 'Rappel : Conseil de classe Term S1', time: 'Hier, 16:20', read: true },
              { sender: 'M. Diallo (Prof)', subject: 'Demande de matériel pour TP de physique', time: 'Lundi, 09:15', read: true },
              { sender: 'Système ENT', subject: 'Rapport hebdomadaire des absences', time: 'Dimanche, 23:59', read: true },
            ].map((msg, i) => (
              <div key={i} className="activity-item" style={{cursor: 'pointer', padding: '16px', borderRadius: '12px', background: msg.read ? 'transparent' : 'var(--surface-color-hover)', border: msg.read ? '1px solid var(--border-color)' : '1px solid var(--primary-color)'}}>
                <div className="activity-dot" style={{backgroundColor: msg.read ? 'transparent' : 'var(--primary-color)', width: 12, height: 12, border: msg.read ? '2px solid var(--text-secondary)' : 'none'}}></div>
                <div className="activity-content" style={{flex: 1, marginLeft: '8px'}}>
                  <div className="flex-between">
                    <h4 style={{fontWeight: msg.read ? 500 : 700}}>{msg.sender}</h4>
                    <span className="activity-time">{msg.time}</span>
                  </div>
                  <p style={{color: msg.read ? 'var(--text-secondary)' : 'var(--text-primary)', marginTop: '4px'}}>{msg.subject}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );

  const renderBulletins = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Gestion des Bulletins</h1>
          <p className="page-subtitle">Édition, calcul des moyennes et envois aux parents.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('bulletin')}>
          <Icons.Plus /> Générer Bulletins
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">Trimestre en cours (T2)</h3>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Prof. Principal</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Moy. Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { class: 'Terminale S1', prof: 'M. Dubois', moy: '13.4', status: 'Terminé', badge: 'badge-success' },
              { class: 'Terminale L2', prof: 'Mme. Martin', moy: '12.1', status: 'En attente conseils', badge: 'badge-warning' },
              { class: '1ère S3', prof: 'M. Diallo', moy: '11.8', status: 'Saisie en cours', badge: 'badge-primary' },
              { class: 'Seconde 4', prof: 'Mme. Fall', moy: '14.2', status: 'Terminé', badge: 'badge-success' },
            ].map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>{row.class}</td>
                <td style={{padding: '16px 0'}}>{row.prof}</td>
                <td style={{padding: '16px 0', fontWeight: 'bold'}}>{row.moy}</td>
                <td style={{padding: '16px 0'}}><span className={`badge ${row.badge}`}>{row.status}</span></td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px'}} onClick={() => alert("Génération du PDF en cours...")}><Icons.Download /> Exporter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderRH = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Ressources Humaines</h1>
          <p className="page-subtitle">Gestion globale du personnel (Administratif, Survie, etc.).</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('employee')}>
          <Icons.Plus /> Ajouter Employé
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">Personnel Admin.</span>
            <Icons.Briefcase />
          </div>
          <div className="stat-value">28</div>
          <div className="stat-trend trend-up">Secrétariat, Direction, etc.</div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">Congés en cours</span>
            <Icons.Activity />
          </div>
          <div className="stat-value">2</div>
          <div className="stat-trend trend-down">Sur 112 personnels total</div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">Personnel Administratif</h3>
          <div className="header-search" style={{width: 250}}>
            <Icons.Search />
            <input type="text" placeholder="Rechercher..." />
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
            <div style={{gridColumn: '1 / -1', textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>Aucun employé trouvé. Cliquez sur Ajouter.</div>
          )}
        </div>
      </div>
    </div>
  );

  const renderTeachers = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Enseignants</h1>
          <p className="page-subtitle">Gestion du corps professoral, emplois du temps et affectations.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('teacher')}>
          <Icons.Plus /> Ajouter Enseignant
        </button>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">Liste des Enseignants (84)</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder="Rechercher par nom ou matière..." />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Nom & Prénom</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Matière Principale</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Prof. Principal</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Heures/Semaine</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {teachersData.length > 0 ? teachersData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600, display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <div className="avatar" style={{width: 32, height: 32, fontSize: '0.9rem'}}>{row.first_name.charAt(0)}{row.last_name.charAt(0)}</div>
                  {row.first_name} {row.last_name}
                  {row.status === 'En congé' && <span style={{width: 8, height: 8, borderRadius: '50%', background: 'var(--warning-color)'}}></span>}
                </td>
                <td style={{padding: '16px 0'}}><span className="badge badge-primary" style={{background: 'transparent', border: '1px solid var(--border-color)'}}>{row.subject}</span></td>
                <td style={{padding: '16px 0', fontWeight: '500'}}>-</td>
                <td style={{padding: '16px 0'}}>-</td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-outline" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => alert("Affichage de l'emploi du temps...")}>Voir l'emploi du temps</button>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={5} style={{textAlign: 'center', padding: '24px 0'}}>Aucun enseignant trouvé. Cliquez sur Ajouter.</td></tr>
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
          <h1 className="page-title">Parents d'Élèves</h1>
          <p className="page-subtitle">Annuaire des tuteurs légaux, contacts d'urgence et accès ENT.</p>
        </div>
        <div style={{display: 'flex', gap: '12px'}}>
          <button className="btn btn-primary" onClick={() => setActiveModal('parent')}>
            <Icons.Plus /> Ajouter un Parent
          </button>
          <button className="btn btn-outline" onClick={() => setActiveModal('message')}>
            <Icons.Mail /> Envoyer un message
          </button>
        </div>
      </div>

      <div className="panel delay-100">
        <div className="panel-header">
          <h3 className="panel-title">Base de données Parents</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder="Rechercher un parent ou un élève..." />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>Nom du Parent</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Enfant(s) Associé(s)</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Téléphone</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Accès ENT</th>
              <th style={{padding: '12px 0', fontWeight: 500, textAlign: 'right'}}>Actions</th>
            </tr>
          </thead>
          <tbody>
            {[
              { parent: 'Mme. Fatou N\'Diaye', students: ['Karim N\'Diaye (1ère L)'], phone: '+221 77 123 45 67', ent: 'Connecté (hier)' },
              { parent: 'M. Alioune Fall', students: ['Aïssatou Fall (Term S1)', 'Moussa Fall (4ème)'], phone: '+221 78 987 65 43', ent: 'Connecté (Aujourd\'hui)' },
              { parent: 'Mme. Claire Dubois', students: ['Thomas Dubois (Seconde)'], phone: '+33 6 12 34 56 78', ent: 'Jamais connecté' },
            ].map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontWeight: 600}}>
                  {row.parent}
                </td>
                <td style={{padding: '16px 0'}}>
                  {row.students.map((s, idx) => <div key={idx} style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{s}</div>)}
                </td>
                <td style={{padding: '16px 0', fontFamily: 'monospace'}}>{row.phone}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={`badge ${row.ent.includes('Jamais') ? 'badge-warning' : 'badge-success'}`}>
                    {row.ent.includes('Jamais') ? 'Inactif' : 'Actif'}
                  </span>
                  <div style={{fontSize: '0.75rem', color: 'var(--text-secondary)', marginTop: '4px'}}>{row.ent}</div>
                </td>
                <td style={{padding: '16px 0', textAlign: 'right'}}>
                  <button className="btn btn-primary" style={{padding: '6px 12px', fontSize: '0.8rem'}} onClick={() => setActiveModal('message')}>Contacter</button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderScolarite = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Comptabilité & Scolarité</h1>
          <p className="page-subtitle">Suivi des paiements, encaissements et relances de frais de scolarité.</p>
        </div>
        <button className="btn btn-primary" onClick={() => setActiveModal('payment')}>
          <Icons.Plus /> Enregistrer un Paiement
        </button>
      </div>

      <div className="stats-grid">
        <div className="stat-card delay-100">
          <div className="stat-header">
            <span className="stat-label">Taux de Recouvrement</span>
            <Icons.TrendingUp />
          </div>
          <div className="stat-value">84.5%</div>
          <div className="stat-trend trend-up">
            ↑ 2.1% ce mois-ci
          </div>
        </div>
        
        <div className="stat-card delay-200">
          <div className="stat-header">
            <span className="stat-label">Reste à Recouvrer</span>
            <Icons.Database />
          </div>
          <div className="stat-value">12.5M</div>
          <div className="stat-trend trend-down">
            FCFA pour le 3ème Trimestre
          </div>
        </div>

        <div className="stat-card delay-300">
          <div className="stat-header">
            <span className="stat-label">Paiements du Jour</span>
            <Icons.CreditCard />
          </div>
          <div className="stat-value">48</div>
          <div className="stat-trend trend-up">
            Pour un total de 1.4M FCFA
          </div>
        </div>
      </div>

      <div className="panel delay-300">
        <div className="panel-header">
          <h3 className="panel-title">Dernières Transactions</h3>
          <div className="header-search" style={{width: 300}}>
            <Icons.Search />
            <input type="text" placeholder="Rechercher un reçu, un élève..." />
          </div>
        </div>
        <table style={{width: '100%', borderCollapse: 'collapse', marginTop: 10}}>
          <thead>
            <tr style={{borderBottom: '1px solid var(--border-color)', textAlign: 'left', color: 'var(--text-secondary)'}}>
              <th style={{padding: '12px 0', fontWeight: 500}}>N° Reçu</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Élève & Classe</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Motif</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Montant</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Date</th>
              <th style={{padding: '12px 0', fontWeight: 500}}>Statut</th>
            </tr>
          </thead>
          <tbody>
            {invoicesData.length > 0 ? invoicesData.map((row, i) => (
              <tr key={i} style={{borderBottom: '1px solid var(--border-color)'}}>
                <td style={{padding: '16px 0', fontFamily: 'monospace', fontWeight: 500, color: 'var(--primary-color)'}}>{row.invoice_number}</td>
                <td style={{padding: '16px 0'}}>
                  <div style={{fontWeight: 600}}>{row.students?.first_name} {row.students?.last_name}</div>
                  <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{row.students?.matricule}</div>
                </td>
                <td style={{padding: '16px 0'}}>{row.motif}</td>
                <td style={{padding: '16px 0', fontWeight: 'bold'}}>{row.amount} FCFA</td>
                <td style={{padding: '16px 0', fontSize: '0.9rem', color: 'var(--text-secondary)'}}>{new Date(row.issue_date).toLocaleDateString()}</td>
                <td style={{padding: '16px 0'}}>
                  <span className={`badge ${row.status === 'Payée' ? 'badge-success' : 'badge-warning'}`}>{row.status}</span>
                </td>
              </tr>
            )) : (
              <tr><td colSpan={6} style={{textAlign: 'center', padding: '24px 0', color: 'var(--text-secondary)'}}>Aucun paiement enregistré.</td></tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );

  const renderSettings = () => (
    <div className="animate-fade-in">
      <div className="page-header">
        <div>
          <h1 className="page-title">Paramètres</h1>
          <p className="page-subtitle">Configuration globale du système et de votre établissement.</p>
        </div>
        <button className="btn btn-primary" onClick={() => (document.getElementById('settingsForm') as HTMLFormElement)?.requestSubmit()}>Sauvegarder</button>
      </div>

      <div className="dashboard-grid" style={{gridTemplateColumns: '250px 1fr'}}>
        {/* Settings Navigation */}
        <div className="panel delay-100" style={{padding: '16px'}}>
          <ul className="nav-menu" style={{padding: 0}}>
            <li className={`nav-item ${activeSettingsTab === 'general' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('general')} style={{marginBottom: '4px'}}>
              <Icons.Settings /> Général
            </li>
            <li className={`nav-item ${activeSettingsTab === 'academic' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('academic')} style={{marginBottom: '4px'}}>
              <Icons.BookOpen /> Pédagogique
            </li>
            <li className={`nav-item ${activeSettingsTab === 'security' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('security')} style={{marginBottom: '4px'}}>
              <Icons.Shield /> Sécurité & Accès
            </li>
            <li className={`nav-item ${activeSettingsTab === 'database' ? 'active' : ''}`} onClick={() => setActiveSettingsTab('database')} style={{marginBottom: '4px'}}>
              <Icons.Database /> Base de Données
            </li>
          </ul>
        </div>

        {/* Settings Content */}
        <div className="panel delay-200">
          {activeSettingsTab === 'general' && (
            <form id="settingsForm" onSubmit={saveSettings}>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>Paramètres Généraux</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Nom de l'établissement</label>
                  <input type="text" name="school_name" defaultValue={settingsData?.school_name || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Directeur</label>
                  <input type="text" name="director_name" defaultValue={settingsData?.director_name || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Téléphone</label>
                  <input type="text" name="phone" defaultValue={settingsData?.phone || ''} className="form-input" required />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Adresse Email Principale</label>
                  <input type="email" name="email" defaultValue={settingsData?.email || ''} className="form-input" />
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Adresse</label>
                  <input type="text" name="address" defaultValue={settingsData?.address || ''} className="form-input" />
                </div>
              </div>
            </form>
          )}

          {activeSettingsTab === 'academic' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>Paramètres Pédagogiques</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Année Scolaire en cours</label>
                  <select className="form-select">
                    <option>2026 - 2027</option>
                    <option>2025 - 2026</option>
                  </select>
                </div>
                <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                  <label style={{fontSize: '0.9rem', color: 'var(--text-secondary)'}}>Système d'évaluation</label>
                  <select className="form-select">
                    <option>Notes sur 20</option>
                    <option>Compétences (Acquis/En cours/Non acquis)</option>
                    <option>Lettres (A, B, C, D)</option>
                  </select>
                </div>
                <div style={{display: 'flex', alignItems: 'center', gap: '12px', marginTop: '10px'}}>
                  <input type="checkbox" defaultChecked id="sms-abs" style={{width: '18px', height: '18px'}} />
                  <label htmlFor="sms-abs" style={{fontSize: '0.95rem', cursor: 'pointer'}}>Envoyer un SMS automatique aux parents après 2 absences non justifiées</label>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'security' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>Sécurité & Accès</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '24px'}}>
                <div>
                  <h4 style={{marginBottom: '12px'}}>Authentification à deux facteurs (2FA)</h4>
                  <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
                    <div style={{width: 44, height: 24, borderRadius: 12, background: 'var(--primary-color)', position: 'relative', cursor: 'pointer'}}>
                      <div style={{width: 20, height: 20, borderRadius: '50%', background: 'white', position: 'absolute', top: 2, right: 2}}></div>
                    </div>
                    <span style={{fontSize: '0.95rem'}}>Exiger le 2FA pour tous les administrateurs</span>
                  </div>
                </div>
                <div>
                  <h4 style={{marginBottom: '12px'}}>Gestion des Rôles</h4>
                  <div style={{display: 'flex', gap: '12px', flexWrap: 'wrap'}}>
                    <span className="badge badge-primary">Directeur</span>
                    <span className="badge badge-success">Administrateur DSI</span>
                    <span className="badge" style={{border: '1px solid var(--border-color)', background: 'transparent'}}>Enseignant</span>
                    <span className="badge" style={{border: '1px solid var(--border-color)', background: 'transparent'}}>Parent</span>
                  </div>
                  <button className="btn btn-outline" style={{marginTop: '12px', fontSize: '0.8rem'}}>Configurer les permissions</button>
                </div>
                <div>
                  <h4 style={{marginBottom: '12px'}}>Sessions Actives</h4>
                  <div style={{padding: '12px', border: '1px solid var(--border-color)', borderRadius: '8px', background: 'var(--surface-color-hover)', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                    <div>
                      <div style={{fontWeight: 500}}>Windows PC - Chrome</div>
                      <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>Dakar, SN • Actif maintenant</div>
                    </div>
                    <button className="btn btn-outline" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>Déconnecter</button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeSettingsTab === 'database' && (
            <div>
              <h3 className="panel-title" style={{marginBottom: '24px', borderBottom: '1px solid var(--border-color)', paddingBottom: '16px'}}>Connexion Base de Données (Supabase)</h3>
              <div style={{display: 'flex', flexDirection: 'column', gap: '20px'}}>
                <div style={{padding: '16px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.1)', border: '1px solid var(--accent-color)', display: 'flex', alignItems: 'center', gap: '12px'}}>
                  <Icons.CheckCircle />
                  <div>
                    <div style={{fontWeight: 600, color: 'var(--accent-color)'}}>Connecté à Supabase (Projet: xyz-sgpro)</div>
                    <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>Dernière synchronisation : il y a 2 minutes</div>
                  </div>
                </div>
                <div className="form-group">
                  <label>URL du Projet</label>
                  <input type="text" defaultValue="https://xyzabcdef.supabase.co" disabled className="form-input" style={{opacity: 0.7}} />
                </div>
                <div className="form-group">
                  <label>Clé API (Anon)</label>
                  <input type="password" defaultValue="eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9..." disabled className="form-input" style={{opacity: 0.7}} />
                </div>
                <div style={{display: 'flex', gap: '12px', marginTop: '10px'}}>
                  <button className="btn btn-primary" onClick={() => alert("Sauvegarde en cours...")}>
                    <Icons.Download /> Forcer la sauvegarde
                  </button>
                  <button className="btn btn-outline" style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}>
                    Réinitialiser la connexion
                  </button>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  if (!session) {
    return <Auth />;
  }

  return (
    <div className="app-container">
      {/* Sidebar */}
      <aside className="sidebar">
        <div className="sidebar-logo">
          <div className="logo-icon">S</div>
          <span className="logo-text">SGES Pro</span>
        </div>
        
        <ul className="nav-menu">
          <li className={`nav-item ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>
            <Icons.Home /> Tableau de bord
          </li>
          <li className={`nav-item ${activeTab === 'students' ? 'active' : ''}`} onClick={() => setActiveTab('students')}>
            <Icons.Users /> Gestion Élèves
          </li>
          <li className={`nav-item ${activeTab === 'absences' ? 'active' : ''}`} onClick={() => setActiveTab('absences')}>
            <Icons.Activity /> Gestion Absences
          </li>
          <li className={`nav-item ${activeTab === 'parents' ? 'active' : ''}`} onClick={() => setActiveTab('parents')}>
            <Icons.Heart /> Parents d'Élèves
          </li>
          <li className={`nav-item ${activeTab === 'teachers' ? 'active' : ''}`} onClick={() => setActiveTab('teachers')}>
            <Icons.GraduationCap /> Enseignants
          </li>
          <li className={`nav-item ${activeTab === 'pedagogy' ? 'active' : ''}`} onClick={() => setActiveTab('pedagogy')}>
            <Icons.BookOpen /> Pédagogie
          </li>
          <li className={`nav-item ${activeTab === 'bulletins' ? 'active' : ''}`} onClick={() => setActiveTab('bulletins')}>
            <Icons.FileText /> Bulletins
          </li>
          <li className={`nav-item ${activeTab === 'scolarite' ? 'active' : ''}`} onClick={() => setActiveTab('scolarite')}>
            <Icons.CreditCard /> Comptabilité & Scolarité
          </li>
          <li className={`nav-item ${activeTab === 'rh' ? 'active' : ''}`} onClick={() => setActiveTab('rh')}>
            <Icons.Briefcase /> RH & Admin
          </li>
          <li className={`nav-item ${activeTab === 'communication' ? 'active' : ''}`} onClick={() => setActiveTab('communication')}>
            <Icons.MessageSquare /> Communication
          </li>
          <li style={{flex: 1}}></li>
          <li className={`nav-item ${activeTab === 'settings' ? 'active' : ''}`} onClick={() => setActiveTab('settings')}>
            <Icons.Settings /> Paramètres
          </li>
        </ul>
      </aside>

      {/* Main Content */}
      <main className="main-content">
        {/* Top Header */}
        <header className="top-header">
          <div className="header-search">
            <Icons.Search />
            <input type="text" placeholder="Rechercher un élève, un parent, un reçu..." />
          </div>
          
          <div className="header-actions">
            <button className="btn btn-primary" onClick={() => setActiveModal('quickCreate')}>
              <Icons.Plus /> Nouveau
            </button>
            <button className="action-btn" onClick={() => alert("Vous n'avez pas de nouvelles notifications.")}>
              <Icons.Bell />
              <span className="action-badge"></span>
            </button>
            <div className="user-profile">
              <div className="avatar">A</div>
              <div className="user-info">
                <span className="user-name">{session.user?.email || 'Adama Traoré'}</span>
                <span className="user-role" onClick={() => supabase.auth.signOut()} style={{cursor: 'pointer', color: '#ef4444'}}>Se déconnecter</span>
              </div>
            </div>
          </div>
        </header>

        {/* Dashboard Scroll Area */}
        <div className="dashboard-scroll">
          {activeTab === 'dashboard' && renderDashboard()}
          {activeTab === 'students' && renderStudents()}
          {activeTab === 'absences' && renderAbsences()}
          {activeTab === 'pedagogy' && renderPedagogy()}
          {activeTab === 'communication' && renderCommunication()}
          {activeTab === 'bulletins' && renderBulletins()}
          {activeTab === 'rh' && renderRH()}
          {activeTab === 'teachers' && renderTeachers()}
          {activeTab === 'parents' && renderParents()}
          {activeTab === 'scolarite' && renderScolarite()}
          {activeTab === 'settings' && renderSettings()}
        </div>
      </main>

      {/* Dynamic Modal Renderer */}
      {activeModal && (
        <div className="modal-overlay" onClick={closeModal}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <h2>
                {activeModal === 'quickCreate' && "Menu de Création Rapide"}
                {activeModal === 'payment' && "Enregistrer un Paiement"}
                {activeModal === 'absence' && "Signaler une Absence"}
                {activeModal === 'student' && "Nouvelle Inscription"}
                {activeModal === 'teacher' && "Ajouter un Enseignant"}
                {activeModal === 'employee' && "Ajouter un Employé"}
                {activeModal === 'parent' && "Ajouter un Parent"}
                {activeModal === 'message' && "Nouveau Message"}
                {activeModal === 'bulletin' && "Générer Bulletins"}
                {activeModal === 'course' && "Planifier un cours"}
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
                    <div><h4>Nouvel Élève</h4><p>Inscrire un étudiant.</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('scolarite'); setActiveModal('payment'); }}>
                    <div className="creation-icon" style={{color: 'var(--accent-color)', background: 'rgba(16, 185, 129, 0.1)'}}><Icons.CreditCard /></div>
                    <div><h4>Encaisser Paiement</h4><p>Frais de scolarité.</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('communication'); setActiveModal('message'); }}>
                    <div className="creation-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}}><Icons.Mail /></div>
                    <div><h4>Nouveau Message</h4><p>Contacter les parents.</p></div>
                  </div>
                  <div className="creation-card" onClick={() => { closeModal(); setActiveTab('bulletins'); setActiveModal('bulletin'); }}>
                    <div className="creation-icon" style={{color: '#ec4899', background: 'rgba(236, 72, 153, 0.1)'}}><Icons.FileText /></div>
                    <div><h4>Nouveau Bulletin</h4><p>Générer des notes.</p></div>
                  </div>
                </div>
              )}

              {/* Payment Form */}
              {activeModal === 'payment' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Élève</label>
                    <select name="student_id" className="form-select" required>
                      <option value="">Sélectionner un élève...</option>
                      {studentsData.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Motif du paiement</label>
                    <select name="motif" className="form-select" required>
                      <option>Frais d'inscription</option>
                      <option>Mensualité (Scolarité)</option>
                      <option>Frais de cantine</option>
                      <option>Transport</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Montant (FCFA)</label>
                    <input type="number" name="amount" className="form-input" placeholder="Ex: 25000" required />
                  </div>
                  <div className="form-group">
                    <label>Mode de paiement</label>
                    <select name="payment_method" className="form-select" required>
                      <option>Espèces</option>
                      <option>Chèque</option>
                      <option>Virement / Mobile Money</option>
                    </select>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Valider le paiement</button>
                  </div>
                </form>
              )}

              {/* Message Form */}
              {activeModal === 'message' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Destinataire(s)</label>
                    <select className="form-select" required>
                      <option>Tous les parents d'une classe...</option>
                      <option>Parents - Terminale S1</option>
                      <option>Parent spécifique...</option>
                      <option>Tous les enseignants</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Sujet</label>
                    <input type="text" className="form-input" placeholder="Sujet de votre message" required />
                  </div>
                  <div className="form-group">
                    <label>Message</label>
                    <textarea className="form-textarea" placeholder="Rédigez votre message ici..." required></textarea>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary"><Icons.Send /> Envoyer</button>
                  </div>
                </form>
              )}

              {/* Absence Form */}
              {activeModal === 'absence' && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Élève concerné</label>
                    <select name="student_id" className="form-select" required>
                      <option value="">Rechercher un élève...</option>
                      {studentsData.map(s => <option key={s.id} value={s.id}>{s.first_name} {s.last_name}</option>)}
                    </select>
                  </div>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Date</label>
                      <input type="date" name="absence_date" className="form-input" required defaultValue={new Date().toISOString().split('T')[0]} />
                    </div>
                    <div className="form-group">
                      <label>Durée / Heure</label>
                      <select name="duration" className="form-select" required>
                        <option>Journée entière</option>
                        <option>Matinée</option>
                        <option>Après-midi</option>
                        <option>1 heure (Retard)</option>
                      </select>
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Motif</label>
                    <select name="motif" className="form-select" required>
                      <option>Non justifié</option>
                      <option>Maladie</option>
                      <option>Problème familial</option>
                      <option>Retard de transport</option>
                      <option>Autre</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label>Commentaire (Optionnel)</label>
                    <textarea name="comments" className="form-textarea" placeholder="Détails supplémentaires..." style={{minHeight: '80px'}}></textarea>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary" style={{background: 'var(--warning-color)', color: 'black', border: 'none'}}>Enregistrer l'absence</button>
                  </div>
                </form>
              )}

              {/* Student Form */}
              {activeModal === 'student' && (
                <form onSubmit={handleFormSubmit}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" name="last_name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label>Prénom(s)</label>
                      <input type="text" name="first_name" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Date de Naissance</label>
                    <input type="date" name="birth_date" className="form-input" required />
                  </div>
                  <div className="form-group">
                    <label>Classe (Affectation)</label>
                    <select name="class_id" className="form-select" required>
                      <option value="">Choisir une classe...</option>
                      {classesData.map(cls => (
                        <option key={cls.id} value={cls.id}>{cls.name}</option>
                      ))}
                    </select>
                  </div>
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Enregistrer l'élève</button>
                  </div>
                </form>
              )}

              {/* General Form for Employees/Teachers/Parents */}
              {['employee', 'teacher', 'parent'].includes(activeModal) && (
                <form onSubmit={handleFormSubmit}>
                  <div style={{display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '16px'}}>
                    <div className="form-group">
                      <label>Nom</label>
                      <input type="text" name="last_name" className="form-input" required />
                    </div>
                    <div className="form-group">
                      <label>Prénom(s)</label>
                      <input type="text" name="first_name" className="form-input" required />
                    </div>
                  </div>
                  <div className="form-group">
                    <label>Numéro de Téléphone</label>
                    <input type="tel" name="phone" className="form-input" placeholder="+221 77 000 00 00" required />
                  </div>
                  <div className="form-group">
                    <label>Email</label>
                    <input type="email" name="email" className="form-input" />
                  </div>
                  {activeModal === 'teacher' && (
                    <div className="form-group">
                      <label>Matière enseignée</label>
                      <input type="text" name="subject" className="form-input" required />
                    </div>
                  )}
                  {activeModal === 'employee' && (
                    <div className="form-group">
                      <label>Poste / Rôle</label>
                      <input type="text" name="role" className="form-input" required />
                    </div>
                  )}
                  {activeModal === 'parent' && (
                    <div className="form-group">
                      <label>Lier à un élève (Matricule ou Nom)</label>
                      <input type="text" className="form-input" />
                    </div>
                  )}
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">Créer le profil</button>
                  </div>
                </form>
              )}

              {/* Bulletin Form */}
              {['bulletin', 'course'].includes(activeModal) && (
                <form onSubmit={handleFormSubmit}>
                  <div className="form-group">
                    <label>Sélectionner la classe</label>
                    <select className="form-select" required>
                      <option>Terminale S1</option>
                      <option>1ère L</option>
                      <option>Seconde 4</option>
                    </select>
                  </div>
                  {activeModal === 'bulletin' && (
                    <div className="form-group">
                      <label>Trimestre/Semestre</label>
                      <select className="form-select" required>
                        <option>1er Trimestre</option>
                        <option>2ème Trimestre</option>
                        <option>3ème Trimestre</option>
                      </select>
                    </div>
                  )}
                  {activeModal === 'course' && (
                    <>
                      <div className="form-group">
                        <label>Matière</label>
                        <input type="text" className="form-input" required />
                      </div>
                      <div className="form-group">
                        <label>Date et Heure</label>
                        <input type="datetime-local" className="form-input" required />
                      </div>
                    </>
                  )}
                  <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end', gap: '12px'}}>
                    <button type="button" className="btn btn-outline" onClick={closeModal}>Annuler</button>
                    <button type="submit" className="btn btn-primary">
                      {activeModal === 'bulletin' ? 'Lancer la génération' : 'Planifier'}
                    </button>
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
