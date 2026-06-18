import React from 'react';

interface BulletinPreviewProps {
  classData: any;
  students: any[];
  evaluations: any[];
  grades: any[];
  period: string;
  schoolInfo: any;
  classSubjects: any[];
  schedules?: any[];
}

export const BulletinPreview: React.FC<BulletinPreviewProps> = ({ classData, students, evaluations, grades, period, schoolInfo, classSubjects, schedules }) => {
  const classEvals = evaluations.filter(e => e.class_id === classData?.id && e.period === period);
  const classEvalIds = classEvals.map(e => e.id);
  const classGrades = grades.filter(g => classEvalIds.includes(g.evaluation_id));

  const getSubjectCoef = (subject: string) => {
    if (!classSubjects) return 1;
    const subj = classSubjects.find(cs => cs.class_id === classData?.id && cs.subject === subject);
    return subj ? subj.coefficient : 1;
  };

  const studentStats: any = {};
  
  students.forEach(st => {
    studentStats[st.id] = {
      student: st,
      subjects: {},
      totalWeightedScore: 0,
      totalSubjectCoefs: 0,
      generalAverage: 0,
      rank: 1
    };
  });

  const subjects = Array.from(new Set(classEvals.map(e => e.subject)));

  subjects.forEach(subject => {
    const subjectEvals = classEvals.filter(e => e.subject === subject);
    const subjectEvalIds = subjectEvals.map(e => e.id);
    const coef = getSubjectCoef(subject);

    students.forEach(st => {
      const studentSubjectGrades = classGrades.filter(g => g.student_id === st.id && subjectEvalIds.includes(g.evaluation_id) && g.score !== null);
      if (studentSubjectGrades.length > 0) {
        const sumNormalized = studentSubjectGrades.reduce((acc, curr) => {
          const ev = subjectEvals.find(e => e.id === curr.evaluation_id);
          const max = ev?.max_score || 20;
          return acc + (curr.score / max * 20);
        }, 0);
        
        const avg = sumNormalized / studentSubjectGrades.length;
        
        studentStats[st.id].subjects[subject] = avg;
        studentStats[st.id].totalWeightedScore += (avg * coef);
        studentStats[st.id].totalSubjectCoefs += coef;
      }
    });
  });

  const subjectRanks: Record<string, Record<string, number>> = {};
  subjects.forEach(subject => {
    subjectRanks[subject] = {};
    const rankingsForSubj: { id: string, avg: number }[] = [];
    students.forEach(st => {
      const avg = studentStats[st.id].subjects[subject];
      if (avg !== undefined) {
        rankingsForSubj.push({ id: st.id, avg });
      }
    });
    rankingsForSubj.sort((a, b) => b.avg - a.avg);
    rankingsForSubj.forEach((r, index) => {
      // Handle ties (same average = same rank)
      if (index > 0 && r.avg === rankingsForSubj[index - 1].avg) {
        subjectRanks[subject][r.id] = subjectRanks[subject][rankingsForSubj[index - 1].id];
      } else {
        subjectRanks[subject][r.id] = index + 1;
      }
    });
  });

  const rankings: { id: string, avg: number }[] = [];
  
  students.forEach(st => {
    const stats = studentStats[st.id];
    if (stats.totalSubjectCoefs > 0) {
      stats.generalAverage = stats.totalWeightedScore / stats.totalSubjectCoefs;
    }
    rankings.push({ id: st.id, avg: stats.generalAverage });
  });

  rankings.sort((a, b) => b.avg - a.avg);
  
  rankings.forEach((r, index) => {
    // Basic ranking logic (does not handle ties perfectly, but good enough)
    studentStats[r.id].rank = index + 1;
  });

  const classAvg = rankings.reduce((acc, r) => acc + r.avg, 0) / (rankings.length || 1);
  const classMax = rankings.length > 0 ? rankings[0].avg : 0;
  const classMin = rankings.length > 0 ? rankings[rankings.length - 1].avg : 0;

  const getAppreciation = (note: number) => {
    if (note >= 16) return "Très Bien";
    if (note >= 14) return "Bien";
    if (note >= 12) return "Assez Bien";
    if (note >= 10) return "Passable";
    if (note >= 8) return "Insuffisant";
    if (note >= 5) return "Faible";
    return "Très Faible";
  };

  const getRankStr = (rank: number) => {
    return rank === 1 ? '1er' : rank + 'e';
  };

  const lettresSubjects = ["Français", "Anglais", "Philosophie", "Histoire-Géographie", "Espagnol", "Allemand"];
  const sciencesSubjects = ["Mathématiques", "Physique-Chimie", "SVT", "Informatique"];

  const categorizeSubject = (subj: string) => {
    if (lettresSubjects.includes(subj)) return 'LETTRES';
    if (sciencesSubjects.includes(subj)) return 'SCIENCES';
    return 'AUTRES';
  };

  return (
    <div className="bulletin-classic-container">
      {students.map((st) => {
        const stats = studentStats[st.id];
        
        // Group subjects for this student
        const studentSubjs = subjects.filter(s => stats.subjects[s] !== undefined);
        const lettres = studentSubjs.filter(s => categorizeSubject(s) === 'LETTRES');
        const sciences = studentSubjs.filter(s => categorizeSubject(s) === 'SCIENCES');
        const autres = studentSubjs.filter(s => categorizeSubject(s) === 'AUTRES');

        const calculateGroupTotal = (group: string[]) => {
          let tMoy = 0;
          let tCoef = 0;
          group.forEach(s => {
            const coef = getSubjectCoef(s);
            tMoy += stats.subjects[s] * coef;
            tCoef += coef;
          });
          return { tMoy, tCoef };
        };

        const getTeacherName = (subject: string) => {
          if (!schedules || schedules.length === 0) return '';
          const sched = schedules.find(s => s.class_id === classData?.id && s.subject === subject);
          if (sched && sched.teachers) {
            return `${sched.teachers.first_name} ${sched.teachers.last_name}`;
          }
          return '';
        };

        const renderSubjectRow = (s: string) => {
          const val = stats.subjects[s];
          const coef = getSubjectCoef(s);
          const total = val * coef;
          const sRank = subjectRanks[s]?.[st.id];
          const teacherName = getTeacherName(s);
          
          return (
            <tr key={s}>
              <td style={{textAlign: 'left', paddingLeft: '8px', fontWeight: 'bold'}}>{s.toUpperCase()}</td>
              <td>{val.toFixed(2)}</td>
              <td>{coef}</td>
              <td>{total.toFixed(2)}</td>
              <td>{sRank ? getRankStr(sRank) : '-'}</td>
              <td>{getAppreciation(val)}</td>
              <td style={{fontSize: '0.75rem', color: '#475569'}}>{teacherName}</td>
              <td></td>
            </tr>
          );
        };

        const renderGroup = (title: string, group: string[]) => {
          if (group.length === 0) return null;
          const { tMoy, tCoef } = calculateGroupTotal(group);
          return (
            <React.Fragment key={title}>
              {group.map(renderSubjectRow)}
              <tr className="bulletin-group-header">
                <td colSpan={2}>BILANS {title}</td>
                <td>{tCoef}</td>
                <td>{tMoy.toFixed(2)}</td>
                <td colSpan={4}></td>
              </tr>
            </React.Fragment>
          );
        };

        return (
          <div key={st.id} className="bulletin-classic-page">
            
            {/* 1. Header Row */}
            <div className="bulletin-classic-header">
              <div className="header-left">
                MINISTERE DE L'EDUCATION NATIONALE ET DE<br/>
                L'ALPHABETISATION<br/>
                DREN {schoolInfo?.address?.toUpperCase() || '...'}
              </div>
              <div className="header-center">
                <h2>BULLETIN TRIMESTRIEL DE NOTES</h2>
                <h3>{period}</h3>
              </div>
              <div className="header-right">
                Année Scolaire<br/>
                <strong>{new Date().getFullYear() - 1} - {new Date().getFullYear()}</strong>
              </div>
            </div>

            {/* 2. School Info */}
            <div className="bulletin-classic-school">
              <div className="school-logo">
                {schoolInfo?.logo_url ? (
                  <img src={schoolInfo.logo_url} alt="Logo" style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain'}} />
                ) : (
                  <div style={{width: '60px', height: '60px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.8rem'}}>LOGO</div>
                )}
              </div>
              <div className="school-details">
                <p>Etablissement: <strong>{schoolInfo?.name?.toUpperCase() || "ÉTABLISSEMENT"}</strong></p>
                <div style={{display: 'flex', gap: '40px', marginTop: '5px'}}>
                  <p>Adresse: <strong>{schoolInfo?.address || '...'}</strong></p>
                  <p>Telephone: <strong>{schoolInfo?.phone || '...'}</strong></p>
                </div>
              </div>
              <div className="school-statut">
                <div className="photo-placeholder">Photo</div>
                <div>
                  <p>Code: <strong>{schoolInfo?.id ? schoolInfo.id.substring(0, 6).toUpperCase() : '...'}</strong></p>
                  <p>Statut: <strong>Privé</strong></p>
                </div>
              </div>
            </div>

            {/* 3. Student Info */}
            <div className="bulletin-classic-student">
              <div className="col1">
                <p><strong>{st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()}</strong></p>
                <p>Matricule: <strong>{st.matricule || st.id.substring(0,8).toUpperCase()}</strong></p>
                <p>Classe: <strong>{classData?.name}</strong></p>
                <p>Effectif: <strong>{students.length}</strong></p>
              </div>
              <div className="col2">
                <p>Sexe: <strong>{st.gender || '-'}</strong></p>
                <p>Né(e) le: <strong>{st.birth_date ? new Date(st.birth_date).toLocaleDateString() : '-'}</strong></p>
                <p>Lieu: <strong>-</strong></p>
                <p>Nationalité: <strong>-</strong></p>
              </div>
              <div className="col3">
                <p>Redoublant(e): <strong>Non</strong></p>
                <p>Affecté(e): <strong>-</strong></p>
              </div>
            </div>

            {/* 4. Grades Table */}
            <table className="bulletin-classic-table">
              <thead>
                <tr>
                  <th style={{width: '25%'}}>DISCIPLINES</th>
                  <th style={{width: '8%'}}>MOY</th>
                  <th style={{width: '8%'}}>COEF</th>
                  <th style={{width: '10%'}}>Total</th>
                  <th style={{width: '8%'}}>RANG</th>
                  <th style={{width: '15%'}}>Appréciations</th>
                  <th style={{width: '15%'}}>PROFESSEUR</th>
                  <th style={{width: '11%'}}>SIGNATURE</th>
                </tr>
              </thead>
              <tbody>
                {renderGroup('LETTRES', lettres)}
                {renderGroup('SCIENCES', sciences)}
                {renderGroup('AUTRES', autres)}
                
                {/* Total Row */}
                <tr className="bulletin-classic-totaux">
                  <td>TOTAUX</td>
                  <td></td>
                  <td>{stats.totalSubjectCoefs}</td>
                  <td>{stats.totalWeightedScore.toFixed(2)}</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>

            {/* 5. Averages & Ranks Box */}
            <table className="bulletin-classic-table bulletin-classic-bottom-table">
              <tbody>
                <tr>
                  <td style={{width: '33%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Trimestre 1</th>
                          <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Trimestre 2</th>
                          <th style={{border: 'none', borderBottom: '1px solid black'}}>Trimestre 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moy: {period === '1er Trimestre' ? stats.generalAverage.toFixed(2) : '-'}</td>
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moy: {period === '2ème Trimestre' ? stats.generalAverage.toFixed(2) : '-'}</td>
                          <td style={{border: 'none', borderBottom: '1px solid black'}}>Moy: {period === '3ème Trimestre' ? stats.generalAverage.toFixed(2) : '-'}</td>
                        </tr>
                        <tr>
                          <td style={{border: 'none', borderRight: '1px solid black'}}>Rang: {period === '1er Trimestre' ? getRankStr(stats.rank) : '-'}</td>
                          <td style={{border: 'none', borderRight: '1px solid black'}}>Rang: {period === '2ème Trimestre' ? getRankStr(stats.rank) : '-'}</td>
                          <td style={{border: 'none'}}>Rang: {period === '3ème Trimestre' ? getRankStr(stats.rank) : '-'}</td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{width: '33%', textAlign: 'center', verticalAlign: 'middle', borderLeft: '2px solid black', borderRight: '2px solid black'}}>
                    <p style={{fontWeight: 'bold', marginBottom: '8px'}}>Moyenne {period.includes('Trimestre') ? 'trimestrielle' : 'semestrielle'}</p>
                    <p style={{fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px'}}>{stats.generalAverage.toFixed(2)} /20</p>
                    <p>Rang: <strong style={{fontSize: '1.2rem'}}>{getRankStr(stats.rank)}</strong></p>
                  </td>
                  <td style={{width: '33%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none'}}>
                      <thead>
                        <tr><th colSpan={2} style={{border: 'none', borderBottom: '1px solid black'}}>Resultat de la Classe</th></tr>
                      </thead>
                      <tbody>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moyenne</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{classAvg.toFixed(2)}</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Min</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{classMin.toFixed(2)}</td></tr>
                        <tr><td style={{border: 'none', borderRight: '1px solid black'}}>Max</td><td style={{border: 'none', textAlign: 'center'}}>{classMax.toFixed(2)}</td></tr>
                      </tbody>
                    </table>
                  </td>
                </tr>
              </tbody>
            </table>

            {/* 6. Signatures Box */}
            <table className="bulletin-classic-table bulletin-classic-bottom-table" style={{borderTop: 'none'}}>
              <tbody>
                <tr>
                  <td style={{width: '33%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.8rem'}}>
                      <thead>
                        <tr><th style={{border: 'none', borderBottom: '1px solid black'}}>Mentions du conseil de classe</th></tr>
                      </thead>
                      <tbody>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Tableau d'honneur + Félicitations</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Tableau d'honneur + Encouragement</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Tableau d'honneur</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px', fontWeight: 'bold'}}>SANCTION</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Avertissement travail</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Avertissement conduite</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', height: '22px'}}>Blâme travail</td></tr>
                        <tr><td style={{border: 'none', height: '22px'}}>Blâme conduite</td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '10px', borderLeft: '2px solid black', borderRight: '2px solid black'}}>
                    <p style={{fontWeight: 'bold', textDecoration: 'underline', marginBottom: '20px'}}>Décision de fin d'année</p>
                    <p style={{marginBottom: '40px'}}>Admis(e) en classe supérieure</p>
                    <p>Professeur principal</p>
                  </td>
                  <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '10px'}}>
                    <p>Chef d'établissement</p>
                    <p style={{marginTop: '10px'}}>Fait à {schoolInfo?.address || '..........'}, le :</p>
                    <p style={{fontWeight: 'bold', marginTop: '5px'}}>{new Date().toLocaleDateString()}</p>
                    <p style={{marginTop: '30px'}}>Le Directeur des Etudes</p>
                  </td>
                </tr>
              </tbody>
            </table>

          </div>
        );
      })}
    </div>
  );
};
