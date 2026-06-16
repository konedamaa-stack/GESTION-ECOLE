import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';


const Icons = {
  Home: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M3 9l9-7 9 7v11a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2z" /><polyline strokeLinecap="round" strokeLinejoin="round" d="M9 22V12h6v10" /></svg>,
  Users: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M17 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" /><circle cx="9" cy="7" r="4" /><path strokeLinecap="round" strokeLinejoin="round" d="M23 21v-2a4 4 0 0 0-3-3.87" /><path strokeLinecap="round" strokeLinejoin="round" d="M16 3.13a4 4 0 0 1 0 7.75" /></svg>,
  BookOpen: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M2 3h6a4 4 0 0 1 4 4v14a3 3 0 0 0-3-3H2z" /><path strokeLinecap="round" strokeLinejoin="round" d="M22 3h-6a4 4 0 0 0-4 4v14a3 3 0 0 1 3-3h7z" /></svg>,
  CheckCircle: () => <svg className="stat-icon" style={{color: 'var(--warning-color)', background: 'rgba(245, 158, 11, 0.1)'}} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M22 11.08V12a10 10 0 1 1-5.93-9.14" /><polyline points="22 4 12 14.01 9 11.01" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  Plus: () => <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><line x1="12" y1="5" x2="12" y2="19" strokeLinecap="round" strokeLinejoin="round"/><line x1="5" y1="12" x2="19" y2="12" strokeLinecap="round" strokeLinejoin="round"/></svg>,
  FileText: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" /><polyline points="14 2 14 8 20 8" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="13" x2="8" y2="13" strokeLinecap="round" strokeLinejoin="round" /><line x1="16" y1="17" x2="8" y2="17" strokeLinecap="round" strokeLinejoin="round" /><polyline points="10 9 9 9 8 9" strokeLinecap="round" strokeLinejoin="round" /></svg>,
  LogOut: () => <svg className="nav-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2"><path strokeLinecap="round" strokeLinejoin="round" d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"/><polyline strokeLinecap="round" strokeLinejoin="round" points="16 17 21 12 16 7"/><line strokeLinecap="round" strokeLinejoin="round" x1="21" y1="12" x2="9" y2="12"/></svg>,
};

