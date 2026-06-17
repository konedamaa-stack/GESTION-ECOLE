const fs = require('fs');

let content = fs.readFileSync('src/components/TeacherPortal.tsx', 'utf8');

const targetSelect = `{evaluationsData.map(ev => (
                    <option key={ev.id} value={ev.id}>{ev.name} ({ev.classes?.name} - {new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')})</option>
                  ))}`;

const replacementSelect = `{(() => {
                    const pendingEvals = evaluationsData.filter(ev => {
                      const classStudents = studentsData.filter(s => s.class_id === ev.class_id);
                      const gradesForEv = gradesData.filter(g => g.evaluation_id === ev.id);
                      return classStudents.length === 0 || gradesForEv.length < classStudents.length;
                    });
                    const completedEvals = evaluationsData.filter(ev => !pendingEvals.includes(ev));
                    
                    return (
                      <>
                        <optgroup label={t('teacher.pending_evals', "À noter")}>
                          {pendingEvals.map(ev => (
                            <option key={ev.id} value={ev.id}>{ev.name} ({ev.classes?.name} - {new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')})</option>
                          ))}
                        </optgroup>
                        {completedEvals.length > 0 && (
                          <optgroup label={t('teacher.completed_evals', "Déjà notés")}>
                            {completedEvals.map(ev => (
                              <option key={ev.id} value={ev.id}>{ev.name} ({ev.classes?.name} - {new Date(ev.date).toLocaleDateString(i18n.language === 'ar' ? 'ar-EG' : 'fr-FR')})</option>
                            ))}
                          </optgroup>
                        )}
                      </>
                    );
                  })()}`;

if (content.includes(targetSelect)) {
  content = content.replace(targetSelect, replacementSelect);
}

fs.writeFileSync('src/components/TeacherPortal.tsx', content);
console.log('Patch complete');
