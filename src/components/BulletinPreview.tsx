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

export const BulletinPreview: React.FC<BulletinPreviewProps> = ({ 
  classData, 
  students, 
  evaluations, 
  grades, 
  period, 
  schoolInfo, 
  classSubjects, 
  schedules, 
  targetStudentId 
}) => {
  const { i18n } = useTranslation();
  const isAr = i18n.language.startsWith('ar');

  // School configuration & preferences
  const template = schoolInfo?.bulletin_template || 'classic'; // 'classic' | 'modern' | 'compact' | 'primary'
  const brandColor = schoolInfo?.bulletin_color || schoolInfo?.primary_color || '#1e3a8a';
  const showPhoto = schoolInfo?.show_student_photo !== false;
  const showRank = schoolInfo?.show_rank !== false;
  const showClassStats = schoolInfo?.show_class_stats !== false;
  const showTeacherNames = schoolInfo?.show_teacher_names !== false;
  const showHonorRoll = schoolInfo?.show_honor_roll !== false;
  const showSignatures = schoolInfo?.show_signatures !== false;
  const customTitle = schoolInfo?.bulletin_title || "BULLETIN TRIMESTRIEL DE NOTES";
  const ministryText = schoolInfo?.ministry_header || "MINISTERE DE L'EDUCATION NATIONALE ET DE L'ALPHABETISATION";
  const drenText = schoolInfo?.dren_name || schoolInfo?.address || 'DIVO';
  const schoolStatut = schoolInfo?.school_statut || 'Privé';
  const stampUrl = schoolInfo?.stamp_url || null;

  const translateBulletinWord = (word: string) => {
    if (!i18n.language.startsWith('ar')) return word;
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
      "Disciplines": "المواد",
      "Matière": "المادة",
      "MOY": "المعدل",
      "Moyenne": "المعدل",
      "COEF": "المعامل",
      "Coef": "المعامل",
      "Total": "المجموع",
      "RANG": "الرتبة",
      "Rang": "الرتبة",
      "Appréciations": "ملاحظات الأستاذ",
      "Appréciation": "ملاحظات",
      "PROFESSEUR": "الأستاذ",
      "Professeur": "الأستاذ",
      "SIGNATURE": "التوقيع",
      "BILANS LETTRES": "حصيلة الآداب",
      "BILANS SCIENCES": "حصيلة العلوم",
      "BILANS AUTRES": "حصيلة أخرى",
      "LETTRES": "الآداب",
      "SCIENCES": "العلوم",
      "AUTRES": "أخرى",
      "Moyenne Générale": "المعدل العام",
      "Résultat de la Classe": "نتائج القسم",
      "Statut": "الوضعية",
      "Matricule": "رقم التسجيل",
      "Né(e) le": "تاريخ الازدياد",
      "Lieu de Naissance": "مكان الازدياد",
      "Classe": "القسم",
      "Effectif": "عدد التلاميذ",
      "Nationalité": "الجنسية",
      "Etablissement": "المؤسسة",
      "Année Scolaire": "السنة الدراسية",
      "Chef d'établissement": "مدير المؤسسة",
      "Le Directeur des Etudes": "مدير الدروس",
      "Professeur principal": "الأستاذ الرئيسي"
    };
    return map[word] || map[word.charAt(0).toUpperCase() + word.slice(1).toLowerCase()] || word;
  };

  const formatNum = (num: number | null | undefined, decimals: number = 2) => {
    if (num === null || num === undefined || isNaN(num)) return "-";
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

  const studentStats: Record<string, any> = {};
  
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
    const rankingsForSubj: { id: string; avg: number }[] = [];
    students.forEach(st => {
      const avg = studentStats[st.id]?.subjects[subject];
      if (avg !== undefined) {
        rankingsForSubj.push({ id: st.id, avg });
      }
    });
    rankingsForSubj.sort((a, b) => b.avg - a.avg);
    rankingsForSubj.forEach((r, index) => {
      if (index > 0 && r.avg === rankingsForSubj[index - 1].avg) {
        subjectRanks[subject][r.id] = subjectRanks[subject][rankingsForSubj[index - 1].id];
      } else {
        subjectRanks[subject][r.id] = index + 1;
      }
    });
  });

  const rankings: { id: string; avg: number }[] = [];
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

  const classAvg = rankings.reduce((acc, r) => acc + r.avg, 0) / (rankings.length || 1);
  const classMax = rankings.length > 0 ? rankings[0].avg : 0;
  const classMin = rankings.length > 0 ? rankings[rankings.length - 1].avg : 0;

  const getAppreciation = (note: number, subjectMaxScore = 20) => {
    const note20 = (note / subjectMaxScore) * 20;
    if (note20 >= 16) return isAr ? "ممتاز" : "Très Bien";
    if (note20 >= 14) return isAr ? "جيد" : "Bien";
    if (note20 >= 12) return isAr ? "مستحسن" : "Assez Bien";
    if (note20 >= 10) return isAr ? "مقبول" : "Passable";
    if (note20 >= 8) return isAr ? "غير كاف" : "Insuffisant";
    if (note20 >= 5) return isAr ? "ضعيف" : "Faible";
    return isAr ? "ضعيف جداً" : "Très Faible";
  };

  const getRankStr = (rank: number) => {
    if (isAr) return formatNum(rank, 0);
    return rank === 1 ? "1er" : rank + "e";
  };

  const getTeacherName = (subject: string) => {
    if (!schedules || schedules.length === 0) return '';
    const sched = schedules.find(s => s.class_id === classData?.id && s.subject === subject);
    if (sched && sched.teachers) {
      return `${sched.teachers.first_name || ''} ${sched.teachers.last_name || ''}`.trim();
    }
    return '';
  };

  const filteredStudents = students.filter(st => !targetStudentId || st.id === targetStudentId);

  const lettresSubjects = ["Français", "COMPO_FRANCAIS", "Anglais", "ANGLAIS", "Philosophie", "PHILOSOPHIE", "Histoire-Géographie", "HG", "HISTOIRE-GEOGRAPHIE", "Espagnol", "Allemand", "LV2", "Arabe"];
  const sciencesSubjects = ["Mathématiques", "MATHS", "MATHEMATIQUES", "Physique-Chimie", "PHYSIQUE", "PHYSIQUE-CHIMIE", "SVT", "Informatique", "INFORMATIQUE"];

  const categorizeSubject = (subj: string) => {
    const upper = (subj || '').toUpperCase();
    if (lettresSubjects.some(l => upper.includes(l.toUpperCase()))) return 'LETTRES';
    if (sciencesSubjects.some(s => upper.includes(s.toUpperCase()))) return 'SCIENCES';
    return 'AUTRES';
  };

  // ----------------------------------------------------
  // TEMPLATE 1: MODÈLE CLASSIQUE / OFFICIEL
  // ----------------------------------------------------
  const renderClassic = (st: any) => {
    const stats = studentStats[st.id];
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
          {showRank && <td>{sRank ? getRankStr(sRank) : '-'}</td>}
          <td>{getAppreciation(val, maxScore)}</td>
          {showTeacherNames && <td style={{fontSize: '0.75rem', color: '#334155'}}>{teacherName}</td>}
          <td></td>
        </tr>
      );
    };

    const renderGroup = (title: string, group: string[]) => {
      if (group.length === 0) return null;
      const { tMoy } = calculateGroupTotal(group);
      const colSpanLeft = 3;
      const colSpanRight = (showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1;

      return (
        <React.Fragment key={title}>
          {group.map(renderSubjectRow)}
          {title !== 'AUTRES' && (
            <tr className="bulletin-group-header">
              <td colSpan={colSpanLeft} style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: '#dcfce7'}}>
                {isAr ? 'حصيلة ' + translateBulletinWord(title) : 'BILANS ' + title.toUpperCase()}
              </td>
              <td style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: '#dcfce7'}}>
                {formatNum(tMoy, 1)}
              </td>
              <td colSpan={colSpanRight} style={{backgroundColor: '#dcfce7'}}></td>
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
            {ministryText}<br/>
            <strong>{drenText ? `DREN ${drenText.toUpperCase()}` : ''}</strong>
          </div>
          <div className="header-center">
            <h2 style={{color: brandColor}}>{customTitle.toUpperCase()}</h2>
            <h3>{period || '3ème Trimestre'}</h3>
          </div>
          <div className="header-right">
            {translateBulletinWord("Année Scolaire")}<br/>
            <strong>{schoolInfo?.academic_year || `${new Date().getFullYear() - 1} - ${new Date().getFullYear()}`}</strong>
          </div>
        </div>

        {/* 2. School Info */}
        <div className="bulletin-classic-school" style={{borderColor: brandColor}}>
          <div className="school-logo">
            <img 
              src={schoolInfo?.logo_url || '/logo-coran.jpg'} 
              alt="Logo" 
              style={{width: '75px', height: '75px', borderRadius: '50%', objectFit: 'contain'}} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg'; }}
            />
          </div>
          <div className="school-details">
            <p>{translateBulletinWord("Etablissement")}: <strong>{(schoolInfo?.school_name || schoolInfo?.name || "ÉTABLISSEMENT SCOLAIRE").toUpperCase()}</strong></p>
            <div style={{display: 'flex', gap: '30px', marginTop: '6px', fontSize: '0.8rem'}}>
              <p>{translateBulletinWord("Adresse Postale")}: <strong>{schoolInfo?.address || drenText}</strong></p>
              <p>{translateBulletinWord("Telephone")}: <strong>{schoolInfo?.phone || '-'}</strong></p>
            </div>
          </div>
          <div className="school-statut">
            {showPhoto && st.photo_url ? (
              <img src={st.photo_url} alt="Élève" style={{width: '55px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc'}} />
            ) : null}
            <div>
              <p>Code: <strong>{schoolInfo?.code || (schoolInfo?.id ? String(schoolInfo.id).substring(0, 6).toUpperCase() : '198192')}</strong></p>
              <p>Statut: <strong>{schoolStatut}</strong></p>
            </div>
          </div>
        </div>

        {/* 3. Student Info */}
        <div className="bulletin-classic-student" style={{borderColor: brandColor}}>
          <div className="student-profile-header">
            <span className="student-fullname">{st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()}</span>
            <span>Sexe: <strong>{st.gender || 'F'}</strong></span>
            <span>Redoublant(e): <strong>{st.is_repeater ? 'Oui' : 'Non'}</strong></span>
            <span>Affecté(e): <strong>{st.is_assigned !== undefined ? (st.is_assigned ? 'Oui' : 'Non') : '-'}</strong></span>
          </div>
          <div className="student-profile-grid">
            <div>{translateBulletinWord("Matricule")}: <strong>{st.matricule || st.id.substring(0,8).toUpperCase()}</strong></div>
            <div>{translateBulletinWord("Né(e) le")}: <strong>{st.birth_date ? new Date(st.birth_date).toLocaleDateString(isAr ? 'ar-EG' : 'fr-FR') : '-'}</strong></div>
            <div>{translateBulletinWord("Lieu de Naissance")}: <strong>{st.birth_place || '-'}</strong></div>
            <div>{translateBulletinWord("Classe")}: <strong>{classData?.name || '-'}</strong></div>
            <div>{translateBulletinWord("Effectif")}: <strong>{formatNum(students.length, 0)}</strong></div>
            <div>{translateBulletinWord("Nationalité")}: <strong>{st.nationality || 'Ivoirienne'}</strong></div>
          </div>
        </div>

        {/* 4. Grades Table */}
        <table className="bulletin-classic-table">
          <thead>
            <tr style={{backgroundColor: '#f8fafc'}}>
              <th style={{width: '24%'}}>{translateBulletinWord("DISCIPLINES")}</th>
              <th style={{width: '8%'}}>{translateBulletinWord("MOY")}</th>
              <th style={{width: '7%'}}>{translateBulletinWord("COEF")}</th>
              <th style={{width: '9%'}}>{translateBulletinWord("Total")}</th>
              {showRank && <th style={{width: '7%'}}>{translateBulletinWord("RANG")}</th>}
              <th style={{width: '18%'}}>{translateBulletinWord("Appréciations")}</th>
              {showTeacherNames && <th style={{width: '17%'}}>{translateBulletinWord("PROFESSEUR")}</th>}
              <th style={{width: '10%'}}>{translateBulletinWord("SIGNATURE")}</th>
            </tr>
          </thead>
          <tbody>
            {renderGroup('LETTRES', lettres)}
            {renderGroup('SCIENCES', sciences)}
            {renderGroup('AUTRES', autres)}
            
            <tr className="bulletin-classic-totaux">
              <td colSpan={2} style={{fontWeight: 'bold', textTransform: 'uppercase'}}>TOTAUX</td>
              <td style={{fontWeight: 'bold'}}>{formatNum(stats.totalSubjectCoefs, 0)}</td>
              <td style={{fontWeight: 'bold'}}>{formatNum(stats.totalWeightedScore, 1)}</td>
              <td colSpan={(showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1}></td>
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
                    {showRank && (
                      <tr>
                        <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center'}}>Rang: <strong>{period === '1er Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                        <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center'}}>Rang: <strong>{period === '2ème Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                        <td style={{border: 'none', textAlign: 'center'}}>Rang: <strong>{period === '3ème Trimestre' ? getRankStr(stats.rank) : '-'}</strong></td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>
              <td style={{width: '32%', textAlign: 'center', verticalAlign: 'middle', borderLeft: '2px solid black', borderRight: '2px solid black', padding: '6px', backgroundColor: '#f8fafc'}}>
                <p style={{fontWeight: 'bold', marginBottom: '4px', fontSize: '0.85rem'}}>Moyenne {period.includes('3ème') ? 'annuelle' : 'trimestrielle'}</p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '4px 0', color: brandColor}}>{formatNum(stats.generalAverage, 2)} /20</p>
                {showRank && <p style={{margin: 0}}>Rang: <strong style={{fontSize: '1.1rem'}}>{getRankStr(stats.rank)}</strong></p>}
              </td>
              <td style={{width: '30%', verticalAlign: 'top', padding: 0}}>
                {showClassStats ? (
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
                ) : (
                  <div style={{padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b'}}>Statistiques masquées</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 6. Signatures & Honor Roll Box */}
        {showSignatures && (
          <table className="bulletin-classic-table bulletin-classic-bottom-table" style={{borderTop: 'none'}}>
            <tbody>
              <tr>
                <td style={{width: '38%', verticalAlign: 'top', padding: 0}}>
                  {showHonorRoll ? (
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.72rem'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '2px'}}>Distinctions & Mentions</th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{backgroundColor: stats.generalAverage >= 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur + félicitations {stats.generalAverage >= 16 ? '⭐' : ''}</td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 12 && stats.generalAverage < 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur + Encouragement</td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 10 && stats.generalAverage < 12 ? '#f1f5f9' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Tableau d'honneur</td>
                        </tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc'}}>SANCTION</td></tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>Avertissement travail</td></tr>
                        <tr><td style={{border: 'none', padding: '2px 6px'}}>Blâme conduite</td></tr>
                      </tbody>
                    </table>
                  ) : (
                    <div style={{padding: '12px', fontSize: '0.75rem', color: '#64748b'}}>Appréciation globale : <strong>{getAppreciation(stats.generalAverage, 20)}</strong></div>
                  )}
                </td>
                <td style={{width: '32%', textAlign: 'center', verticalAlign: 'top', padding: '6px', borderLeft: '2px solid black', borderRight: '2px solid black'}}>
                  <p style={{fontWeight: 'bold', textDecoration: 'underline', marginBottom: '8px', fontSize: '0.85rem'}}>Décision de fin d'année</p>
                  <p style={{marginBottom: '6px', fontSize: '0.8rem'}}>Admis(e) en classe supérieure</p>
                  <p style={{fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginBottom: '24px'}}>Observations</p>
                  <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: 0}}>Professeur principal</p>
                </td>
                <td style={{width: '30%', textAlign: 'center', verticalAlign: 'top', padding: '6px', position: 'relative'}}>
                  <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                    <div>
                      <p style={{fontWeight: 'bold', fontSize: '0.82rem', margin: '0 0 2px 0'}}>Chef d'établissement</p>
                    </div>
                    
                    <div style={{margin: '10px 0'}}>
                      <p style={{fontSize: '0.75rem', margin: 0}}>Fait à {schoolInfo?.city || drenText}, le :</p>
                      <p style={{fontWeight: 'bold', fontSize: '0.8rem', marginTop: '2px'}}>{new Date().toLocaleDateString(isAr ? 'ar-EG' : 'fr-FR')}</p>
                    </div>

                    {stampUrl && (
                      <div style={{margin: '4px 0'}}>
                        <img src={stampUrl} alt="Cachet" style={{maxHeight: '45px', maxWidth: '100px', objectFit: 'contain', opacity: 0.85}} />
                      </div>
                    )}

                    <div>
                      <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: '0 0 2px 0'}}>Le Directeur des Etudes</p>
                      <p style={{fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: '10px'}}>{schoolInfo?.principal_name || schoolInfo?.studies_director_name || 'LA DIRECTION'}</p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 2: MODÈLE FRANCO-ARABE / BILINGUE
  // ----------------------------------------------------
  // ----------------------------------------------------
  // TEMPLATE 2: MODÈLE FRANCO-ARABE / BILINGUE (INSPIRÉ DU MODÈLE CLASSIQUE)
  // ----------------------------------------------------
  const getSubjectArabicName = (subject: string) => {
    const s = (subject || '').trim();
    const map: Record<string, string> = {
      "Coran": "القرآن الكريم",
      "Le Coran": "القرآن الكريم",
      "CORAN": "القرآن الكريم",
      "Hadith": "الحديث النبوي",
      "Le Hadith": "الحديث النبوي",
      "HADITH": "الحديث النبوي",
      "Tawhid": "التوحيد والعقيدة",
      "L'Unicité": "التوحيد",
      "L'Unicité - Tawhid": "التوحيد",
      "TAWHID": "التوحيد",
      "Fiqh": "الفقه الإسلامي",
      "La Jurisprudence": "الفقه",
      "La Jurisprudence - Fiqh": "الفقه",
      "FIQH": "الفقه",
      "Calcul": "الحساب",
      "Le Calcul": "الحساب",
      "CALCUL": "الحساب",
      "Mathématiques": "الرياضيات",
      "Maths": "الرياضيات",
      "Français": "اللغة الفرنسية",
      "Lecture": "القراءة",
      "Arabe": "اللغة العربية",
      "Langue Arabe": "اللغة العربية",
      "Histoire-Géographie": "التاريخ والجغرافيا",
      "Histoire": "التاريخ",
      "Géographie": "الجغرافيا",
      "Physique-Chimie": "الفيزياء والكيمياء",
      "SVT": "علوم الحياة والأرض",
      "Sciences": "العلوم الطبيعية",
      "EPS": "التربية البدنية",
      "Sport": "الرياضة",
      "Morale": "التربية الإسلامية والأخلاق",
      "Conduite": "السلوك والمواظبة",
      "Sirah": "السيرة النبوية",
      "Tajwid": "أحكام التجويد",
      "Dictée": "الإملاء",
      "Grammaire": "النحو والصرف",
      "Conjugaison": "الصرف",
      "Écriture": "الخط والإملاء",
      "Poésie": "المحفوظات والأناشيد",
      "Informatique": "الإعلام الآلي",
      "Anglais": "اللغة الإنجليزية",
      "Philosophie": "الفلسفة"
    };
    return map[s] || translateBulletinWord(s);
  };

  const getArabicAppreciation = (note20: number) => {
    if (note20 >= 16) return "ممتاز (Très Bien)";
    if (note20 >= 14) return "جيد جداً (Bien)";
    if (note20 >= 12) return "جيد (Assez Bien)";
    if (note20 >= 10) return "مقبول (Passable)";
    if (note20 >= 8) return "غير كاف (Insuffisant)";
    return "ضعيف (Médiocre)";
  };

  const getHijriDate = () => {
    try {
      return new Intl.DateTimeFormat('ar-SA-u-ca-islamic-umalqura', {
        day: 'numeric',
        month: 'long',
        year: 'numeric'
      }).format(new Date());
    } catch (e) {
      return new Date().toLocaleDateString('ar-EG');
    }
  };

  const categorizeBilingualSubject = (name: string): 'ARABE_ISLAMIQUE' | 'GENERAL' | 'AUTRES' => {
    const s = name.toLowerCase();
    if (
      s.includes('coran') || 
      s.includes('hadith') || 
      s.includes('fiqh') || 
      s.includes('tawhid') || 
      s.includes('unicité') || 
      s.includes('jurisprudence') || 
      s.includes('arabe') || 
      s.includes('sirah') || 
      s.includes('tajwid') || 
      s.includes('islam') || 
      s.includes('قرآن') || 
      s.includes('حديث') || 
      s.includes('فقه') || 
      s.includes('توحيد')
    ) {
      return 'ARABE_ISLAMIQUE';
    }
    if (
      s.includes('conduite') || 
      s.includes('eps') || 
      s.includes('sport') || 
      s.includes('morale') || 
      s.includes('art') || 
      s.includes('musique') ||
      s.includes('سلوك')
    ) {
      return 'AUTRES';
    }
    return 'GENERAL';
  };

  const toArDigits = (val: any): string => {
    if (val === null || val === undefined || val === '') return '-';
    const str = String(val);
    const arMap: Record<string, string> = {
      '0': '٠', '1': '١', '2': '٢', '3': '٣', '4': '٤',
      '5': '٥', '6': '٦', '7': '٧', '8': '٨', '9': '٩'
    };
    return str.replace(/[0-9]/g, d => arMap[d] || d);
  };

  const renderModern = (st: any) => {
    const stats = studentStats[st.id];
    const studentSubjs = subjects.filter(s => stats.subjects[s] !== undefined);
    const groupeArabe = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'ARABE_ISLAMIQUE');
    const groupeGeneral = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'GENERAL');
    const groupeAutres = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'AUTRES');

    const calculateBilingualGroupTotal = (group: string[]) => {
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

    const renderBilingualSubjectRow = (s: string) => {
      const val = stats.subjects[s];
      const coef = getSubjectCoef(s);
      const total = val * coef;
      const sRank = subjectRanks[s]?.[st.id];
      const teacherName = getTeacherName(s);
      const maxScore = subjectMaxScores[s] || 20;
      const arName = getSubjectArabicName(s);

      return (
        <tr key={s}>
          <td style={{padding: '5px 8px', textAlign: 'left', fontWeight: 'bold'}}>
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span style={{fontSize: '0.82rem'}}>{s}</span>
              <span style={{fontSize: '0.85rem', fontFamily: '"Cairo", "Traditional Arabic", serif', direction: 'rtl', color: '#0f172a'}}>
                {arName}
              </span>
            </div>
          </td>
          <td style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
            {formatNum(val, 1)}{maxScore !== 20 ? ' /' + maxScore : ''}
          </td>
          <td style={{textAlign: 'center', fontSize: '0.82rem'}}>{formatNum(coef, 0)}</td>
          <td style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
            {formatNum(total, 1)}{maxScore !== 20 ? ' /' + (maxScore * coef) : ''}
          </td>
          {showRank && (
            <td style={{textAlign: 'center', fontSize: '0.82rem'}}>
              {sRank ? (
                <span style={{unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block'}}>
                  {sRank}<sup>{sRank === 1 ? 'er' : 'e'}</sup>
                </span>
              ) : '-'}
            </td>
          )}
          <td style={{padding: '4px 6px', fontSize: '0.78rem'}}>
            <div style={{fontWeight: 600}}>{getAppreciation(val, maxScore)}</div>
          </td>
          {showTeacherNames && <td style={{fontSize: '0.75rem', color: '#334155'}}>{teacherName}</td>}
          <td style={{textAlign: 'center'}}></td>
        </tr>
      );
    };

    const renderBilingualGroup = (titleFr: string, titleAr: string, group: string[], bgColor = '#f0fdf4') => {
      if (group.length === 0) return null;
      const { tMoy } = calculateBilingualGroupTotal(group);
      const colSpanLeft = 3;
      const colSpanRight = (showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1;

      return (
        <React.Fragment key={titleFr}>
          {group.map(renderBilingualSubjectRow)}
          {titleFr !== 'AUTRES DISCIPLINES' && (
            <tr className="bulletin-group-header">
              <td colSpan={colSpanLeft} style={{fontWeight: 'bold', padding: '4px 8px', backgroundColor: bgColor}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span style={{fontSize: '0.78rem', textTransform: 'uppercase'}}>{titleFr}</span>
                  <span style={{fontSize: '0.82rem', fontFamily: '"Cairo", serif', direction: 'rtl'}}>{titleAr}</span>
                </div>
              </td>
              <td style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: bgColor, fontSize: '0.85rem'}}>
                {formatNum(tMoy, 1)}
              </td>
              <td colSpan={colSpanRight} style={{backgroundColor: bgColor}}></td>
            </tr>
          )}
        </React.Fragment>
      );
    };

    const studentFullNameAr = (st.first_name_ar || st.last_name_ar) 
      ? `${st.first_name_ar || ''} ${st.last_name_ar || ''}`.trim() 
      : `${st.first_name || ''} ${st.last_name || ''}`.trim();

    return (
      <div key={st.id} className="bulletin-classic-page">
        {/* 1. Header Row (Bilingual Header) */}
        <div className="bulletin-classic-header">
          <div className="header-left" style={{lineHeight: 1.2}}>
            <div style={{fontWeight: 'bold', fontSize: '0.78rem'}}>{ministryText || "MINISTERE DE L'EDUCATION NATIONALE"}</div>
            <div style={{fontSize: '0.72rem', fontStyle: 'italic', margin: '2px 0'}}>REPUBLIQUE DE COTE D'IVOIRE</div>
            <div style={{fontSize: '0.72rem', color: '#475569'}}>{drenText ? `DREN ${drenText.toUpperCase()}` : ''}</div>
          </div>

          <div className="header-center">
            <div style={{fontSize: '1rem', fontWeight: 900, fontFamily: '"Cairo", serif', direction: 'rtl', color: brandColor, marginBottom: '1px'}}>
              ! الله أكبر
            </div>
            <div style={{fontSize: '1.25rem', fontWeight: 900, fontFamily: '"Cairo", "Traditional Arabic", serif', direction: 'rtl', color: brandColor, margin: '1px 0'}}>
              كشف الدرجات
            </div>
            <h2 style={{color: brandColor, margin: '1px 0 2px 0', fontSize: '1.05rem', fontWeight: 800, letterSpacing: '0.5px'}}>
              {customTitle ? customTitle.toUpperCase() : 'BULLETIN TRIMESTRIEL DE NOTES'}
            </h2>
            <h3 style={{margin: '2px 0', fontSize: '0.9rem'}}>
              {period || '1er Trimestre - الفترة الأولى'}
            </h3>
          </div>

          <div className="header-right" style={{lineHeight: 1.2, direction: 'rtl'}}>
            <div style={{fontWeight: 'bold', fontSize: '0.82rem', fontFamily: '"Cairo", serif'}}>جمهورية كوت ديفوار</div>
            <div style={{fontSize: '0.72rem', margin: '2px 0'}}>وزارة التربية الوطنية</div>
            <div style={{fontSize: '0.75rem', fontWeight: 'bold'}}>
              العام الدراسي : {toArDigits(schoolInfo?.academic_year || `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`)}
            </div>
          </div>
        </div>

        {/* 2. School Info Box */}
        <div className="bulletin-classic-school" style={{borderColor: brandColor}}>
          <div className="school-logo">
            <img 
              src={schoolInfo?.logo_url || '/logo-coran.jpg'} 
              alt="Logo" 
              style={{width: '75px', height: '75px', borderRadius: '50%', objectFit: 'contain'}} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg'; }}
            />
          </div>
          <div className="school-details">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px', gap: '10px', flexWrap: 'wrap'}}>
              <p style={{margin: 0, fontSize: '0.98rem'}}>
                Établissement : <strong style={{color: '#0f172a'}}>{(schoolInfo?.school_name || schoolInfo?.name || "ÉTABLISSEMENT SCOLAIRE").toUpperCase()}</strong>
              </p>
              {schoolInfo?.school_name_ar ? (
                <span style={{fontSize: '1.15rem', fontWeight: 900, fontFamily: '"Cairo", "Traditional Arabic", serif', direction: 'rtl', color: brandColor}}>
                  {schoolInfo.school_name_ar}
                </span>
              ) : null}
            </div>
            <div style={{display: 'flex', gap: '30px', marginTop: '6px', fontSize: '0.8rem'}}>
              <p style={{margin: 0}}>Adresse / العنوان : <strong>{schoolInfo?.address || drenText}</strong></p>
              <p style={{margin: 0}}>Téléphone / الهاتف : <strong>{toArDigits(schoolInfo?.phone || '-')}</strong></p>
            </div>
          </div>
          <div className="school-statut">
            {showPhoto && st.photo_url ? (
              <img src={st.photo_url} alt="Élève" style={{width: '55px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc'}} />
            ) : null}
            <div>
              <p>Code: <strong>{schoolInfo?.code || (schoolInfo?.id ? String(schoolInfo.id).substring(0, 6).toUpperCase() : '198192')}</strong></p>
              <p>Statut: <strong>{schoolStatut}</strong></p>
            </div>
          </div>
        </div>

        {/* 3. Student Profile Box */}
        <div className="bulletin-classic-student" style={{borderColor: brandColor}}>
          <div className="student-profile-header">
            <span className="student-fullname" style={{fontSize: '1rem', fontWeight: 800}}>
              {st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()} 
              {studentFullNameAr && <span style={{marginLeft: '10px', fontFamily: '"Cairo", serif', fontWeight: 700}}>({studentFullNameAr})</span>}
            </span>
            <span>Sexe / الجنس : <strong>{st.gender || 'M'}</strong></span>
            <span>Redoublant(e) / معيد : <strong>{st.is_repeater ? 'Oui' : 'Non'}</strong></span>
            <span>Affecté(e) : <strong>{st.is_assigned !== undefined ? (st.is_assigned ? 'Oui' : 'Non') : '-'}</strong></span>
          </div>
          <div className="student-profile-grid">
            <div>
              Matricule : <strong>{st.matricule || st.id.substring(0,8).toUpperCase()}</strong> <span style={{fontFamily: '"Cairo", serif', fontSize: '0.78rem'}}>({toArDigits(st.matricule || '')})</span>
            </div>
            <div>
              Né(e) le : <strong>{st.birth_date ? new Date(st.birth_date).toLocaleDateString('fr-FR') : '-'}</strong> <span style={{fontFamily: '"Cairo", serif', fontSize: '0.78rem'}}>({st.birth_date ? toArDigits(new Date(st.birth_date).toLocaleDateString('fr-FR')) : '-'})</span>
            </div>
            <div>Lieu / مكان الميلاد : <strong>{st.birth_place || '-'}</strong></div>
            <div>Classe / القسم : <strong>{classData?.name || '-'}</strong></div>
            <div>
              Effectif : <strong>{formatNum(students.length, 0)}</strong> <span style={{fontFamily: '"Cairo", serif', fontSize: '0.78rem'}}>(عدد الطلاب : {toArDigits(students.length)})</span>
            </div>
            <div>Nationalité / الجنسية : <strong>{st.nationality || 'Ivoirienne'}</strong></div>
          </div>
        </div>

        {/* 4. Grades Table */}
        <table className="bulletin-classic-table">
          <thead>
            <tr style={{backgroundColor: '#f8fafc'}}>
              <th style={{width: '28%', textAlign: 'left', padding: '6px 8px'}}>DISCIPLINES / المواد</th>
              <th style={{width: '8%', textAlign: 'center'}}>MOY</th>
              <th style={{width: '6%', textAlign: 'center'}}>COEF</th>
              <th style={{width: '9%', textAlign: 'center'}}>TOTAL</th>
              {showRank && <th style={{width: '7%', textAlign: 'center'}}>RANG</th>}
              <th style={{width: '18%', textAlign: 'center'}}>APPRÉCIATIONS / التقدير</th>
              {showTeacherNames && <th style={{width: '14%', textAlign: 'center'}}>PROFESSEUR</th>}
              <th style={{width: '10%', textAlign: 'center'}}>SIGNATURE</th>
            </tr>
          </thead>
          <tbody>
            {renderBilingualGroup('ENSEIGNEMENT ISLAMIQUE & ARABE', 'التعليم العربي والإسلامي', groupeArabe, '#dcfce7')}
            {renderBilingualGroup('ENSEIGNEMENT GÉNÉRAL', 'التعليم العام', groupeGeneral, '#e0f2fe')}
            {renderBilingualGroup('AUTRES DISCIPLINES', 'مواد أخرى', groupeAutres, '#f1f5f9')}
            
            <tr className="bulletin-classic-totaux">
              <td colSpan={2} style={{fontWeight: 'bold', textTransform: 'uppercase', padding: '6px 8px'}}>
                <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                  <span>TOTAUX GÉNÉRAUX</span>
                  <span style={{fontFamily: '"Cairo", serif'}}>المجموع العام : {toArDigits(formatNum(stats.totalWeightedScore, 1))}</span>
                </div>
              </td>
              <td style={{fontWeight: 'bold', textAlign: 'center'}}>{formatNum(stats.totalSubjectCoefs, 0)}</td>
              <td style={{fontWeight: 'bold', textAlign: 'center'}}>{formatNum(stats.totalWeightedScore, 1)}</td>
              <td colSpan={(showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1}></td>
            </tr>
          </tbody>
        </table>

        {/* 5. Averages & Ranks Box */}
        <table className="bulletin-classic-table bulletin-classic-bottom-table">
          <tbody>
            <tr>
              {/* Left Column: Trimestres */}
              <td style={{width: '38%', verticalAlign: 'top', padding: 0}}>
                <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                  <thead>
                    <tr>
                      <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', width: '33%', textAlign: 'center', padding: '3px'}}>Trim 1 / ف ١</th>
                      <th style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', width: '33%', textAlign: 'center', padding: '3px'}}>Trim 2 / ف ٢</th>
                      <th style={{border: 'none', borderBottom: '1px solid black', width: '34%', textAlign: 'center', padding: '3px'}}>Trim 3 / ف ٣</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        Moy: <strong>{period === '1er Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong>
                      </td>
                      <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        Moy: <strong>{period === '2ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong>
                      </td>
                      <td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        Moy: <strong>{period === '3ème Trimestre' ? formatNum(stats.generalAverage, 2) : '-'}</strong>
                      </td>
                    </tr>
                    {showRank && (
                      <tr>
                        <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center', padding: '4px'}}>
                          Rang: <strong style={{unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block'}}>{period === '1er Trimestre' ? `${stats.rank}${stats.rank === 1 ? 'er' : 'e'}` : '-'}</strong>
                        </td>
                        <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center', padding: '4px'}}>
                          Rang: <strong style={{unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block'}}>{period === '2ème Trimestre' ? `${stats.rank}${stats.rank === 1 ? 'er' : 'e'}` : '-'}</strong>
                        </td>
                        <td style={{border: 'none', textAlign: 'center', padding: '4px'}}>
                          Rang: <strong style={{unicodeBidi: 'isolate', direction: 'ltr', display: 'inline-block'}}>{period === '3ème Trimestre' ? `${stats.rank}${stats.rank === 1 ? 'er' : 'e'}` : '-'}</strong>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>

              {/* Center Column: General Average */}
              <td style={{width: '32%', textAlign: 'center', verticalAlign: 'middle', borderLeft: '2px solid black', borderRight: '2px solid black', padding: '6px', backgroundColor: '#f8fafc'}}>
                <p style={{fontWeight: 'bold', marginBottom: '2px', fontSize: '0.85rem'}}>
                  Moyenne {period.includes('3ème') ? 'annuelle' : 'trimestrielle'} / المعدل
                </p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '3px 0', color: brandColor}}>
                  {formatNum(stats.generalAverage, 2)} /20
                </p>
                {showRank && (
                  <p style={{margin: 0, fontSize: '0.85rem', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '4px'}}>
                    <span>Rang :</span>
                    <strong style={{fontSize: '1.15rem', display: 'inline-block', unicodeBidi: 'isolate', direction: 'ltr'}}>
                      {stats.rank}<sup>{stats.rank === 1 ? 'er' : 'e'}</sup>
                    </strong>
                    <span style={{fontFamily: '"Cairo", serif', direction: 'rtl', marginRight: '4px'}}>
                      (الترتيب : {toArDigits(stats.rank)})
                    </span>
                  </p>
                )}
                <div style={{marginTop: '4px', fontSize: '0.8rem', fontWeight: 'bold', color: '#15803d'}}>
                  {getArabicAppreciation(stats.generalAverage)}
                </div>
              </td>

              {/* Right Column: Class Stats */}
              <td style={{width: '30%', verticalAlign: 'top', padding: 0}}>
                {showClassStats ? (
                  <table style={{width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                    <thead>
                      <tr>
                        <th colSpan={3} style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '3px'}}>
                          Résultat Classe / نتائج القسم
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '3px 6px', width: '32%', fontWeight: 500}}>
                          Moyenne
                        </td>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center', fontWeight: 'bold', width: '34%', fontSize: '0.85rem'}}>
                          {formatNum(classAvg, 2)}
                        </td>
                        <td style={{border: 'none', borderBottom: '1px solid black', padding: '3px 6px', textAlign: 'right', fontFamily: '"Cairo", serif', direction: 'rtl', width: '34%'}}>
                          معدل القسم
                        </td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', padding: '3px 6px', fontWeight: 500}}>
                          Min
                        </td>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderRight: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
                          {formatNum(classMin, 2)}
                        </td>
                        <td style={{border: 'none', borderBottom: '1px solid black', padding: '3px 6px', textAlign: 'right', fontFamily: '"Cairo", serif', direction: 'rtl'}}>
                          أدنى درجة
                        </td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', borderRight: '1px solid black', padding: '3px 6px', fontWeight: 500}}>
                          Max
                        </td>
                        <td style={{border: 'none', borderRight: '1px solid black', textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
                          {formatNum(classMax, 2)}
                        </td>
                        <td style={{border: 'none', padding: '3px 6px', textAlign: 'right', fontFamily: '"Cairo", serif', direction: 'rtl'}}>
                          أعلى درجة
                        </td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b'}}>Statistiques masquées</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 6. Signatures & Honors Box */}
        {showSignatures && (
          <table className="bulletin-classic-table bulletin-classic-bottom-table" style={{borderTop: 'none'}}>
            <tbody>
              <tr>
                {/* Honors */}
                <td style={{width: '34%', verticalAlign: 'top', padding: 0}}>
                  {showHonorRoll ? (
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.72rem'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '2px'}}>
                            Distinctions / لوحة الشرف
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{backgroundColor: stats.generalAverage >= 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>
                            Tableau d'honneur + félicitations {stats.generalAverage >= 16 ? '⭐' : ''}
                          </td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 12 && stats.generalAverage < 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>
                            Tableau d'honneur + Encouragement
                          </td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 10 && stats.generalAverage < 12 ? '#f1f5f9' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px'}}>
                            Tableau d'honneur
                          </td>
                        </tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc'}}>VISA PARENT / تأشير الولي</td></tr>
                        <tr><td style={{border: 'none', height: '24px', padding: '2px 6px'}}></td></tr>
                      </tbody>
                    </table>
                  ) : (
                    <div style={{padding: '12px', fontSize: '0.75rem', color: '#64748b'}}>Appréciation globale : <strong>{getAppreciation(stats.generalAverage, 20)}</strong></div>
                  )}
                </td>

                {/* Teachers Appreciations */}
                <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '6px', borderLeft: '2px solid black', borderRight: '2px solid black'}}>
                  <p style={{fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '0.82rem'}}>
                    Appréciation des Maîtres / تقدير المدرسين
                  </p>
                  <p style={{marginBottom: '6px', fontSize: '0.8rem'}}>Admis(e) en classe supérieure</p>
                  <p style={{fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginBottom: '20px'}}>Observations</p>
                  <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: 0}}>Le Professeur Principal</p>
                </td>

                {/* Direction & Stamp */}
                <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '6px', position: 'relative'}}>
                  <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                    <div>
                      <p style={{fontWeight: 'bold', fontSize: '0.82rem', margin: '0 0 2px 0'}}>
                        Visa du Directeur / تأشير المدير
                      </p>
                    </div>
                    
                    <div style={{margin: '6px 0', fontSize: '0.75rem'}}>
                      <p style={{margin: 0}}>Fait à {schoolInfo?.city || drenText || 'Divo'}, le : <strong>{new Date().toLocaleDateString('fr-FR')}</strong></p>
                      <p style={{margin: '2px 0 0 0', direction: 'rtl', fontFamily: '"Cairo", serif', fontWeight: 'bold'}}>
                        حرر في {schoolInfo?.city || 'ديفو'} : {toArDigits(getHijriDate())}
                      </p>
                    </div>

                    {stampUrl && (
                      <div style={{margin: '4px 0'}}>
                        <img src={stampUrl} alt="Cachet" style={{maxHeight: '45px', maxWidth: '100px', objectFit: 'contain', opacity: 0.85}} />
                      </div>
                    )}

                    <div>
                      <p style={{fontSize: '0.82rem', fontWeight: 'bold', textTransform: 'uppercase', marginTop: stampUrl ? '2px' : '15px'}}>
                        {schoolInfo?.principal_name || schoolInfo?.studies_director_name || 'LA DIRECTION'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  const getArabicPeriodName = (p: string) => {
    if (!p) return "الفترة الأولى";
    if (p.includes("1er Trimestre") || p.includes("1")) return "الفترة الأولى (الفصل الأول)";
    if (p.includes("2ème Trimestre") || p.includes("2")) return "الفترة الثانية (الفصل الثاني)";
    if (p.includes("3ème Trimestre") || p.includes("3")) return "الفترة الثالثة (الفصل الثالث)";
    if (p.includes("1er Semestre")) return "السداسي الأول";
    if (p.includes("2ème Semestre")) return "السداسي الثاني";
    return p;
  };

  // ----------------------------------------------------
  // TEMPLATE 3: MODÈLE ARABE OFFICIEL (INSPIRÉ DU MODÈLE CLASSIQUE)
  // ----------------------------------------------------
  const renderCompact = (st: any, _index: number) => {
    const stats = studentStats[st.id];
    const studentSubjs = subjects.filter(s => stats.subjects[s] !== undefined);
    
    // Group subjects into Arabic categories
    const groupeIslamique = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'ARABE_ISLAMIQUE');
    const groupeGeneral = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'GENERAL');
    const groupeAutres = studentSubjs.filter(s => categorizeBilingualSubject(s) === 'AUTRES');

    const calculateArabicGroupTotal = (group: string[]) => {
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

    const renderArabicSubjectRow = (s: string) => {
      const val = stats.subjects[s];
      const coef = getSubjectCoef(s);
      const total = val * coef;
      const sRank = subjectRanks[s]?.[st.id];
      const teacherName = getTeacherName(s);
      const maxScore = subjectMaxScores[s] || 20;
      const arName = getSubjectArabicName(s);

      const val20 = (val / maxScore) * 20;

      return (
        <tr key={s}>
          <td style={{padding: '5px 8px', textAlign: 'right', fontWeight: 'bold', fontSize: '0.85rem'}}>
            {arName}
          </td>
          <td style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
            {toArDigits(formatNum(val, 1))}{maxScore !== 20 ? ' /' + toArDigits(maxScore) : ''}
          </td>
          <td style={{textAlign: 'center', fontSize: '0.82rem'}}>{toArDigits(coef)}</td>
          <td style={{textAlign: 'center', fontWeight: 'bold', fontSize: '0.85rem'}}>
            {toArDigits(formatNum(total, 1))}{maxScore !== 20 ? ' /' + toArDigits(maxScore * coef) : ''}
          </td>
          {showRank && (
            <td style={{textAlign: 'center', fontSize: '0.82rem'}}>
              {sRank ? toArDigits(sRank) : '-'}
            </td>
          )}
          <td style={{padding: '4px 6px', fontSize: '0.8rem', textAlign: 'right'}}>
            <div style={{fontWeight: 600}}>{getArabicAppreciation(val20).split(' ')[0]}</div>
          </td>
          {showTeacherNames && <td style={{fontSize: '0.78rem', color: '#334155', textAlign: 'center'}}>{teacherName}</td>}
          <td style={{textAlign: 'center'}}></td>
        </tr>
      );
    };

    const renderArabicGroup = (titleAr: string, group: string[], bgColor = '#f0fdf4') => {
      if (group.length === 0) return null;
      const { tMoy } = calculateArabicGroupTotal(group);
      const colSpanLeft = 3;
      const colSpanRight = (showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1;

      return (
        <React.Fragment key={titleAr}>
          {group.map(renderArabicSubjectRow)}
          {titleAr !== 'مواد أخرى والأنشطة' && (
            <tr className="bulletin-group-header">
              <td colSpan={colSpanLeft} style={{fontWeight: 'bold', padding: '4px 8px', backgroundColor: bgColor, textAlign: 'right'}}>
                <span style={{fontSize: '0.82rem', fontFamily: '"Cairo", serif'}}>{titleAr}</span>
              </td>
              <td style={{fontWeight: 'bold', textAlign: 'center', backgroundColor: bgColor, fontSize: '0.85rem'}}>
                {toArDigits(formatNum(tMoy, 1))}
              </td>
              <td colSpan={colSpanRight} style={{backgroundColor: bgColor}}></td>
            </tr>
          )}
        </React.Fragment>
      );
    };

    const studentFullNameAr = (st.first_name_ar || st.last_name_ar) 
      ? `${st.first_name_ar || ''} ${st.last_name_ar || ''}`.trim() 
      : `${st.first_name || ''} ${st.last_name || ''}`.trim();

    return (
      <div key={st.id} className="bulletin-classic-page" dir="rtl" style={{fontFamily: '"Cairo", "Traditional Arabic", "Segoe UI", serif', textAlign: 'right'}}>
        {/* 1. Header Row (100% Arabic) */}
        <div className="bulletin-classic-header">
          <div className="header-right" style={{lineHeight: 1.3, textAlign: 'right'}}>
            <div style={{fontWeight: 'bold', fontSize: '0.85rem'}}>جمهورية كوت ديفوار</div>
            <div style={{fontSize: '0.75rem', margin: '2px 0'}}>وزارة التربية الوطنية والتعليم الأولي</div>
            <div style={{fontSize: '0.75rem', color: '#475569'}}>المديرية الإقليمية : {schoolInfo?.address || drenText || 'ديفو'}</div>
          </div>

          <div className="header-center">
            <div style={{fontSize: '1rem', fontWeight: 900, color: brandColor, marginBottom: '2px'}}>
              ! الله أكبر
            </div>
            <h2 style={{color: brandColor, margin: '2px 0', fontSize: '1.25rem', fontWeight: 900}}>
              {customTitle ? customTitle : 'كشف درجات الطلاب'}
            </h2>
            <h3 style={{margin: '2px 0', fontSize: '0.92rem', color: '#334155'}}>
              {getArabicPeriodName(period)}
            </h3>
          </div>

          <div className="header-left" style={{lineHeight: 1.3, textAlign: 'left'}}>
            <div style={{fontSize: '0.8rem', fontWeight: 'bold'}}>
              العام الدراسي : {toArDigits(schoolInfo?.academic_year || `${new Date().getFullYear()} - ${new Date().getFullYear() + 1}`)}
            </div>
            <div style={{fontSize: '0.75rem', margin: '2px 0', color: '#64748b'}}>
              تاريخ الإصدار : {toArDigits(getHijriDate())}
            </div>
          </div>
        </div>

        {/* 2. School Info Box (Arabic) */}
        <div className="bulletin-classic-school" style={{borderColor: brandColor}}>
          <div className="school-logo">
            <img 
              src={schoolInfo?.logo_url || '/logo-coran.jpg'} 
              alt="Logo" 
              style={{width: '75px', height: '75px', borderRadius: '50%', objectFit: 'contain'}} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg'; }}
            />
          </div>
          <div className="school-details">
            <div style={{display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '4px'}}>
              <p style={{margin: 0, fontSize: '1rem', fontWeight: 900, color: '#0f172a'}}>
                المؤسسة التعليمية : <strong>{schoolInfo?.school_name_ar || schoolInfo?.school_name || "مدرسة دار الأرقم"}</strong>
              </p>
            </div>
            <div style={{display: 'flex', gap: '30px', marginTop: '6px', fontSize: '0.82rem'}}>
              <p style={{margin: 0}}>العنوان : <strong>{schoolInfo?.address || drenText}</strong></p>
              <p style={{margin: 0}}>الهاتف : <strong>{toArDigits(schoolInfo?.phone || '-')}</strong></p>
            </div>
          </div>
          <div className="school-statut">
            {showPhoto && st.photo_url ? (
              <img src={st.photo_url} alt="Élève" style={{width: '55px', height: '65px', objectFit: 'cover', borderRadius: '4px', border: '1px solid #ccc'}} />
            ) : null}
            <div>
              <p>رمز المؤسسة : <strong>{toArDigits(schoolInfo?.code || (schoolInfo?.id ? String(schoolInfo.id).substring(0, 6) : '198192'))}</strong></p>
              <p>الصفة : <strong>{schoolStatut === 'Public' ? 'عمومي' : 'خاص'}</strong></p>
            </div>
          </div>
        </div>

        {/* 3. Student Profile Box (Arabic) */}
        <div className="bulletin-classic-student" style={{borderColor: brandColor}}>
          <div className="student-profile-header">
            <span className="student-fullname" style={{fontSize: '1.05rem', fontWeight: 900}}>
              اسم الطالب(ة) : {studentFullNameAr}
            </span>
            <span>الجنس : <strong>{st.gender === 'F' ? 'أنثى' : 'ذكر'}</strong></span>
            <span>معيد(ة) : <strong>{st.is_repeater ? 'نعم' : 'لا'}</strong></span>
            <span>الصفة : <strong>{st.is_assigned !== undefined ? (st.is_assigned ? 'نظامي' : 'حر') : 'نظامي'}</strong></span>
          </div>
          <div className="student-profile-grid">
            <div>الرقم المدرسي : <strong>{toArDigits(st.matricule || st.id.substring(0,8))}</strong></div>
            <div>تاريخ الميلاد : <strong>{st.birth_date ? toArDigits(new Date(st.birth_date).toLocaleDateString('fr-FR')) : '-'}</strong></div>
            <div>مكان الميلاد : <strong>{st.birth_place || '-'}</strong></div>
            <div>القسم / الصف : <strong>{classData?.name || '-'}</strong></div>
            <div>عدد طلاب القسم : <strong>{toArDigits(students.length)}</strong></div>
            <div>الجنسية : <strong>{st.nationality ? translateBulletinWord(st.nationality) : 'إيفوارية'}</strong></div>
          </div>
        </div>

        {/* 4. Grades Table (100% Arabic) */}
        <table className="bulletin-classic-table">
          <thead>
            <tr style={{backgroundColor: '#f8fafc'}}>
              <th style={{width: '28%', textAlign: 'right', padding: '6px 8px'}}>المواد الدراسية</th>
              <th style={{width: '8%', textAlign: 'center'}}>المعدل</th>
              <th style={{width: '6%', textAlign: 'center'}}>المعامل</th>
              <th style={{width: '9%', textAlign: 'center'}}>المجموع</th>
              {showRank && <th style={{width: '7%', textAlign: 'center'}}>الترتيب</th>}
              <th style={{width: '18%', textAlign: 'right', paddingRight: '8px'}}>التقدير والملاحظات</th>
              {showTeacherNames && <th style={{width: '14%', textAlign: 'center'}}>اسم الأستاذ</th>}
              <th style={{width: '10%', textAlign: 'center'}}>التوقيع</th>
            </tr>
          </thead>
          <tbody>
            {renderArabicGroup('التعليم العربي والإسلامي', groupeIslamique, '#dcfce7')}
            {renderArabicGroup('التعليم العام والمواد الأساسية', groupeGeneral, '#e0f2fe')}
            {renderArabicGroup('مواد أخرى والأنشطة', groupeAutres, '#f1f5f9')}
            
            <tr className="bulletin-classic-totaux">
              <td colSpan={2} style={{fontWeight: 'bold', padding: '6px 8px', textAlign: 'right'}}>
                <span>المجموع العام</span>
              </td>
              <td style={{fontWeight: 'bold', textAlign: 'center'}}>{toArDigits(stats.totalSubjectCoefs)}</td>
              <td style={{fontWeight: 'bold', textAlign: 'center'}}>{toArDigits(formatNum(stats.totalWeightedScore, 1))}</td>
              <td colSpan={(showRank ? 1 : 0) + 1 + (showTeacherNames ? 1 : 0) + 1}></td>
            </tr>
          </tbody>
        </table>

        {/* 5. Averages & Ranks Box (Arabic 3-Column) */}
        <table className="bulletin-classic-table bulletin-classic-bottom-table">
          <tbody>
            <tr>
              {/* Right Column: Trimestres */}
              <td style={{width: '38%', verticalAlign: 'top', padding: 0}}>
                <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                  <thead>
                    <tr>
                      <th style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', width: '33%', textAlign: 'center', padding: '3px'}}>الفترة ١ (ف ١)</th>
                      <th style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', width: '33%', textAlign: 'center', padding: '3px'}}>الفترة ٢ (ف ٢)</th>
                      <th style={{border: 'none', borderBottom: '1px solid black', width: '34%', textAlign: 'center', padding: '3px'}}>الفترة ٣ (ف ٣)</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        المعدل : <strong>{period === '1er Trimestre' ? toArDigits(formatNum(stats.generalAverage, 2)) : '-'}</strong>
                      </td>
                      <td style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        المعدل : <strong>{period === '2ème Trimestre' ? toArDigits(formatNum(stats.generalAverage, 2)) : '-'}</strong>
                      </td>
                      <td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '4px'}}>
                        المعدل : <strong>{period === '3ème Trimestre' ? toArDigits(formatNum(stats.generalAverage, 2)) : '-'}</strong>
                      </td>
                    </tr>
                    {showRank && (
                      <tr>
                        <td style={{border: 'none', borderLeft: '1px solid black', textAlign: 'center', padding: '4px'}}>
                          الترتيب : <strong>{period === '1er Trimestre' ? toArDigits(stats.rank) : '-'}</strong>
                        </td>
                        <td style={{border: 'none', borderLeft: '1px solid black', textAlign: 'center', padding: '4px'}}>
                          الترتيب : <strong>{period === '2ème Trimestre' ? toArDigits(stats.rank) : '-'}</strong>
                        </td>
                        <td style={{border: 'none', textAlign: 'center', padding: '4px'}}>
                          الترتيب : <strong>{period === '3ème Trimestre' ? toArDigits(stats.rank) : '-'}</strong>
                        </td>
                      </tr>
                    )}
                  </tbody>
                </table>
              </td>

              {/* Center Column: General Average */}
              <td style={{width: '32%', textAlign: 'center', verticalAlign: 'middle', borderRight: '2px solid black', borderLeft: '2px solid black', padding: '6px', backgroundColor: '#f8fafc'}}>
                <p style={{fontWeight: 'bold', marginBottom: '2px', fontSize: '0.85rem'}}>
                  المعدل الدوري العام
                </p>
                <p style={{fontSize: '1.5rem', fontWeight: 'bold', margin: '3px 0', color: brandColor}}>
                  {toArDigits(formatNum(stats.generalAverage, 2))} / ٢٠
                </p>
                {showRank && (
                  <p style={{margin: 0, fontSize: '0.85rem'}}>
                    الترتيب : <strong style={{fontSize: '1.15rem'}}>{toArDigits(stats.rank)}</strong>
                  </p>
                )}
                <div style={{marginTop: '4px', fontSize: '0.82rem', fontWeight: 'bold', color: '#15803d'}}>
                  {getArabicAppreciation(stats.generalAverage)}
                </div>
              </td>

              {/* Left Column: Class Stats */}
              <td style={{width: '30%', verticalAlign: 'top', padding: 0}}>
                {showClassStats ? (
                  <table style={{width: '100%', height: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.78rem'}}>
                    <thead>
                      <tr>
                        <th colSpan={2} style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '3px'}}>
                          نتائج القسم
                        </th>
                      </tr>
                    </thead>
                    <tbody>
                      <tr>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', padding: '3px 6px', textAlign: 'right'}}>معدل القسم</td>
                        <td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', fontWeight: 'bold'}}>{toArDigits(formatNum(classAvg, 2))}</td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', borderBottom: '1px solid black', borderLeft: '1px solid black', padding: '3px 6px', textAlign: 'right'}}>أدنى درجة</td>
                        <td style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center'}}>{toArDigits(formatNum(classMin, 2))}</td>
                      </tr>
                      <tr>
                        <td style={{border: 'none', borderLeft: '1px solid black', padding: '3px 6px', textAlign: 'right'}}>أعلى درجة</td>
                        <td style={{border: 'none', textAlign: 'center'}}>{toArDigits(formatNum(classMax, 2))}</td>
                      </tr>
                    </tbody>
                  </table>
                ) : (
                  <div style={{padding: '10px', textAlign: 'center', fontSize: '0.8rem', color: '#64748b'}}>الإحصائيات محجوبة</div>
                )}
              </td>
            </tr>
          </tbody>
        </table>

        {/* 6. Signatures & Honors Box (Arabic) */}
        {showSignatures && (
          <table className="bulletin-classic-table bulletin-classic-bottom-table" style={{borderTop: 'none'}}>
            <tbody>
              <tr>
                {/* Honors */}
                <td style={{width: '34%', verticalAlign: 'top', padding: 0}}>
                  {showHonorRoll ? (
                    <table style={{width: '100%', borderCollapse: 'collapse', border: 'none', fontSize: '0.72rem'}}>
                      <thead>
                        <tr>
                          <th style={{border: 'none', borderBottom: '1px solid black', textAlign: 'center', padding: '2px'}}>
                            لوحة الشرف والتشريفات
                          </th>
                        </tr>
                      </thead>
                      <tbody>
                        <tr style={{backgroundColor: stats.generalAverage >= 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', textAlign: 'right'}}>
                            لوحة الشرف + تهنئة {stats.generalAverage >= 16 ? '⭐' : ''}
                          </td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 12 && stats.generalAverage < 14 ? '#dcfce7' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', textAlign: 'right'}}>
                            لوحة الشرف + تشجيع
                          </td>
                        </tr>
                        <tr style={{backgroundColor: stats.generalAverage >= 10 && stats.generalAverage < 12 ? '#f1f5f9' : 'transparent'}}>
                          <td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', textAlign: 'right'}}>
                            لوحة الشرف
                          </td>
                        </tr>
                        <tr><td style={{border: 'none', borderBottom: '1px solid black', padding: '2px 6px', fontWeight: 'bold', backgroundColor: '#f8fafc', textAlign: 'right'}}>تأشير وتوقيع الولي</td></tr>
                        <tr><td style={{border: 'none', height: '24px', padding: '2px 6px'}}></td></tr>
                      </tbody>
                    </table>
                  ) : (
                    <div style={{padding: '12px', fontSize: '0.75rem', color: '#64748b', textAlign: 'center'}}>التقدير العام : <strong>{getArabicAppreciation(stats.generalAverage)}</strong></div>
                  )}
                </td>

                {/* Teachers Appreciations */}
                <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '6px', borderRight: '2px solid black', borderLeft: '2px solid black'}}>
                  <p style={{fontWeight: 'bold', textDecoration: 'underline', marginBottom: '6px', fontSize: '0.82rem'}}>
                    تقدير المدرسين وقرار المجلس
                  </p>
                  <p style={{marginBottom: '6px', fontSize: '0.8rem'}}>ناجح(ة) إلى المستوى الأعلى</p>
                  <p style={{fontSize: '0.75rem', fontStyle: 'italic', color: '#64748b', marginBottom: '20px'}}>ملاحظات وتوجيهات الأستاذ</p>
                  <p style={{fontWeight: 'bold', fontSize: '0.8rem', margin: 0}}>الأستاذ الرئيسي</p>
                </td>

                {/* Direction & Stamp */}
                <td style={{width: '33%', textAlign: 'center', verticalAlign: 'top', padding: '6px', position: 'relative'}}>
                  <div style={{display: 'flex', flexDirection: 'column', height: '100%', justifyContent: 'space-between'}}>
                    <div>
                      <p style={{fontWeight: 'bold', fontSize: '0.82rem', margin: '0 0 2px 0'}}>
                        تأشير وختم مدير المؤسسة
                      </p>
                    </div>
                    
                    <div style={{margin: '6px 0', fontSize: '0.75rem'}}>
                      <p style={{margin: 0}}>حرر في {schoolInfo?.city || drenText || 'ديفو'} بتاريخ :</p>
                      <p style={{margin: '2px 0 0 0', fontWeight: 'bold'}}>{toArDigits(getHijriDate())}</p>
                    </div>

                    {stampUrl && (
                      <div style={{margin: '4px 0'}}>
                        <img src={stampUrl} alt="Cachet" style={{maxHeight: '45px', maxWidth: '100px', objectFit: 'contain', opacity: 0.85}} />
                      </div>
                    )}

                    <div>
                      <p style={{fontSize: '0.82rem', fontWeight: 'bold', marginTop: stampUrl ? '2px' : '15px'}}>
                        {schoolInfo?.principal_name || schoolInfo?.studies_director_name || 'إدارة المؤسسة'}
                      </p>
                    </div>
                  </div>
                </td>
              </tr>
            </tbody>
          </table>
        )}
      </div>
    );
  };

  // ----------------------------------------------------
  // TEMPLATE 4: MODÈLE PRIMAIRE & COMPÉTENCES
  // ----------------------------------------------------
  const renderPrimary = (st: any) => {
    const stats = studentStats[st.id];

    return (
      <div key={st.id} className="bulletin-primary-page" dir={isAr ? "rtl" : "ltr"}>
        {/* Playful Header */}
        <div style={{backgroundColor: `${brandColor}12`, border: `2px dashed ${brandColor}`, borderRadius: '16px', padding: '12px 18px', marginBottom: '12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '14px'}}>
            <img 
              src={schoolInfo?.logo_url || '/logo-coran.jpg'} 
              alt="Logo" 
              style={{width: '60px', height: '60px', borderRadius: '50%', objectFit: 'contain', border: `2px solid ${brandColor}`}} 
              onError={(e) => { (e.currentTarget as HTMLImageElement).src = '/logo-coran.jpg'; }}
            />
            <div>
              <h2 style={{margin: 0, fontSize: '1.2rem', color: brandColor, fontWeight: 800}}>
                {schoolInfo?.school_name || "ÉCOLE PRIMAIRE"}
              </h2>
              <p style={{margin: '2px 0 0 0', fontSize: '0.85rem', color: '#475569'}}>
                🎒 Carnet d'Évaluation & de Réussite • <strong>{period}</strong>
              </p>
            </div>
          </div>
          <div style={{textAlign: 'center', backgroundColor: 'white', padding: '6px 14px', borderRadius: '12px', boxShadow: '0 2px 4px rgba(0,0,0,0.05)'}}>
            <div style={{fontSize: '0.75rem', color: '#64748b'}}>Année Scolaire</div>
            <div style={{fontSize: '0.9rem', fontWeight: 800, color: brandColor}}>{schoolInfo?.academic_year || '2025-2026'}</div>
          </div>
        </div>

        {/* Student Banner */}
        <div style={{display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: '10px 16px', backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '12px', marginBottom: '12px'}}>
          <div style={{display: 'flex', alignItems: 'center', gap: '12px'}}>
            {showPhoto && st.photo_url ? (
              <img src={st.photo_url} alt="Photo" style={{width: '45px', height: '45px', borderRadius: '50%', objectFit: 'cover', border: '2px solid #cbd5e1'}} />
            ) : (
              <span style={{fontSize: '2rem'}}>🎓</span>
            )}
            <div>
              <div style={{fontSize: '1.05rem', fontWeight: 800, color: '#1e293b'}}>
                {st.first_name?.toUpperCase()} {st.last_name?.toUpperCase()}
              </div>
              <div style={{fontSize: '0.8rem', color: '#64748b'}}>Classe de : <strong>{classData?.name || 'CP/CE1/CM2'}</strong></div>
            </div>
          </div>
          <div style={{textAlign: 'center', backgroundColor: '#f0fdf4', padding: '6px 16px', borderRadius: '10px', border: '1px solid #bbf7d0'}}>
            <div style={{fontSize: '0.72rem', color: '#166534', fontWeight: 700}}>BILAN GÉNÉRAL</div>
            <div style={{fontSize: '1.25rem', fontWeight: 900, color: '#15803d'}}>{formatNum(stats.generalAverage, 2)} /20</div>
          </div>
        </div>

        {/* Primary Competencies Grid */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '10px', marginBottom: '12px'}}>
          {subjects.filter(s => stats.subjects[s] !== undefined).map(s => {
            const val = stats.subjects[s];
            const maxScore = subjectMaxScores[s] || 20;
            const note20 = (val / maxScore) * 20;

            const isAcquired = note20 >= 12;
            const isInProgress = note20 >= 8 && note20 < 12;

            return (
              <div key={s} style={{backgroundColor: 'white', border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px 12px', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
                <div>
                  <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#1e293b'}}>{translateBulletinWord(s)}</div>
                  <div style={{fontSize: '0.75rem', color: '#64748b'}}>{getAppreciation(val, maxScore)}</div>
                </div>
                <div style={{textAlign: 'right'}}>
                  <div style={{fontWeight: 800, fontSize: '1rem', color: isAcquired ? '#15803d' : isInProgress ? '#d97706' : '#dc2626'}}>
                    {formatNum(val, 1)} <span style={{fontSize: '0.75rem', color: '#94a3b8'}}>/ {maxScore}</span>
                  </div>
                  <div style={{fontSize: '0.7rem', fontWeight: 700, color: isAcquired ? '#16a34a' : isInProgress ? '#ca8a04' : '#dc2626'}}>
                    {isAcquired ? '✅ Acquis' : isInProgress ? '🔄 En cours' : '⚠️ À renforcer'}
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Teacher Note & Encouragements */}
        <div style={{backgroundColor: '#fefce8', border: '1px solid #fef08a', borderRadius: '12px', padding: '12px 16px', marginBottom: '12px'}}>
          <div style={{fontWeight: 700, fontSize: '0.85rem', color: '#854d0e', marginBottom: '4px'}}>
            🌟 Mot et Conseils de l'Enseignant(e) :
          </div>
          <p style={{margin: 0, fontSize: '0.82rem', color: '#713f12', fontStyle: 'italic'}}>
            {stats.generalAverage >= 14 
              ? "Excellent trimestre ! Félicitations pour tes efforts réguliers, ton sérieux et ta participation active." 
              : stats.generalAverage >= 10 
              ? "Des résultats satisfaisants. Poursuis tes efforts avec confiance et régularité au prochain trimestre !"
              : "Des difficultés constatées ce trimestre. Un travail plus régulier à la maison et plus d'attention en classe permettront de bien progresser."}
          </p>
        </div>

        {/* Primary Signatures */}
        <div style={{display: 'grid', gridTemplateColumns: 'repeat(2, 1fr)', gap: '12px', textAlign: 'center', fontSize: '0.78rem'}}>
          <div style={{border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', backgroundColor: 'white'}}>
            <div style={{fontWeight: 700, color: '#475569'}}>Signature de l'Enseignant(e)</div>
            <div style={{marginTop: '20px', fontStyle: 'italic', color: '#64748b'}}>Vu et approuvé</div>
          </div>
          <div style={{border: '1px solid #e2e8f0', borderRadius: '10px', padding: '8px', backgroundColor: 'white', position: 'relative'}}>
            <div style={{fontWeight: 700, color: '#475569'}}>Le Directeur / La Directrice</div>
            {stampUrl && (
              <img src={stampUrl} alt="Cachet" style={{maxHeight: '30px', maxWidth: '70px', objectFit: 'contain', margin: '2px 0'}} />
            )}
            <div style={{marginTop: stampUrl ? '0' : '20px', fontWeight: 600}}>
              {schoolInfo?.principal_name || 'La Direction'}
            </div>
          </div>
        </div>
      </div>
    );
  };

  return (
    <div className="bulletins-container">
      {filteredStudents.map((st, idx) => {
        if (template === 'modern') return renderModern(st);
        if (template === 'compact') return renderCompact(st, idx);
        if (template === 'primary') return renderPrimary(st);
        return renderClassic(st);
      })}
    </div>
  );
};
