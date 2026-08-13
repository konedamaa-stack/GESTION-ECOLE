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
  const subjectMaxScores: Record<string, number> = {};

  subjects.forEach(subject => {
    const subjectEvals = classEvals.filter(e => e.subject === subject);
    const subjectEvalIds = subjectEvals.map(e => e.id);
    const coef = getSubjectCoef(subject);
    const subjectMaxScore = subjectEvals[0]?.max_score || 20;
    subjectMaxScores[subject] = subjectMaxScore;

    students.forEach(st => {
      const studentSubjectGrades = classGrades.filter(g => g.student_id === st.id && subjectEvalIds.includes(g.evaluation_id) && g.score !== null);
      if (studentSubjectGrades.length > 0) {
        const sumNormalized = studentSubjectGrades.reduce((acc, curr) => {
          const ev = subjectEvals.find(e => e.id === curr.evaluation_id);
          const max = ev?.max_score || 20;
          return acc + (curr.score / max * subjectMaxScore);
        }, 0);
        
        const avg = sumNormalized / studentSubjectGrades.length;
        
        studentStats[st.id].subjects[subject] = avg;
        const avg20 = (avg / subjectMaxScore) * 20;
        studentStats[st.id].totalWeightedScore += (avg20 * coef);
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

  const getAppreciation = (note: number, subjectMaxScore = 20) => {
    const isAr = i18n.language.startsWith("ar");
    const note20 = (note / subjectMaxScore) * 20;
    if (note20 >= 16) return isAr ? "جيد جداً" : "Très Bien";
    if (note20 >= 14) return isAr ? "جيد" : "Bien";
    if (note20 >= 12) return isAr ? "مستحسن" : "Assez Bien";
    if (note20 >= 10) return isAr ? "مقبول" : "Passable";
    if (note20 >= 8) return isAr ? "غير كاف" : "Insuffisant";
    if (note20 >= 5) return isAr ? "ضعيف" : "Faible";
    return isAr ? "ضعيف جداً" : "Très Faible";
  };

  const getRankStr = (rank: number) => {
    if (i18n.language.startsWith("ar")) {
      return formatNum(rank, 0); // Display numeral
    }
    return rank === 1 ? "1er" : rank + "e";
  };

  const lettresSubjects = ["Français", "COMPO_FRANCAIS", "Anglais", "ANGLAIS", "Philosophie", "PHILOSOPHIE", "Histoire-Géographie", "HG", "HISTOIRE-GEOGRAPHIE", "Espagnol", "Allemand", "LV2", "Arabe"];
  const sciencesSubjects = ["Mathématiques", "MATHS", "MATHEMATIQUES", "Physique-Chimie", "PHYSIQUE", "PHYSIQUE-CHIMIE", "SVT", "Informatique", "INFORMATIQUE"];

  const categorizeSubject = (subj: string) => {
    const upper = (subj || '').toUpperCase();
    if (lettresSubjects.some(l => upper.includes(l.toUpperCase()))) return 'LETTRES';
    if (sciencesSubjects.some(s => upper.includes(s.toUpperCase()))) return 'SCIENCES';
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
            const val = stats.subjects[s];
            const coef = getSubjectCoef(s);
            if (val !== undefined && val !== null) {
              const maxScore = subjectMaxScores[s] || 20;
              const val20 = (val / maxScore) * 20;
              tMoy += val20 * coef;
              tCoef += coef;
            }
          });
          return { tMoy, tCoef };
        };

        const getTeacherName = (subject: string) => {
          if (!schedules || schedules.length === 0) return '';
          const sched = schedules.find(s => s.class_id === classData?.id && s.subject === subject);
          if (sched && sched.teachers) {
            return `${sched.teachers.first_name || ''} ${sched.teachers.last_name || ''}`.trim();
          }
          return '';
        };

        const renderSubjectRow = (s: string) => {
          const val = stats.subjects[s];
          const coef = getSubjectCoef(s);
          const total = val * coef;
          const sRank = subjectRanks[s]?.[st.id];
          const teacherName = getTeacherName(s);
          const maxScore = subjectMaxScores[s] || 20;
          
          return (
            <tr key={s}>
              <td style={{textAlign: isAr ? 'right' : 'left', paddingLeft: isAr ? '0' : '8px', paddingRight: isAr ? '8px' : '0', fontWeight: 'bold'}}>{translateBulletinWord(s)}</td>
              <td>{formatNum(val, 1)}{maxScore !== 20 ? ' /' + maxScore : ''}</td>
              <td>{formatNum(coef, 0)}</td>
              <td>{formatNum(total, 1)}{maxScore !== 20 ? ' /' + (maxScore * coef) : ''}</td>
              <td>{sRank ? getRankStr(sRank) : '-'}</td>
              <td>{getAppreciation(val, maxScore)}</td>
              <td style={{fontSize: '0.75rem', color: '#334155'}}>{teacherName}</td>
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
              {title !== 'AUTRES' && (
                <tr className="bulletin-group-header">
                  <td colSpan={3} style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: '#dcfce7'}}>
                    {isAr ? 'حصيلة ' + translateBulletinWord(title) : 'BILANS ' + title.toUpperCase()}
                  </td>
                  <td style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: '#dcfce7'}}>
                    {formatNum(tMoy, 1)}
                  </td>
                  <td colSpan={4} style={{backgroundColor: '#dcfce7'}}></td>
                </tr>
              )}
            </React.Fragment>
          );
        };

        return (
          <div key={st.id} className="bulletin-classic-page" dir={isAr ? "rtl" : "ltr"}>
            
            {/* 1. Header Row */}
            <div className="bulletin-classic-header">
              <div className="header-left">
                {translateBulletinWord("MINISTERE DE L'EDUCATION NATIONALE ET DE")}<br/>
                <u>{translateBulletinWord("L'ALPHABETISATION")}</u><br/>
                <strong>DREN {schoolInfo?.address?.toUpperCase() || 'DIVO'}</strong>
              </div>
              <div className="header-center">
                <h2>{translateBulletinWord("BULLETIN TRIMESTRIEL DE NOTES")}</h2>
                <h3>{period || '3ème Trimestre'}</h3>
              </div>
              <div className="header-right">
                {translateBulletinWord("Année Scolaire")}<br/>
                <strong>{new Date().getFullYear() - 1} - {new Date().getFullYear()}</strong>
              </div>
            </div>

            {/* 2. School Info */}
            <div className="bulletin-classic-school">
              <div className="school-logo">
                {schoolInfo?.logo_url ? (
                  <img src={schoolInfo.logo_url} alt="Logo" style={{width: '75px', height: '75px', borderRadius: '50%', objectFit: 'contain'}} />
                ) : (
                  <div style={{width: '70px', height: '70px', borderRadius: '50%', background: '#f1f5f9', border: '2px solid #22c55e', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 'bold', color: '#15803d', fontSize: '0.75rem', textAlign: 'center', padding: '2px'}}>DAR-TAWHID</div>
                )}
              </div>
              <div className="school-details">
                <p>{translateBulletinWord("Etablissement")}: <strong>{schoolInfo?.name?.toUpperCase() || "COLLEGE PRIVE DAR-TAWHID DIVO"}</strong></p>
                <div style={{display: 'flex', gap: '30px', marginTop: '6px', fontSize: '0.8rem'}}>
                  <p>{translateBulletinWord("Adresse Postale")}: <strong>{schoolInfo?.address || 'DIVO'}</strong></p>
                  <p>{translateBulletinWord("Telephone")}: <strong>{schoolInfo?.phone || '01 03 41 17 43 / 05 44 09 47 37'}</strong></p>
                </div>
              </div>
              <div className="school-statut">
                <div>
                  <p>Code: <strong>{schoolInfo?.code || (schoolInfo?.id ? String(schoolInfo.id).substring(0, 6).toUpperCase() : '198192')}</strong></p>
                  <p>Statut: <strong>Privé</strong></p>
                </div>
              </div>
            </div>

            {/* 3. Student Info */}
            <div className="bulletin-classic-student">
              <div className="student-profile-header">
                <span className="student-fullname">{st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()}</span>
                <span>Sexe: <strong>{st.gender || 'F'}</strong></span>
                <span>Redoublant(e): <strong>{st.is_repeater ? 'Oui' : 'Non'}</strong></span>
                <span>Affecté(e): <strong>{st.is_assigned !== undefined ? (st.is_assigned ? 'Oui' : 'Non') : '-'}</strong></span>
              </div>
              <div className="student-profile-grid">
                <div>{translateBulletinWord("Matricule")}: <strong>{st.matricule || st.id.substring(0,8).toUpperCase()}</strong></div>
                <div>{translateBulletinWord("Né(e) le")}: <strong>{st.birth_date ? new Date(st.birth_date).toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR') : '-'}</strong></div>
                <div>{translateBulletinWord("Lieu de Naissance")}: <strong>{st.birth_place || '-'}</strong></div>
                <div>{translateBulletinWord("Classe")}: <strong>{classData?.name || '3ème'}</strong></div>
                <div>{translateBulletinWord("Effectif")}: <strong>{formatNum(students.length, 0)}</strong></div>
                <div>{translateBulletinWord("Nationalité")}: <strong>{st.nationality || 'Ivoirienne'}</strong></div>
              </div>
            </div>

            {/* 4. Grades Table */}
            <table className="bulletin-classic-table">
              <thead>
                <tr>
                  <th style={{width: '24%'}}>{translateBulletinWord("DISCIPLINES")}</th>
                  <th style={{width: '8%'}}>{translateBulletinWord("MOY")}</th>
                  <th style={{width: '7%'}}>{translateBulletinWord("COEF")}</th>
                  <th style={{width: '9%'}}>{translateBulletinWord("Total")}</th>
                  <th style={{width: '7%'}}>{translateBulletinWord("RANG")}</th>
                  <th style={{width: '17%'}}>{translateBulletinWord("Appréciations")}</th>
                  <th style={{width: '18%'}}>{translateBulletinWord("PROFESSEUR")}</th>
                  <th style={{width: '10%'}}>{translateBulletinWord("SIGNATURE")}</th>
                </tr>
              </thead>
              <tbody>
                {renderGroup('LETTRES', lettres)}
                {renderGroup('SCIENCES', sciences)}
                {renderGroup('AUTRES', autres)}
                
                {/* Total Row */}
                <tr className="bulletin-classic-totaux">
                  <td colSpan={2} style={{fontWeight: 'bold', textTransform: 'uppercase'}}>TOTAUX</td>
                  <td style={{fontWeight: 'bold'}}>{formatNum(stats.totalSubjectCoefs, 0)}</td>
                  <td style={{fontWeight: 'bold'}}>{formatNum(stats.totalWeightedScore, 1)}</td>
                  <td colSpan={4}></td>
                </tr>
              </tbody>
            </table>

            {/* 5. Averages & Ranks Box */}
            <table className="bulletin-classic-table bulletin-classic-bottom-table">
              <tbody>
                <tr>
                  <td style={{width: '38%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', width: '33%'}}>Trimestre 1</th>
                          <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', width: '33%'}}>Trimestre 2</th>
                          <th style={{border: 'none', borderBottom: '1px solid black', width: '34%'}}>Trimestre 3</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr>
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center'}}>Moy: <strong>{period === '1er Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong></td>
                          <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center'}}>Moy: <strong>{period === '2ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong></td>
                          <td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>Moy: <strong>{period === '3ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong></td>
                        </tr>
                        <tr>
                          <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center'}}>Rang: <strong>{period === '1er Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                          <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center'}}>Rang: <strong>{period === '2ème Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                          <td style={{border: 'none', textAlign: 'center'}}>Rang: <strong>{period === '3ème Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                        </tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{width: '32%', textAlign: 'center', verticalAlign: 'middle', borderLeft: '2px solid black', borderRight: '2px solid black', padding: '6px'}}>
                    <p style={{fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85rem'}}>Moyenne {period.includes('3ème') ? 'annuelle' : 'trimestrielle'}</p>
                    <p style={{fontSize: '1.4rem', fontWeight: 'bold', margin: '4px 0'}}>{formatNum(stats.generalAverage, 2)} /20</p>
                    <p style={{margin: 0}}>Rang: <strong style={{fontSize: '1.1rem'}}>{getRankStr(stats.rank)}</strong></p>
                  </td>
                  <td style={{width: '30%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                      <thead>
                        <tr><th colSpan={2} style={{border: 'none', borderBottom: '1px solid black'}}>Résultat de la Classe</th></tr>
                      </thead>
                      <tbody>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px 4px'}}>Moyenne</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', fontWeight: 'bold'}}>{formatNum(classAvg, 2)}</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '2px 4px'}}>Min</td><td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{formatNum(classMin, 2)}</td></tr>
                        <tr><td style={{border: 'none', borderRight: '1px solid black', padding: '2px 4px'}}>Max</td><td style={{border: 'none', textAlign: 'center'}}>{formatNum(classMax, 2)}</td></tr>
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
                  <td style={{width: '38%', verticalAlign: 'top', padding: 0}}>
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.72rem'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '2px'}}>Mentions du conseil de classe / Distinctions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur + félicitations</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur + Encouragement</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc'}}>SANCTION</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Avertissement travail</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Avertissement conduite</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Blâme travail</td></tr>
                        <tr><td style={{border: 'none', padding: '2px 6px'}}>Blâme conduite</td></tr>
                      </tbody>
                    </table>
                  </td>
                  <td style={{width: '32%', textAlign: 'center', verticalAlign: 'top', padding: '6px', borderLeft: '2px solid black', borderRight: '2px solid black'}}>
                    <p style={{fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '0.85rem'}}>Décision de fin d'année</p>
                    <p style={{marginBottom: '6px', fontSize: '0.8rem'}}>Admis(e) en classe supérieure</p>
                    <p style={{fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginBottom: '24px'}}>Voir CNO</p>
                    <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: 0}}>Professeur principal</p>
                  </td>
                  <td style={{width: '30%', textAlign: 'center', verticalAlign: 'top', padding: '6px'}}>
                    <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                      <div>
                        <p style={{fontWeight: 'bold', fontSize: '0.82rem', margin: '0 0 2px 0'}}>Chef d'établissement</p>
                      </div>
                      
                      <div style={{margin: '10px 0'}}>
                        <p style={{fontSize: '0.75rem', margin: 0}}>Fait à {schoolInfo?.city || schoolInfo?.address || 'DIVO'}, le :</p>
                        <p style={{fontWeight: 'bold', fontSize: '0.8rem', marginTop: '2px'}}>{new Date().toLocaleDateString(i18n.language.startsWith('ar') ? 'ar-EG' : 'fr-FR')}</p>
                      </div>

                      <div>
                        <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: '0 0 2px 0'}}>Le Directeur des Etudes</p>
                        <p style={{fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '15px'}}>{schoolInfo?.principal_name || 'SANOGO GAOUSSHOU'}</p>
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

