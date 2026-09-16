/**
 * Utilitaire de tri alphabétique des élèves
 * Trie selon l'ordre alphabétique exact du nom complet affiché (A → Z)
 */

export interface StudentLike {
  id?: string;
  first_name?: string | null;
  last_name?: string | null;
  matricule?: string | null;
  [key: string]: any;
}

export const getStudentFullName = (s: StudentLike): string => {
  if (!s) return '';
  const fn = (s.first_name || '').trim();
  const ln = (s.last_name || '').trim();
  if (fn && ln) return `${fn} ${ln}`;
  return fn || ln || '';
};

export const compareStudentsAlphabetically = (
  a: StudentLike,
  b: StudentLike,
  direction: 'asc' | 'desc' = 'asc'
): number => {
  const nameA = getStudentFullName(a);
  const nameB = getStudentFullName(b);

  let diff = nameA.localeCompare(nameB, 'fr', { sensitivity: 'base' });
  if (diff === 0) {
    const matA = (a.matricule || '').trim();
    const matB = (b.matricule || '').trim();
    diff = matA.localeCompare(matB, 'fr', { sensitivity: 'base' });
  }

  return direction === 'desc' ? -diff : diff;
};

export const sortStudentsList = <T extends StudentLike>(
  students: T[],
  direction: 'asc' | 'desc' = 'asc'
): T[] => {
  if (!Array.isArray(students)) return [];
  return [...students].sort((a, b) => compareStudentsAlphabetically(a, b, direction));
};
