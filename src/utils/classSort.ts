/**
 * Utilitaire de tri pédagogique des classes
 * Gère l'ordre d'affichage (display_order), ainsi que la hiérarchie standard
 * en arabe (التحضيري، الأول، الثاني...) et en français (Maternelle, CP, CE, CM, Collège, Lycée).
 */

export interface ClassLike {
  id?: string;
  name?: string;
  level?: string;
  display_order?: number | null;
  [key: string]: any;
}

export const getPedagogicalRank = (name?: string, level?: string): number => {
  const n = (name || '').toLowerCase().trim();
  const l = (level || '').toLowerCase().trim();

  // 1. Maternelle / التحضيري / Crèche / Petite/Moyenne/Grande section
  if (
    n.includes('تحضيري') ||
    n.includes('روضة') ||
    n.includes('روض') ||
    n.includes('maternelle') ||
    n.includes('garderie') ||
    n.includes('crèche') ||
    n.includes('creche') ||
    n.includes('ps') ||
    n.includes('ms') ||
    n.includes('gs') ||
    l === 'maternelle'
  ) {
    if (n.includes('1') || n.includes('ps') || n.includes('petite')) return 5;
    if (n.includes('2') || n.includes('ms') || n.includes('moyenne')) return 7;
    if (n.includes('3') || n.includes('gs') || n.includes('grande')) return 9;
    return 10;
  }

  // 2. Primaire / الإبتدائي
  // Premier / الأول / الاول / CI / CP1 / CP
  if (
    n.includes('اول') ||
    n.includes('أول') ||
    n.includes('ci') ||
    n.includes('cp1') ||
    (n.includes('cp') && !n.includes('cp2'))
  ) {
    return 20;
  }

  // Deuxième / الثاني / CP2
  if (n.includes('ثاني') || n.includes('ثان') || n.includes('cp2')) {
    return 30;
  }

  // Troisième / الثالث / CE1
  if (n.includes('ثالث') || n.includes('ce1')) {
    return 40;
  }

  // Quatrième / الرابع / CE2
  if (n.includes('رابع') || n.includes('ce2')) {
    return 50;
  }

  // Cinquième / الخامس / CM1
  if (n.includes('خامس') || n.includes('cm1')) {
    return 60;
  }

  // Sixième Primaire / السادس الابتدائي / CM2
  if (
    (n.includes('سادس') && (n.includes('ابتدائي') || n.includes('إبتدائي') || l === 'primaire')) ||
    n.includes('cm2')
  ) {
    return 70;
  }

  // 3. Collège / إعدادي / متوسط
  // 6ème / السادس إعدادي
  if (
    n.includes('6è') ||
    n.includes('6e') ||
    n.includes('6eme') ||
    n.includes('6ème') ||
    (n.includes('سادس') && (n.includes('إعدادي') || n.includes('اعدادي') || n.includes('متوسط') || l === 'collège'))
  ) {
    return 80;
  }

  // 5ème / الخامس إعدادي
  if (
    n.includes('5è') ||
    n.includes('5e') ||
    n.includes('5eme') ||
    n.includes('5ème') ||
    (n.includes('خامس') && (n.includes('إعدادي') || n.includes('اعدادي') || n.includes('متوسط')))
  ) {
    return 90;
  }

  // 4ème / الرابع إعدادي
  if (
    n.includes('4è') ||
    n.includes('4e') ||
    n.includes('4eme') ||
    n.includes('4ème') ||
    (n.includes('رابع') && (n.includes('إعدادي') || n.includes('اعدادي') || n.includes('متوسط')))
  ) {
    return 100;
  }

  // 3ème / الثالث إعدادي
  if (
    n.includes('3è') ||
    n.includes('3e') ||
    n.includes('3eme') ||
    n.includes('3ème') ||
    (n.includes('ثالث') && (n.includes('إعدادي') || n.includes('اعدادي') || n.includes('متوسط')))
  ) {
    return 110;
  }

  // 4. Lycée / ثانوي
  // 2nde / Seconde / العاشر
  if (n.includes('2nd') || n.includes('2nde') || n.includes('seconde') || n.includes('عاشر')) {
    return 120;
  }

  // 1ère / Première / الحادي عشر
  if (n.includes('1er') || n.includes('1ère') || n.includes('1ere') || n.includes('premiere') || n.includes('حادي عشر')) {
    return 130;
  }

  // Terminale / Tle / الثاني عشر / البكالوريا
  if (n.includes('tle') || n.includes('term') || n.includes('terminale') || n.includes('ثاني عشر') || n.includes('بكالوريا')) {
    return 140;
  }

  return 999;
};

export const sortClassesList = <T extends ClassLike>(classes: T[]): T[] => {
  if (!classes || !Array.isArray(classes)) return [];

  return [...classes].sort((a, b) => {
    const orderA = a.display_order !== undefined && a.display_order !== null && Number(a.display_order) > 0 ? Number(a.display_order) : 0;
    const orderB = b.display_order !== undefined && b.display_order !== null && Number(b.display_order) > 0 ? Number(b.display_order) : 0;

    // Si les deux ont un ordre d'affichage explicite distinct
    if (orderA > 0 && orderB > 0 && orderA !== orderB) {
      return orderA - orderB;
    }
    // Si l'un a un ordre et pas l'autre
    if (orderA > 0 && orderB === 0) return -1;
    if (orderB > 0 && orderA === 0) return 1;

    // Sinon, classement pédagogique naturel
    const rankA = getPedagogicalRank(a.name, a.level);
    const rankB = getPedagogicalRank(b.name, b.level);

    if (rankA !== rankB) {
      return rankA - rankB;
    }

    // Alphabétique en dernier recours
    return (a.name || '').localeCompare(b.name || '');
  });
};
