import React, { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { useTranslation } from 'react-i18next';

export default function TeacherPortal({ session, onLogout }: { session: any, onLogout: () => void }) {
  const { t, i18n } = useTranslation();
  const [activeTab, setActiveTab] = useState('dashboard');
  const [classesData, setClassesData] = useState<any[]>([]);
  const [evaluationsData, setEvaluationsData] = useState<any[]>([]);
  const [studentsData, setStudentsData] = useState<any[]>([]);
  const [gradesData, setGradesData] = useState<any[]>([]);
  
  // Selection state
  const [selectedClass, setSelectedClass] = useState<string>('');
  const [selectedEvaluation, setSelectedEvaluation] = useState<any>(null);
  const [gradesInput, setGradesInput] = useState<Record<string, {score: string, comment: string}>>({});

  const formatNum = (num: number | string | undefined) => {
    if (num === undefined || num === null) return '';
    return new Intl.NumberFormat(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR', { useGrouping: false }).format(Number(num));
  };

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    const schoolId = session.school_id;
    // Fetch all classes
    const { data: classes } = await supabase.from('classes').select('*').eq('school_id', schoolId);
    if (classes) setClassesData(classes);

    // Fetch evaluations for this teacher's subject
    const { data: evaluations } = await supabase.from('evaluations')
      .select('*, classes(name)')
      .eq('school_id', schoolId)
      .eq('subject', session.subject);
    if (evaluations) setEvaluationsData(evaluations);

    // Fetch students
    const { data: students } = await supabase.from('students').select('*').eq('school_id', schoolId);
    if (students) setStudentsData(students);

    // Fetch grades
    const { data: grades } = await supabase.from('grades').select('*').eq('school_id', schoolId);
    if (grades) setGradesData(grades);
  };

  const handleCreateEvaluation = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const formData = new FormData(e.currentTarget);
    const newEval = {
      school_id: session.school_id,
      name: formData.get('name'),
      subject: session.subject,
      class_id: formData.get('class_id'),
      date: formData.get('date'),
      period: formData.get('period'),
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
    
    // Load existing grades
    const evalGrades = gradesData.filter(g => g.evaluation_id === ev.id);
    const initialInputs: Record<string, {score: string, comment: string}> = {};
    evalGrades.forEach(g => {
      initialInputs[g.student_id] = { score: g.score.toString(), comment: g.comments || '' };
    });
    setGradesInput(initialInputs);
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: string) => {
    setGradesInput(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId] || { score: '', comment: '' },
        [field]: value
      }
    }));
  };

  const handleSaveGrades = async () => {
    if (!selectedEvaluation) return;

    const classStudents = studentsData.filter(s => s.class_id === selectedEvaluation.class_id);
    
    const gradesToUpsert = classStudents.map(student => {
      const input = gradesInput[student.id];
      // Try to find existing grade to get its ID for update
      const existing = gradesData.find(g => g.evaluation_id === selectedEvaluation.id && g.student_id === student.id);
      
      return {
        id: existing?.id, // Supabase upsert needs ID if it exists
        school_id: session.school_id,
        student_id: student.id,
        evaluation_id: selectedEvaluation.id,
        score: input?.score ? parseFloat(input.score) : null,
        comments: input?.comment || null
      };
    }).filter(g => g.score !== null); // Only save where a score was entered

    if (gradesToUpsert.length === 0) {
      alert(t('teacher.no_grades_to_save', "Aucune note à enregistrer"));
      return;
    }

    const { error } = await supabase.from('grades').upsert(gradesToUpsert);
    if (!error) {
      alert(t('teacher.grades_saved', "Notes enregistrées avec succès !"));
      fetchData();
    } else {
      alert(t('teacher.save_error', "Erreur lors de l'enregistrement : ") + error.message);
    }
  };

  return (
    <div className="student-portal">
      <nav className="portal-nav">
        <div className="portal-logo">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" style={{width: 24, height: 24, color: 'var(--primary-color)'}}>
            <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
          </svg>
          SGES Pro
        </div>
        <div className="portal-nav-links">
          <button className={`portal-nav-link ${activeTab === 'dashboard' ? 'active' : ''}`} onClick={() => setActiveTab('dashboard')}>{t('teacher.tab_dashboard', "Tableau de Bord")}</button>
          <button className={`portal-nav-link ${activeTab === 'evaluations' ? 'active' : ''}`} onClick={() => setActiveTab('evaluations')}>{t('teacher.tab_evaluations', "Mes Évaluations")}</button>
        </div>
        <div style={{marginLeft: 'auto', display: 'flex', alignItems: 'center', gap: '16px'}}>
          <div style={{textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{session.first_name} {session.last_name}</div>
            <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{t('teacher.teacher_of', "Professeur de")} {session.subject}</div>
          </div>
          <button className="btn btn-outline" onClick={onLogout}>{t('app.logout', "Déconnexion")}</button>
        </div>
      </nav>

      <div className="portal-content">
        {activeTab === 'dashboard' && (
          <div className="animate-fade-in">
            <h2>{t('teacher.welcome', "Bienvenue dans votre espace, {{name}}", {name: session.first_name})}</h2>
            <div className="stats-grid" style={{marginTop: '24px'}}>
              <div className="stat-card">
                <div className="stat-label">{t('teacher.your_subject', "Votre Matière")}</div>
                <div className="stat-value" style={{fontSize: '1.5rem'}}>{session.subject}</div>
              </div>
              <div className="stat-card">
                <div className="stat-label">{t('teacher.created_evals', "Évaluations Créées")}</div>
                <div className="stat-value">{formatNum(evaluationsData.length)}</div>
              </div>
            </div>

            <div className="panel" style={{marginTop: '24px'}}>
              <h3 className="panel-title">{t('teacher.create_eval', "Créer une nouvelle évaluation")}</h3>
              <form onSubmit={handleCreateEvaluation} style={{display: 'flex', gap: '16px', flexWrap: 'wrap', alignItems: 'flex-end', marginTop: '16px'}}>
                <div className="form-group">
                  <label>{t('teacher.eval_title', "Titre de l'évaluation")}</label>
                  <input type="text" name="name" className="input-field" placeholder={t('teacher.eval_title_ph', "ex: Devoir Surveillé N°1")} required />
                </div>
                <div className="form-group">
                  <label>{t('teacher.class', "Classe")}</label>
                  <select name="class_id" className="input-field" required>
                    <option value="">{t('teacher.select_class', "Sélectionner une classe")}</option>
                    {classesData.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('teacher.period', "Période")}</label>
                  <select name="period" className="input-field" required>
                    <option value="1er Trimestre">{t('teacher.term_1', "1er Trimestre")}</option>
                    <option value="2ème Trimestre">{t('teacher.term_2', "2ème Trimestre")}</option>
                    <option value="3ème Trimestre">{t('teacher.term_3', "3ème Trimestre")}</option>
                  </select>
                </div>
                <div className="form-group">
                  <label>{t('teacher.date', "Date")}</label>
                  <input type="date" name="date" className="input-field" required />
                </div>
                <div className="form-group">
                  <button type="submit" className="btn btn-primary">{t('teacher.btn_create', "Créer")}</button>
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
                  className="input-field" 
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
                        <th style={{padding: '8px 4px', borderRight: '1px solid #d4d4d4', textAlign: 'center', fontWeight: 'bold'}}><input type="checkbox" /></th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.matricule', "Matricule")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.last_name', "Nom")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.first_name', "Prénoms")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.class', "Classe")}</th>
                        <th style={{padding: '8px', borderRight: '1px solid #d4d4d4', fontWeight: 'bold'}}>{t('teacher.score_20', "Note /20")}</th>
                        <th style={{padding: '8px', fontWeight: 'bold'}}>{t('teacher.appreciation', "Appréciation")}</th>
                      </tr>
                    </thead>
                    <tbody>
                      {studentsData.filter(s => s.class_id === selectedClass).map((student) => (
                        <tr key={student.id} style={{borderBottom: '1px solid #eee', background: '#fff', color: '#333'}}>
                          <td style={{padding: '8px 4px', borderRight: '1px solid #eee', textAlign: 'center'}}><input type="checkbox" /></td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee', fontWeight: 'bold'}}>{student.matricule || `MAT-${student.id.substring(0,4)}`}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.last_name.toUpperCase()}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{student.first_name}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>{selectedEvaluation.classes?.name}</td>
                          <td style={{padding: '8px', borderRight: '1px solid #eee'}}>
                            <input 
                              type="number" 
                              step="0.25" 
                              min="0" 
                              max="20"
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
                  <span style={{background: '#333', color: '#fff', padding: '4px 12px', borderRadius: '3px', fontSize: '12px', fontWeight: 'bold'}}>{t('teacher.selected_count', "0 sur {{count}} sélectionné", {count: studentsData.filter(s => s.class_id === selectedClass).length})}</span>
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
      </div>
    </div>
  );
}
