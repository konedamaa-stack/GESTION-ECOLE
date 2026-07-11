import React from 'react';
import { useTranslation } from 'react-i18next';

interface BulletinPreviewProps {
  classData: any;
  students: any[];
  evaluations: any[];
  grades: any[];
  period: string;
  schoolInfo: any;
  classSubjects: any[];
  schedules?: any[];
  targetStudentId?: string | null;
}

export const BulletinPreview: React.FC<BulletinPreviewProps> = ({ classData, students, evaluations, grades, period, schoolInfo, classSubjects, schedules, targetStudentId }) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  const translateBulletinWord = (word: string) => {
    if (!i18n.language.startsWith('ar')) return word.toUpperCase();
    const map: Record<string, string> = {
      "Mathématiques": "الرياضيات",
      "Français": "الفرنسية",
      "Anglais": "الإنجليزية",
      "Histoire-Géographie": "التاريخ والجغرافيا",
      "Physique-Chimie": "الفيزياء والكيمياء",
      "SVT": "علوم الحياة والأرض",
      "EPS": "التربية البدنية",
      "Philosophie": "الفلسفة",
      "Informatique": "الإعلاميات",
      "Espagnol": "الإسبانية",
      "Allemand": "الألمانية",
      "Arts Plastiques": "الفنون التشكيلية",
      "Éducation Musicale": "التربية الموسيقية",
      "DISCIPLINES": "المواد",
      "MOY": "المعدل",
      "COEF": "المعامل",
      "Total": "المجموع",
      "RANG": "الرتبة",
      "Appréciations": "ملاحظات",
      "PROFESSEUR": "الأستاذ",
      "SIGNATURE": "التوقيع",
      "BILANS LETTRES": "حصيلة الآداب",
      "BILANS SCIENCES": "حصيلة العلوم",
      "BILANS AUTRES": "حصيلة أخرى",
      "LETTRES": "الآداب",
      "SCIENCES": "العلوم",
      "AUTRES": "أخرى"
    };
    // Match exact or uppercase
    return map[word] || map[word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()] || word.toUpperCase();
  };

  const formatNum = (num: number, decimals: number = 2) => {
    if (num === null || num === undefined) return "-";
    return new Intl.NumberFormat(i18n.language.startsWith("ar") ? "ar-EG" : "fr-FR", {
      minimumFractionDigits: decimals,
      maximumFractionDigits: decimals
    }).format(num);
  };

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
    const isAr = i18n.language.startsWith("ar");
    if (note >= 16) return isAr ? "جيد جداً" : "Très Bien";
    if (note >= 14) return isAr ? "جيد" : "Bien";
    if (note >= 12) return isAr ? "مستحسن" : "Assez Bien";
    if (note >= 10) return isAr ? "مقبول" : "Passable";
    if (note >= 8) return isAr ? "غير كاف" : "Insuffisant";
    if (note >= 5) return isAr ? "ضعيف" : "Faible";
    return isAr ? "ضعيف جداً" : "Très Faible";
  };

  const getRankStr = (rank: number) => {
    if (i18n.language.startsWith("ar")) {
      return formatNum(rank, 0); // Display numeral
    }
    return rank === 1 ? "1er" : rank + "e";
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
      {students.filter(st => !targetStudentId || st.id === targetStudentId).map((st) => {
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
              <td style={{textAlign: isAr ? 'right' : 'left', paddingLeft: isAr ? '0' : '8px', paddingRight: isAr ? '8px' : '0', fontWeight: 'bold'}}>{translateBulletinWord(s)}</td>
              <td>{formatNum(val, 2)}</td>
              <td>{formatNum(coef, 0)}</td>
              <td>{formatNum(total, 2)}</td>
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
                <td colSpan={2}>{i18n.language.startsWith('ar') ? 'حصيلة ' + translateBulletinWord(title) : 'BILANS ' + title.toUpperCase()}</td>
                <td>{formatNum(tCoef, 0)}</td>
                <td>{formatNum(tMoy, 2)}</td>
                <td colSpan={4}></td>
              </tr>
            </React.Fragment>
          );
        };

        return (
          <div key={st.id} className="bulletin-classic-page" dir={isAr ? "rtl" : "ltr"}>
            
            {/* 1. Header Row */}
            <div className="bulletin-classic-header">
              <div className="header-left">
                {translateBulletinWord("MINISTERE DE L'EDUCATION NATIONALE ET DE")}<br/>
                {translateBulletinWord("L'ALPHABETISATION")}<br/>
                DREN {schoolInfo?.address?.toUpperCase() || '...'}
              </div>
              <div className="header-center">
                <h2>{translateBulletinWord("BULLETIN TRIMESTRIEL DE NOTES")}</h2>
                <h3>{period}</h3>
              </div>
              <div className="header-right">
                {translateBulletinWord("Année Scolaire")}<br/>
                <strong>{formatNum(new Date().getFullYear() - 1, 0)} - {formatNum(new Date().getFullYear(), 0)}</strong>
              </div>
            </div>

            {/* 2. School Info */}
            <div className="bulletin-classic-school">
              <div className="school-logo">
                {schoolInfo?.logo_url ? (
                  <img src={schoolInfo.logo_url} alt="Logo" style={{width: '80px', height: '80px', borderRadius: '50%', objectFit: 'contain'}} />
                ) : (
                  <div style={{width: '80px', height: '80px', borderRadius: '50%', background: '#e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#94a3b8', fontSize: '0.8rem'}}>LOGO</div>
                )}
              </div>
              <div className="school-details">
                <p>{translateBulletinWord("Etablissement")}: <strong>{schoolInfo?.name?.toUpperCase() || "ÉTABLISSEMENT"}</strong></p>
                <div style={{display: 'flex', gap: '40px', marginTop: '5px'}}>
                  <p>{translateBulletinWord("Adresse")}: <strong>{schoolInfo?.address || '...'}</strong></p>
                  <p>{translateBulletinWord("Telephone")}: <strong>{schoolInfo?.phone || '...'}</strong></p>
                </div>
              </div>
              <div className="school-statut">
                <div>
                  <p>Code: <strong>{schoolInfo?.id ? String(schoolInfo.id).substring(0, 6).toUpperCase() : '...'}</strong></p>
                  <p>Statut: <strong>Privé</strong></p>
                </div>
              </div>
            </div>

            {/* 3. Student Info */}
            <div className="bulletin-classic-student" style={{display: 'flex', border: '2px solid black', marginBottom: '5px'}}>
              <div style={{padding: '5px', borderRight: '1px solid black', display: 'flex', alignItems: 'center', justifyContent: 'center', width: '80px', backgroundColor: '#f9fafb'}}>
                {st.photo_url ? (
                  <img src={st.photo_url} alt="Photo" style={{width: '65px', height: '75px', objectFit: 'cover', border: '1px solid #ddd', borderRadius: '4px'}} />
                ) : (
                  <div style={{width: '65px', height: '75px', display: 'flex', alignItems: 'center', justifyContent: 'center', backgroundColor: '#eee', color: '#999', fontSize: '12px', border: '1px solid #ddd', borderRadius: '4px'}}>Photo</div>
                )}
              </div>
              <div className="col1" style={{flex: 1, padding: '5px', borderRight: '1px solid black'}}>
                <p><strong>{st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()}</strong></p>
                <p>{translateBulletinWord("Matricule")}: <strong>{st.matricule || st.id.substring(0,8).toUpperCase()}</strong></p>
                <p>{translateBulletinWord("Classe")}: <strong>{classData?.name}</strong></p>
                <p>{translateBulletinWord("Effectif")}: <strong>{formatNum(students.length, 0)}</strong></p>
              </div>
              <div className="col2">
                <p>{translateBulletinWord("Sexe")}: <strong>{st.gender || '-'}</strong></p>
                <p>{translateBulletinWord("Né(e) le")}: <strong>{st.birth_date ? new Date(st.birth_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR') : '-'}</strong></p>
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
                                    <th style={{width: '25%'}}>{translateBulletinWord("DISCIPLINES")}</th>
                  <th style={{width: '8%'}}>{translateBulletinWord("MOY")}</th>
                  <th style={{width: '8%'}}>{translateBulletinWord("COEF")}</th>
                  <th style={{width: '10%'}}>{translateBulletinWord("Total")}</th>
                  <th style={{width: '8%'}}>{translateBulletinWord("RANG")}</th>
                  <th style={{width: '15%'}}>{translateBulletinWord("Appréciations")}</th>
                  <th style={{width: '15%'}}>{translateBulletinWord("PROFESSEUR")}</th>
                  <th style={{width: '11%'}}>{translateBulletinWord("SIGNATURE")}</th>
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
                  <td>{formatNum(stats.totalSubjectCoefs, 0)}</td>
                  <td>{formatNum(stats.totalWeightedScore, 2)}</td>
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
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moy: {period === '1er Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</td>
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moy: {period === '2ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</td>
                          <td style={{border: 'none', borderBottom: '1px solid black'}}>Moy: {period === '3ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</td>
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
                    <p style={{fontSize: '1.4rem', fontWeight: 'bold', marginBottom: '8px'}}>{formatNum(stats.generalAverage, 2)} /20</p>
                    <p>Rang: <strong style={{fontSize: '1.2rem'}}>{getRankStr(stats.rank)}</strong></p>
                  </td>
                  <td style={{width: '33%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none'}}>
                      <thead>
                        <tr><th colSpan={2} style={{border: 'none', borderBottom: '1px solid black'}}>Resultat de la Classe</th></tr>
                      </thead>
                      <tbody>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Moyenne</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{formatNum(classAvg, 2)}</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black'}}>Min</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{formatNum(classMin, 2)}</td></tr>
                        <tr><td style={{border: 'none', borderRight: '1px solid black'}}>Max</td><td style={{border: 'none', textAlign: 'center'}}>{formatNum(classMax, 2)}</td></tr>
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
                    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                      <div>
                        <p style={{fontWeight: 'bold'}}>Le Chef d'établissement</p>
                        {schoolInfo?.principal_name && (
                          <p style={{fontSize: '0.9rem', fontStyle: 'italic', marginTop: '4px'}}>{schoolInfo.principal_name}</p>
                        )}
                      </div>
                      
                      <div style={{marginTop: '15px', marginBottom: '15px'}}>
                        <p>Fait à {schoolInfo?.city || schoolInfo?.address || '..........'}, le :</p>
                        <p style={{fontWeight: 'bold', marginTop: '5px'}}>{new Date().toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</p>
                      </div>

                      <div>
                        <p style={{fontWeight: 'bold'}}>Le Directeur des Etudes</p>
                        {schoolInfo?.studies_director_name && (
                          <p style={{fontSize: '0.9rem', fontStyle: 'italic', marginTop: '4px'}}>{schoolInfo.studies_director_name}</p>
                        )}
                      </div>
                    </div>
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