export default function TeacherPortal({ session, onLogout }: { session: any, onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classesData, setClassesData] = useState<any[]>([]);
  const [evaluationsData, setEvaluationsData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [gradesData, setGradesData] = useState<any[]>([]);
  const [teacherSchedules, setTeacherSchedules] = useState<any[]>([]);
  
  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [selectedStudents, setSelectedStudents] = useState<string[]>([]);
  const [gradesInput, setGradesInput] = useState<Record<string, {score: string, comment: string}>>({});

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: false }).format(Number(num));
  };

  useEffect(() => {
    fetchData();
  }, [session]);

  async function fetchData() {
    // Fetch all classes
    const { data: classes } = await supabase.from('classes').select('*').eq('school_id', session.school_id);
    if (classes) setClassesData(classes);

    // Fetch evaluations for this teacher's subject
    const { data: evaluations } = await supabase.from('evaluations')
      .select('*, classes(name)')
      
      .eq('subject', session.subject).eq('school_id', session.school_id);
    if (evaluations) setEvaluationsData(evaluations);

    // Fetch students
    const { data: students } = await supabase.from('students').select('*').eq('school_id', session.school_id);
    if (students) setStudentsData(students);

    // Fetch grades
    const { data: grades } = await supabase.from('grades').select('*').eq('school_id', session.school_id);
    if (grades) setGradesData(grades);
    // Fetch schedules for this teacher
    const { data: schedules } = await supabase.from('schedules').select('*').eq('teacher_id', session.id);
    if (schedules) setTeacherSchedules(schedules);
  };

  const handleCreateEvaluation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
        const newEval = {
      name: formData.get('name'),
      subject: session.subject,
      class_id: formData.get('class_id'),
      date: formData.get('date'),
      period: formData.get('period'),
      type: formData.get('type'),
      school_id: session.school_id,
    };

    const { error } = await supabase.from('evaluations').insert([newEval]);
    if (!error) {
      alert(t('teacher.eval_created', "Évaluation créée avec succès"));
      e.currentTarget.reset();
      fetchData();
    } else {
      alert(t('teacher.error', "Erreur: ") + error.message);
    }
  };

  const handleSelectEvaluation = (ev: any) => {
    setSelectedEvaluation(ev);
    setSelectedClass(ev.class_id);
    setSelectedStudents([]);
    
    // Load existing grades
    const evalGrades = gradesData.filter(g => g.evaluation_id === ev.id);
    const initialInputs: Record<string, {score: string, comment: string}> = {};
    evalGrades.forEach(g => {
      initialInputs[g.student_id] = { score: g.score.toString(), comment: g.comment || '' };
    });
    setGradesInput(initialInputs);
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

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: string, maxScore: number) => {
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

  const handleSaveGrades = async () => {
    if (!selectedEvaluation) return;

    const classStudents = studentsData.filter(s => s.class_id === selectedEvaluation.class_id);
    
    const gradesToUpsert = classStudents.map(student => {
      const input = gradesInput[student.id];
      
      const record: any = {
        student_id: student.id,
        evaluation_id: selectedEvaluation.id,
        score: input?.score ? parseFloat(input.score) : null,
        comment: input?.comment || null,
        school_id: session.school_id
      };
      
      return record;
    }).filter(g => g.score !== null); // Only save where a score was entered

    if (gradesToUpsert.length === 0) {
      alert(t('teacher.no_grades_to_save', "Aucune note à enregistrer"));
      return;
    }

    const { error } = await supabase.from('grades').upsert(gradesToUpsert, { onConflict: 'evaluation_id,student_id' });
    if (!error) {
      alert(t('teacher.grades_saved', "Notes enregistrées avec succès !"));
      fetchData();
    } else {
      alert(t('teacher.save_error', "Erreur lors de l'enregistrement : ") + error.message);
    }
  };

  return (
    <div className="student-portal">
      <header style={{background: 'var(--surface-color)', padding: '16px 32px', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 2px 10px rgba(0,0,0,0.05)'}}>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{width: 40, height: 40, background: 'var(--primary-color)', borderRadius: '8px', color: 'white', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', fontSize: '1.2rem'}}>
            👨‍🏫
          </div>
          <div>
            <h1 style={{margin: 0, fontSize: '1.2rem'}}>{t('teacher.portal_title', 'Portail Enseignant')}</h1>
            <p style={{margin: 0, color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Établissement</p>
          </div>
        </div>
        <div style={{display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{session.first_name} {session.last_name}</div>
            <div style={{fontSize: '0.85rem', color: 'var(--text-secondary)'}}>{t('teacher.teacher_of', "Professeur de")} {session.subject}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout} style={{color: 'var(--danger-color)', borderColor: 'var(--danger-color)'}}><Icons.LogOut /> {t('app.logout', 'Déconnexion')}</button>
        </div>
      </header>

      <main style={{padding: '32px', maxWidth: '1200px', margin: '0 auto'}}>
        <div style={{display: 'flex', gap: '16px', marginBottom: '32px', flexWrap: 'wrap'}}>
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('dashboard')}>{t('teacher.tab_dashboard', "Tableau de Bord")}</button>
          <button className={`btn ${activeTab === 'evaluations' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('evaluations')}>{t('teacher.tab_evaluations', "Mes Évaluations")}</button>
          <button className={`btn ${activeTab === 'students' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('students')}>{t('teacher.tab_students', "Mes Élèves")}</button>
        </div>
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <div style={{marginBottom: '24px', background: 'linear-gradient(135deg, var(--primary-color), var(--primary-hover))', color: 'white', padding: '30px', borderRadius: '12px', boxShadow: '0 4px 15px rgba(99, 102, 241, 0.3)'}}>
              <div style={{display: 'flex', alignItems: 'center', gap: '20px'}}>
                <div style={{width: '64px', height: '64px', borderRadius: '50%', background: 'rgba(255,255,255,0.2)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '32px'}}>
                  👨‍🏫
                </div>
                <div>
                  <h2 style={{color: 'white', margin: 0, fontSize: '1.8rem'}}>{t('teacher.welcome', "Bienvenue dans votre espace, {{name}}", {name: session.first_name})}</h2>
                  <p style={{margin: '8px 0 0 0', opacity: 0.9, fontSize: '1.05rem'}}>Gérez vos évaluations, saisissez les notes et suivez la progression de vos élèves en toute simplicité.</p>
                </div>
              </div>
            </div>

            <div className="stats-grid" style={{marginTop: '24px'}}>
              <div className="stat-card delay-100" style={{background: 'white', border: '1px solid var(--border-color)'}}>
                <div className="stat-header">
                  <span className="stat-label">{t('teacher.your_subject', "Votre Matière")}</span>
                  <Icons.BookOpen />
                </div>
                <div className="stat-value" style={{fontSize: '1.5rem', color: 'var(--primary-color)', marginTop: '8px'}}>{session.subject}</div>
                <div className="stat-trend trend-up">Spécialité</div>
              </div>
              <div className="stat-card delay-200" style={{background: 'white', border: '1px solid var(--border-color)'}}>
                <div className="stat-header">
                  <span className="stat-label">{t('teacher.created_evals', "Évaluations Créées")}</span>
                  <Icons.CheckCircle />
                </div>
                <div className="stat-value" style={{marginTop: '8px'}}>{formatNum(evaluationsData.length)}</div>
                <div className="stat-trend trend-up">Ce trimestre</div>
              </div>
            </div>

            <div className="panel delay-300" style={{marginTop: '24px', background: 'white', border: '1px solid var(--border-color)', borderRadius: '12px', padding: '24px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)'}}>
              <div className="panel-header" style={{borderBottom: '1px solid var(--border-color)', paddingBottom: '16px', marginBottom: '24px'}}>
                <h3 className="panel-title" style={{fontSize: '1.25rem', display: 'flex', alignItems: 'center', gap: '8px'}}><Icons.Plus /> {t('teacher.create_eval', "Créer une nouvelle évaluation")}</h3>
              </div>
              <form onSubmit={handleCreateEvaluation}>
                <div style={{display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '20px'}}>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.eval_title', "Titre de l'évaluation")}</label>
                    <input type="text" name="name" className="form-input" placeholder={t('teacher.eval_title_ph', "ex: Devoir Surveillé N°1")} required style={{width: '100%'}} />
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.class', "Classe")}</label>
                    <select name="class_id" className="form-input" required style={{width: '100%'}}>
                      <option value="">{t('teacher.select_class', "Sélectionner une classe")}</option>
                      {classesData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.period', "Période")}</label>
                    <select name="period" className="form-input" required style={{width: '100%'}}>
                      <option value="1er Trimestre">{t('teacher.term_1', "1er Trimestre")}</option>
                      <option value="2ème Trimestre">{t('teacher.term_2', "2ème Trimestre")}</option>
                      <option value="3ème Trimestre">{t('teacher.term_3', "3ème Trimestre")}</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('admin.modals.eval_type', "Type d'évaluation")}</label>
                    <select name="type" className="form-input" required style={{width: '100%'}}>
                      <option value="Devoir de classe">Devoir de classe</option>
                      <option value="Devoir à la maison">Devoir à la maison</option>
                      <option value="Composition">Composition</option>
                      <option value="Examen blanc">Examen blanc</option>
                    </select>
                  </div>
                  <div className="form-group">
                    <label style={{fontWeight: 600, color: 'var(--text-secondary)'}}>{t('teacher.date', "Date")}</label>
                    <input type="date" name="date" className="form-input" required style={{width: '100%'}} />
                  </div>
                </div>
                <div style={{marginTop: '24px', display: 'flex', justifyContent: 'flex-end'}}>
                  <button type="submit" className="btn btn-primary" style={{padding: '12px 24px', fontSize: '1rem'}}><Icons.CheckCircle /> {t('teacher.btn_create', "Créer l'évaluation")}</button>
                </div>
              </form>
            </div>
          </div>
        )}
        {activeTab === 'evaluations' && (
          <div className="animate-fade-in">
            {/* Top Bar for Selection */}
            <div className="panel" style={{marginBottom: '20px', display: 'flex', gap: '24px', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e0e0e0'}}>
              <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px'}}>{t('teacher.select_eval', "Sélectionner une évaluation :")}</label>
                <select 
                  className="form-input" 
                  style={{width: '100%', maxWidth: '400px'}}
                  value={selectedEvaluation?.id || ''}
                  onChange={(e) => {
                    const ev = evaluationsData.find(evalData => evalData.id === e.target.value);
                    if (ev) handleSelectEvaluation(ev);
                  }}
                >
                  <option value="" disabled>{t('teacher.choose_eval', "-- Choisir une évaluation --")}</option>
                  {evaluationsData.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.classes?.name} - {new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')})</option>
                  ))}
                </select>
              </div>
              
              {selectedEvaluation && (
                <div style={{display: 'flex', gap: '12px', alignItems: 'flex-end'}}>
                  <button className="btn btn-primary" onClick={handleSaveGrades} style={{height: '42px'}}>{t('teacher.save_grades', "Enregistrer les notes")}</button>
                </div>
              )}
            </div>

            {selectedEvaluation ? (
              <div style={{background: '#fff', border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', fontSize: '13px', fontFamily: 'Arial, sans-serif'}}>
                {/* Table Toolbar */}
                <div style={{padding: '8px 12px', background: '#f5f5f5', borderBottom: '1px solid #d4d4d4', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <div style={{display: 'flex', gap: '4px', alignItems: 'center'}}>
                    <button style={{background: '#e9ecef', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(studentsData.filter(s => s.class_id === selectedClass).length)} {t('teacher.results', "résultats")}</button>
                    <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333', marginLeft: '4px'}}>{formatNum(1)}</button>
                    <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(2)}</button>
                    <button style={{background: '#fff', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#333'}}>{formatNum(3)}</button>
                    <button style={{background: '#e9ecef', border: '1px solid #ccc', padding: '4px 8px', borderRadius: '3px', fontSize: '12px', color: '#0066cc', marginLeft: '4px'}}>{t('teacher.show_all', "Tout afficher")}</button>
                  </div>
                  <div style={{display: 'flex', alignItems: 'center', gap: '8px'}}>
                    <div style={{position: 'relative', display: 'flex', alignItems: 'center'}}>
                      <input 
                        type="text" 
                        style={{padding: '4px 28px 4px 8px', border: '1px solid #ccc', borderRadius: '15px', fontSize: '12px', width: '220px', outline: 'none'}} 
                      />
                      <svg viewBox="0 0 24 24" fill="none" stroke="#00a8ff" strokeWidth="2" style={{position: 'absolute', right: '10px', width: '14px', height: '14px'}}><circle cx="11" cy="11" r="8"/><line x1="21" y1="21" x2="16.65" y2="16.65"/></svg>
                    </div>
                    <button style={{background: '#f8f9fa', border: '1px solid #ccc', padding: '4px 12px', borderRadius: '3px', fontSize: '12px', color: '#0066cc'}}>{t('teacher.filter', "Filtre")}</button>
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
                        <th style={{padding: '8px 4px', borderRight: '1px solid #d4d4d4', textAlign: 'center', fontWeight: 'bold'}}>
                          <input 
                            type="checkbox" 
                            checked={studentsData.filter(s => s.class_id === selectedClass).length > 0 && selectedStudents.length === studentsData.filter(s => s.class_id === selectedClass).length}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setSelectedStudents(studentsData.filter(s => s.class_id === selectedClass).map(s => s.id));
                              } else {
                                setSelectedStudents([]);
                              }
                            }}
                          />
                        </th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.matricule', "Matricule")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.last_name', "Nom")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.first_name', "Prénoms")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.class', "Classe")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.score_20', "Note /20")}</th>
                        <th style={{padding: '8px', fontWeight: 'bold'}}>{t('teacher.appreciation', "Appréciation")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.filter(s => s.class_id === selectedClass).map((student, index) => (
                        <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                          <td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}>
                            <input 
                              type="checkbox" 
                              checked={selectedStudents.includes(student.id)}
                              onChange={(e) => {
                                if (e.target.checked) {
                                  setSelectedStudents(prev => [...prev, student.id]);
                                } else {
                                  setSelectedStudents(prev => prev.filter(id => id !== student.id));
                                }
                              }}
                            />
                          </td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{student.matricule || `MAT-${student.id.substring(0,4)}`}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{selectedEvaluation.classes?.name}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>
                            <input 
                              id={`grade-input-${index}`}
                              type="number" 
                              step="0.25" 
                              min="0" 
                              max="20"
                              style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none'}}
                              value={gradesInput[student.id]?.score || ''}
                              onChange={(e) => handleGradeChange(student.id, 'score', e.target.value, selectedEvaluation.max_score || 20)}
                              onKeyDown={(e) => handleKeyDown(e, index)}
                            />
                          </td>
                          <td style={{padding: '8px'}}>
                            <select 
                              style={{width: '100%', padding: '4px', fontSize: '13px', border: '1px solid #ccc', borderRadius: '3px', outline: 'none', background: '#fff'}}
                              value={gradesInput[student.id]?.comment || ''}
                              onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value, selectedEvaluation.max_score || 20)}
                            >
                              <option value="">---------</option>
                              <option value="Excellent travail">{t('teacher.c_excellent', "Excellent travail")}</option>
                              <option value="Très bien">{t('teacher.c_very_good', "Très bien")}</option>
                              <option value="Bien">{t('teacher.c_good', "Bien")}</option>
                              <option value="Assez bien">{t('teacher.c_fair', "Assez bien")}</option>
                              <option value="Passable">{t('teacher.c_passable', "Passable")}</option>
                              <option value="Insuffisant">{t('teacher.c_insufficient', "Insuffisant")}</option>
                              <option value="Peut mieux faire">{t('teacher.c_can_do_better', "Peut mieux faire")}</option>
                            </select>
                          </td>
                        </tr>
                      ))}
                      {studentsData.filter(s => s.class_id === selectedClass).length === 0 && (
                        <tr>
                          <td colSpan={7} style={{textAlign: 'center', padding: '24px', color: '#777'}}>{t('teacher.no_student_found', "Aucun élève trouvé dans cette classe.")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
                {/* Footer Toolbar */}
                <div style={{padding: '6px 12px', background: '#f5f5f5', borderTop: '1px solid #d4d4d4', display: 'flex', alignItems: 'center'}}>
                  <span style={{background: '#333', color: '#fff', padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold'}}>{t('teacher.selected_count', "{{selected}} sur {{count}} sélectionné(s)", {selected: selectedStudents.length, count: studentsData.filter(s => s.class_id === selectedClass).length})}</span>
                </div>
              </div>
            ) : (
              <div className="panel" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '64px'}}>
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1" style={{width: 64, height: 64, marginBottom: 16, opacity: 0.5}}>
                  <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z"></path>
                  <polyline points="14 2 14 8 20 8"></polyline>
                  <line x1="16" y1="13" x2="8" y2="13"></line>
                  <line x1="16" y1="17" x2="8" y2="17"></line>
                  <polyline points="10 9 9 9 8 9"></polyline>
                </svg>
                <h3>{t('teacher.no_eval_selected', "Aucune évaluation sélectionnée")}</h3>
                <p>{t('teacher.select_eval_to_start', "Veuillez choisir une évaluation dans le menu déroulant ci-dessus pour commencer la saisie des notes.")}</p>
              </div>
            )}
          </div>
        )}
        
        {activeTab === 'students' && (
          <div className="animate-fade-in">
            <div className="panel" style={{marginBottom: '20px', display: 'flex', gap: '24px', alignItems: 'center', background: '#f8f9fa', border: '1px solid #e0e0e0'}}>
              <div style={{flex: 1}}>
                <label style={{display: 'block', fontSize: '0.85rem', fontWeight: 600, color: 'var(--text-secondary)', marginBottom: '4px'}}>{t('teacher.select_class', "Sélectionner une classe :")}</label>
                <select 
                  className="form-input" 
                  style={{width: '100%', maxWidth: '400px'}}
                  value={selectedClass || ''}
                  onChange={(e) => setSelectedClass(e.target.value)}
                >
                  <option value="" disabled>{t('teacher.choose_class', "-- Choisir une classe --")}</option>
                  {classesData.filter(c => teacherSchedules.some(s => s.class_id === c.id) || evaluationsData.some(ev => ev.class_id === c.id)).map(c => (
                    <option key={c.id} value={c.id}>{c.name}</option>
                  ))}
                </select>
              </div>
            </div>

            {selectedClass ? (
              <div style={{background: '#fff', border: '1px solid #d4d4d4', borderRadius: '4px', overflow: 'hidden', fontSize: '13px', fontFamily: 'Arial, sans-serif'}}>
                <div style={{padding: '16px', borderBottom: '1px solid #eee', background: '#f8f9fa'}}>
                  <h3 style={{margin: 0, fontSize: '1.1rem'}}>{t('teacher.students_list', "Liste des élèves")} - {classesData.find(c => c.id === selectedClass)?.name}</h3>
                </div>
                <div style={{overflowX: 'auto'}}>
                  <table style={{width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed'}}>
                    <colgroup>
                      <col style={{width: '100px'}} />
                      <col style={{width: '200px'}} />
                      <col style={{width: '250px'}} />
                      <col style={{width: '150px'}} />
                    </colgroup>
                    <thead>
                      <tr style={{background: '#f9f9f9', borderBottom: '1px solid #d4d4d4', textAlign: 'left', color: '#333'}}>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.matricule', "Matricule")}</th>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.last_name', "Nom")}</th>
                        <th style={{padding: '12px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.first_name', "Prénoms")}</th>
                        <th style={{padding: '12px', fontWeight: 'bold'}}>{t('teacher.status', "Statut")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.filter(s => s.class_id === selectedClass).map((student) => (
                        <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                          <td style={{padding: '12px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{student.matricule || `MAT-${student.id.substring(0,4)}`}</td>
                          <td style={{padding: '12px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                          <td style={{padding: '12px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                          <td style={{padding: '12px'}}><span className={`badge ${student.status === 'Inscrit' ? 'badge-success' : 'badge-warning'}`}>{student.status || 'Inscrit'}</span></td>
                        </tr>
                      ))}
                      {studentsData.filter(s => s.class_id === selectedClass).length === 0 && (
                        <tr>
                          <td colSpan={4} style={{textAlign: 'center', padding: '24px', color: '#777'}}>{t('teacher.no_student_found', "Aucun élève trouvé dans cette classe.")}</td>
                        </tr>
                      )}
                    </tbody>
                  </table>
                </div>
              </div>
            ) : (
              <div className="panel" style={{textAlign: 'center', color: 'var(--text-secondary)', padding: '64px'}}>
                <Icons.Users />
                <h3 style={{marginTop: '16px'}}>{t('teacher.no_class_selected', "Aucune classe sélectionnée")}</h3>
                <p>{t('teacher.select_class_to_start', "Veuillez choisir une classe dans le menu déroulant ci-dessus pour voir la liste de vos élèves.")}</p>
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
}
