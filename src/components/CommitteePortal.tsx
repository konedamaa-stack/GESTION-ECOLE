import { useState, useEffect } from 'react';
import { BulletinPreview } from './BulletinPreview';
import { supabase } from '../lib/supabase';
import { applyThemeSettings } from '../lib/theme';

import 'jspdf-autotable';


export default function CommitteePortal({ session, onLogout }: { session: any; onLogout: () => void; onOpenBulletin?: (studentId: string, period: string, classId: string) => void }) {
  const [classes, setClasses] = useState<any[]>([]);
  const [students, setStudents] = useState<any[]>([]);
  const [evaluations, setEvaluations] = useState<any[]>([]);
  const [grades, setGrades] = useState<any[]>([]);
  const [selectedClass, setSelectedClass] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [selectedSubject, setSelectedSubject] = useState<string | null>(null);
  const [showEvalForm, setShowEvalForm] = useState(false);
  const [newEval, setNewEval] = useState({ name: '', period: '1er Trimestre', max_score: 20 });
  const [selectedEval, setSelectedEval] = useState<string | null>(null);
  const [savingGrades, setSavingGrades] = useState(false);
  const [editingGrades, setEditingGrades] = useState<Record<string, { score: number | '', comment: string }>>({});
  const [settings, setSettings] = useState<any>(null);
  const [pdfPreviewUrl, setPdfPreviewUrl] = useState<string | null>(null);
  const [previewClassId, setPreviewClassId] = useState<string | null>(null);
  const [previewPeriod, setPreviewPeriod] = useState<string>('');
  const [previewStudentId, setPreviewStudentId] = useState<string | null>(null);
  const [classSubjects, setClassSubjects] = useState<any[]>([]);

  useEffect(() => {
    fetchData();
  }, [session]);

  useEffect(() => {
    applyThemeSettings(settings);
  }, [settings]);

  const fetchData = async () => {
    const { data: cls } = await supabase.from('classes').select('*').eq('school_id', session.school_id).order('name');
    if (cls) setClasses(cls);

    const { data: st } = await supabase.from('students').select('*').eq('school_id', session.school_id).order('last_name');
    if (st) setStudents(st);

    const { data: evals } = await supabase.from('evaluations').select('*').eq('school_id', session.school_id).order('date', { ascending: false });
    if (evals) setEvaluations(evals);

    const { data: grad } = await supabase.from('grades').select('*').eq('school_id', session.school_id);
    if (grad) setGrades(grad);

    const { data: set } = await supabase.from('school_settings').select('*').eq('school_id', session.school_id).limit(1).single();
    if (set) setSettings(set);

    const { data: cs } = await supabase.from('class_subjects').select('*').eq('school_id', session.school_id);
    if (cs) setClassSubjects(cs);
  };

  
  const subjects = [
    'Mathématiques', 'Français', 'Histoire-Géographie', 
    'Anglais', 'Physique-Chimie', 'SVT', 
    'EPS', 'Philosophie', 'Espagnol', 'Allemand'
  ];

  const handleCreateEval = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClass || !selectedSubject) return;
    try {
      // Prevent duplicate evaluations for same class, subject, date, name and period
      const isDuplicate = evaluations.some(ev => 
        ev.class_id === selectedClass &&
        ev.subject === selectedSubject &&
        ev.period === newEval.period &&
        ev.name?.toLowerCase().trim() === newEval.name?.toLowerCase().trim()
      );
      if (isDuplicate) {
        alert("Une évaluation avec les mêmes caractéristiques (classe, matière, période, nom) existe déjà.");
        return;
      }

      const validSchoolId = session.school_id && session.school_id.length === 36 ? session.school_id : null;
      const { data, error } = await supabase.from('evaluations').insert([{
        ...newEval,
        class_id: selectedClass,
        subject: selectedSubject,
        school_id: validSchoolId,
        validation_status: 'approved'
      }]).select();
      
      if (error) throw error;
      
      if (data) {
        setEvaluations([data[0], ...evaluations]);
        setShowEvalForm(false);
        setSelectedEval(data[0].id);
        setNewEval({ name: '', period: '1er Trimestre', max_score: 20 });
      }
    } catch (error: any) {
      alert("Erreur lors de la création : " + error.message);
    }
  };

  const loadGradesForEval = (evalId: string) => {
    const currentGrades = grades.filter(g => g.evaluation_id === evalId);
    const gradesMap: Record<string, { score: number | '', comment: string }> = {};
    
    currentGrades.forEach(g => {
      gradesMap[g.student_id] = {
        score: g.score,
        comment: g.comment || ''
      };
    });
    
    setEditingGrades(gradesMap);
    setSelectedEval(evalId);
  };

  const handleGradeChange = (studentId: string, field: 'score' | 'comment', value: any) => {
    setEditingGrades(prev => ({
      ...prev,
      [studentId]: {
        ...prev[studentId],
        [field]: value
      }
    }));
  };

  const saveGrades = async () => {
    if (!selectedEval) return;
    setSavingGrades(true);
    try {
      const validSchoolId = session.school_id && session.school_id.length === 36 ? session.school_id : null;
      const updates = Object.keys(editingGrades).map(studentId => ({
        evaluation_id: selectedEval,
        student_id: studentId,
        score: editingGrades[studentId].score === '' ? null : Number(editingGrades[studentId].score),
        comment: editingGrades[studentId].comment,
        school_id: validSchoolId
      }));

      const { error } = await supabase.from('grades').upsert(updates, { onConflict: 'evaluation_id,student_id' });
      if (error) throw error;

      // Automatically approve evaluation when committee saves grades
      await supabase.from('evaluations').update({ validation_status: 'approved' }).eq('id', selectedEval);

      alert("Notes enregistrées avec succès");
      fetchData(); // reload
    } catch (error: any) {
      alert("Erreur lors de l'enregistrement : " + error.message);
    } finally {
      setSavingGrades(false);
    }
  };

  const getFilteredStudents = () => {
    if (!selectedClass) return students;
    return students.filter(s => s.class_id === selectedClass);
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

        <div style={{display: 'flex', gap: '16px', marginBottom: '24px'}}>
          <button className={`btn ${activeTab === 'dashboard' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('dashboard')}>Tableau de bord / Bulletins</button>
          <button className={`btn ${activeTab === 'evaluations' ? 'btn-primary' : 'btn-outline'}`} onClick={() => setActiveTab('evaluations')}>Saisie des Notes</button>
        </div>

        {activeTab === 'dashboard' && (
          <div>
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
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => { setPreviewClassId(student.class_id); setPreviewPeriod('1er Trimestre'); setPreviewStudentId(student.id); }}>T1</button>
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => { setPreviewClassId(student.class_id); setPreviewPeriod('2ème Trimestre'); setPreviewStudentId(student.id); }}>T2</button>
                        <button className="btn btn-outline" style={{padding: '4px 12px', fontSize: '0.85rem'}} onClick={() => { setPreviewClassId(student.class_id); setPreviewPeriod('3ème Trimestre'); setPreviewStudentId(student.id); }}>T3</button>
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
        </div>
        )}

        {/* EVALUATIONS TAB */}
        {activeTab === 'evaluations' && (
          <div>
            <div style={{background: 'var(--surface-color)', padding: '24px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', marginBottom: '24px'}}>
              <div style={{display: 'flex', gap: '16px', marginBottom: '16px'}}>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Classe (Filtre manuel)</label>
                  <select className="input-field" value={selectedClass || ''} onChange={(e) => setSelectedClass(e.target.value || null)} style={{width: '100%'}}>
                    <option value="">-- Choisir une classe --</option>
                    {classes.map(c => <option key={c.id} value={c.id}>{c.name}</option>)}
                  </select>
                </div>
                <div style={{flex: 1}}>
                  <label style={{display: 'block', marginBottom: '8px', fontWeight: 500}}>Matière (Filtre manuel)</label>
                  <select className="input-field" value={selectedSubject || ''} onChange={(e) => setSelectedSubject(e.target.value || null)} style={{width: '100%'}}>
                    <option value="">-- Choisir une matière --</option>
                    {subjects.map(s => <option key={s} value={s}>{s}</option>)}
                  </select>
                </div>
              </div>
              <div style={{borderTop: '1px solid var(--border-color)', paddingTop: '16px'}}>
                <label style={{display: 'block', marginBottom: '8px', fontWeight: 600}}>Ou accès rapide aux Évaluations existantes :</label>
                <select className="input-field" value={selectedEval || ''} onChange={(e) => {
                  const ev = evaluations.find(x => x.id === e.target.value);
                  if (ev) {
                    setSelectedClass(ev.class_id);
                    setSelectedSubject(ev.subject);
                    loadGradesForEval(ev.id);
                  }
                }} style={{width: '100%'}}>
                  <option value="">-- Parcourir toutes les évaluations existantes --</option>
                  {classes.map(c => {
                    const classEvals = evaluations.filter(e => e.class_id === c.id);
                    if (classEvals.length === 0) return null;
                    return (
                      <optgroup key={c.id} label={`Classe: ${c.name}`}>
                        {classEvals.map(ev => (
                          <option key={ev.id} value={ev.id}>{ev.subject} - {ev.name} ({ev.period})</option>
                        ))}
                      </optgroup>
                    );
                  })}
                </select>
              </div>
            </div>

            {selectedClass && selectedSubject ? (
              <div style={{display: 'flex', gap: '24px'}}>
                <div style={{width: '300px'}}>
                  <div style={{background: 'var(--surface-color)', padding: '20px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
                    <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '16px'}}>
                      <h3 style={{margin: 0}}>Évaluations</h3>
                      <button className="btn btn-primary" style={{padding: '4px 8px', fontSize: '0.85rem'}} onClick={() => setShowEvalForm(!showEvalForm)}>
                        {showEvalForm ? 'Fermer' : 'Nouvelle'}
                      </button>
                    </div>

                    {showEvalForm && (
                      <form onSubmit={handleCreateEval} style={{background: '#f8f9fa', padding: '16px', borderRadius: '8px', marginBottom: '16px'}}>
                        <div style={{marginBottom: '12px'}}>
                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Nom</label>
                          <input type="text" className="input-field" required value={newEval.name} onChange={e => setNewEval({...newEval, name: e.target.value})} placeholder="Ex: Devoir 1" style={{width: '100%', padding: '6px'}} />
                        </div>
                        <div style={{marginBottom: '12px'}}>
                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Période</label>
                          <select className="input-field" value={newEval.period} onChange={e => setNewEval({...newEval, period: e.target.value})} style={{width: '100%', padding: '6px'}}>
                            <option value="1er Trimestre">1er Trimestre</option>
                            <option value="2ème Trimestre">2ème Trimestre</option>
                            <option value="3ème Trimestre">3ème Trimestre</option>
                          </select>
                        </div>
                        <div style={{marginBottom: '16px'}}>
                          <label style={{display: 'block', fontSize: '0.85rem', marginBottom: '4px'}}>Sur</label>
                          <input type="number" className="input-field" required min="1" max="100" value={newEval.max_score} onChange={e => setNewEval({...newEval, max_score: parseInt(e.target.value)})} style={{width: '100%', padding: '6px'}} />
                        </div>
                        <button type="submit" className="btn btn-primary" style={{width: '100%'}}>Créer</button>
                      </form>
                    )}

                    <div style={{display: 'flex', flexDirection: 'column', gap: '8px'}}>
                      {evaluations.filter(e => e.class_id === selectedClass && e.subject === selectedSubject).map(ev => (
                        <div 
                          key={ev.id} 
                          onClick={() => loadGradesForEval(ev.id)}
                          style={{padding: '12px', borderRadius: '8px', border: selectedEval === ev.id ? '2px solid var(--primary-color)' : '1px solid var(--border-color)', background: selectedEval === ev.id ? '#eff6ff' : 'white', cursor: 'pointer'}}
                        >
                          <div style={{fontWeight: 600, fontSize: '0.95rem'}}>{ev.name}</div>
                          <div style={{fontSize: '0.8rem', color: 'var(--text-secondary)'}}>{ev.period} • Sur {ev.max_score}</div>
                        </div>
                      ))}
                      {evaluations.filter(e => e.class_id === selectedClass && e.subject === selectedSubject).length === 0 && !showEvalForm && (
                        <div style={{textAlign: 'center', padding: '24px', color: 'var(--text-secondary)', fontSize: '0.9rem'}}>Aucune évaluation</div>
                      )}
                    </div>
                  </div>
                </div>

                <div style={{flex: 1}}>
                  {selectedEval ? (
                    <div style={{background: 'var(--surface-color)', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)', overflow: 'hidden'}}>
                      <div style={{padding: '16px 24px', borderBottom: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#f8f9fa'}}>
                        <h3 style={{margin: 0}}>Saisie des notes - {evaluations.find(e => e.id === selectedEval)?.name}</h3>
                        <button className="btn btn-primary" onClick={saveGrades} disabled={savingGrades}>
                          {savingGrades ? 'Enregistrement...' : 'Enregistrer les notes'}
                        </button>
                      </div>
                      <div style={{padding: '0'}}>
                        <table style={{width: '100%', borderCollapse: 'collapse'}}>
                          <thead>
                            <tr style={{background: 'var(--background-color)'}}>
                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Élève</th>
                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)', width: '150px'}}>Note (/{evaluations.find(e => e.id === selectedEval)?.max_score})</th>
                              <th style={{padding: '12px 24px', textAlign: 'left', borderBottom: '1px solid var(--border-color)'}}>Appréciation</th>
                            </tr>
                          </thead>
                          <tbody>
                            {getFilteredStudents().map(student => (
                              <tr key={student.id} style={{borderBottom: '1px solid var(--border-color)'}}>
                                <td style={{padding: '12px 24px'}}>{student.last_name.toUpperCase()} {student.first_name}</td>
                                <td style={{padding: '12px 24px'}}>
                                  <input 
                                    type="number" 
                                    className="input-field"
                                    style={{width: '100px'}}
                                    min="0" 
                                    max={evaluations.find(e => e.id === selectedEval)?.max_score || 20}
                                    step="0.25"
                                    value={editingGrades[student.id]?.score !== undefined ? editingGrades[student.id].score : ''}
                                    onChange={(e) => handleGradeChange(student.id, 'score', e.target.value)}
                                  />
                                </td>
                                <td style={{padding: '12px 24px'}}>
                                  <input 
                                    type="text" 
                                    className="input-field"
                                    style={{width: '100%'}}
                                    placeholder="Ex: Bon travail"
                                    value={editingGrades[student.id]?.comment || ''}
                                    onChange={(e) => handleGradeChange(student.id, 'comment', e.target.value)}
                                  />
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </div>
                  ) : (
                    <div style={{background: 'var(--surface-color)', padding: '64px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)'}}>
                      <h3>Sélectionnez une évaluation</h3>
                      <p>Choisissez une évaluation dans la liste à gauche pour commencer la saisie.</p>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div style={{background: 'var(--surface-color)', padding: '64px', borderRadius: '12px', textAlign: 'center', color: 'var(--text-secondary)'}}>
                <h3>Aucune sélection</h3>
                <p>Veuillez choisir une classe et une matière pour gérer les évaluations.</p>
              </div>
            )}
          </div>
        )}
      </main>

      {/* Bulletin Preview Modal */}
      {previewClassId && (
        <div className="modal-overlay" style={{display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 9999}}>
          <div className="modal-content" style={{maxWidth: '1600px', width: '98%', height: '90vh', padding: '20px', background: 'white', display: 'flex', flexDirection: 'column', overflow: 'hidden'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', marginBottom: '16px', borderBottom: '1px solid var(--border-color)', paddingBottom: '12px'}}>
              <h3 style={{margin: 0}}>Aperçu des Bulletins</h3>
              <button className="close-btn" style={{background: 'none', border: 'none', cursor: 'pointer', fontSize: '1.25rem'}} onClick={() => setPreviewClassId(null)}>✕</button>
            </div>
            <div style={{flex: 1, overflowY: 'auto'}}>
              <BulletinPreview 
                classData={classes.find(c => c.id === previewClassId)}
                students={students.filter(s => s.class_id === previewClassId)}
                evaluations={evaluations.filter(e => e.class_id === previewClassId && e.period === previewPeriod && e.validation_status === 'approved')}
                grades={grades}
                period={previewPeriod}
                schoolInfo={settings}
                classSubjects={classSubjects.filter(cs => cs.class_id === previewClassId)}
                schedules={[]}
                targetStudentId={previewStudentId}
              />
            </div>
          </div>
        </div>
      )}

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
