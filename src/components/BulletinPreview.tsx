import React from 'react';

interface BulletinPreviewProps {
  classData: any;
  students: any[];
  evaluations: any[];
  grades: any[];
  period: string;
  schoolInfo: any;
  classSubjects: any[];
}

export const BulletinPreview: React.FC<BulletinPreviewProps> = ({ classData, students, evaluations, grades, period, schoolInfo, classSubjects }) => {
  // Filter evaluations for the current class and period
  const classEvals = evaluations.filter(e => e.class_id === classData?.id && e.period === period);
  const classEvalIds = classEvals.map(e => e.id);
  
  // Filter grades that belong to those evaluations
  const classGrades = grades.filter(g => classEvalIds.includes(g.evaluation_id));

  // Helper to get coefficient for a subject
  const getSubjectCoef = (subject: string) => {
    if (!classSubjects) return 1;
    const subj = classSubjects.find(cs => cs.class_id === classData?.id && cs.subject === subject);
    return subj ? subj.coefficient : 1;
  };

  // 1. Calculate subject averages for each student
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

  // Group by Subject
  const subjects = Array.from(new Set(classEvals.map(e => e.subject)));

  subjects.forEach(subject => {
    const subjectEvals = classEvals.filter(e => e.subject === subject);
    const subjectEvalIds = subjectEvals.map(e => e.id);
    const coef = getSubjectCoef(subject);

    students.forEach(st => {
      const studentSubjectGrades = classGrades.filter(g => g.student_id === st.id && subjectEvalIds.includes(g.evaluation_id) && g.score !== null);
      if (studentSubjectGrades.length > 0) {
        // Average for this subject
        // normalize to 20
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

  // 2. Calculate general average and rank
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
    studentStats[r.id].rank = index + 1;
  });

  // Find class max, min, avg
  const classAvg = rankings.reduce((acc, r) => acc + r.avg, 0) / (rankings.length || 1);
  const classMax = rankings.length > 0 ? rankings[0].avg : 0;
  const classMin = rankings.length > 0 ? rankings[rankings.length - 1].avg : 0;

  const getAppreciation = (note: number) => {
    if (note >= 16) return "Très Bien";
    if (note >= 14) return "Bien";
    if (note >= 12) return "Assez Bien";
    if (note >= 10) return "Passable";
    if (note >= 8) return "Insuffisant";
    return "Faible";
  };

  return (
    <div className="bulletins-container">
      {students.map((st) => {
        const stats = studentStats[st.id];
        return (
          <div key={st.id} className="bulletin-page">
            <div className="bulletin-header">
              <div className="school-info">
                <h2>{schoolInfo?.name || "Établissement Scolaire"}</h2>
                <p>{schoolInfo?.address || "Adresse de l'établissement"}</p>
                <p>Année Scolaire: {new Date().getFullYear() - 1} - {new Date().getFullYear()}</p>
              </div>
              <div className="bulletin-title-box">
                <h1>BULLETIN DE NOTES</h1>
                <h3>{period}</h3>
              </div>
            </div>

            <div className="student-info-box">
              <div className="info-row">
                <div><strong>Nom:</strong> {st.last_name}</div>
                <div><strong>Classe:</strong> {classData?.name}</div>
              </div>
              <div className="info-row">
                <div><strong>Prénom(s):</strong> {st.first_name}</div>
                <div><strong>Effectif:</strong> {students.length}</div>
              </div>
              <div className="info-row">
                <div><strong>Matricule:</strong> {st.id.substring(0, 8).toUpperCase()}</div>
              </div>
            </div>

            <table className="bulletin-table">
              <thead>
                <tr>
                  <th>Matières</th>
                  <th>Coef.</th>
                  <th>Moyenne / 20</th>
                  <th>Moy. Pondérée</th>
                  <th>Appréciation</th>
                </tr>
              </thead>
              <tbody>
                {subjects.length === 0 && (
                  <tr>
                    <td colSpan={5} style={{textAlign: 'center', padding: '20px'}}>Aucune note pour ce trimestre.</td>
                  </tr>
                )}
                {subjects.map(subject => {
                  const val = stats.subjects[subject];
                  const coef = getSubjectCoef(subject);
                  return (
                    <tr key={subject}>
                      <td>{subject}</td>
                      <td style={{textAlign: 'center'}}>{coef}</td>
                      <td style={{textAlign: 'center', fontWeight: 'bold'}}>{val !== undefined ? val.toFixed(2) : '-'}</td>
                      <td style={{textAlign: 'center'}}>{val !== undefined ? (val * coef).toFixed(2) : '-'}</td>
                      <td>{val !== undefined ? getAppreciation(val) : '-'}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>

            <div className="bulletin-summary">
              <div className="summary-left">
                <p>Moyenne la plus faible: <strong>{classMin.toFixed(2)}</strong></p>
                <p>Moyenne de la classe: <strong>{classAvg.toFixed(2)}</strong></p>
                <p>Moyenne la plus forte: <strong>{classMax.toFixed(2)}</strong></p>
              </div>
              <div className="summary-right">
                <p>Total Coefficients: <strong>{stats.totalSubjectCoefs}</strong></p>
                <p>Moyenne Générale: <span className="general-avg">{stats.generalAverage.toFixed(2)}</span> / 20</p>
                <p>Rang: <strong>{stats.rank} {stats.rank === 1 ? 'er' : 'ème'}</strong></p>
                <p>Appréciation Générale: <strong>{getAppreciation(stats.generalAverage)}</strong></p>
              </div>
            </div>

            <div className="bulletin-signatures">
              <div className="signature-box">
                <p>Signature du Titulaire</p>
              </div>
              <div className="signature-box">
                <p>Signature du Directeur</p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
};
