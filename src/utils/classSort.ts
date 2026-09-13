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

  // 1. Maternelle / التحضيري / روضة الأطفال / Crèche / Petite/Moyenne/Grande section
  if (
    n.includes('تحضيري') ||
    n.includes('روضة') ||
    n.includes('روض') ||
    n.includes('اطفال') ||
    n.includes('أطفال') ||
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

  // 2. Cycles en arabe explicites (الابتدائي / المتوسط أو الإعدادي / الثانوي)
  // Primaire en arabe : الابتدائي
  if (n.includes('ابتدائي') || n.includes('إبتدائي') || n.includes('ابتدائ')) {
    if (n.includes('اول') || n.includes('أول') || n.includes('1')) return 20;
    if (n.includes('ثاني') || n.includes('ثان') || n.includes('2')) return 22;
    if (n.includes('ثالث') || n.includes('3')) return 24;
    if (n.includes('رابع') || n.includes('4')) return 26;
    if (n.includes('خامس') || n.includes('5')) return 28;
    if (n.includes('سادس') || n.includes('6')) return 30;
    return 20;
  }

  // Collège / Moyen en arabe : المتوسط / الإعدادي
  if (n.includes('متوسط') || n.includes('إعدادي') || n.includes('اعدادي') || n.includes('اعداد')) {
    if (n.includes('اول') || n.includes('أول') || n.includes('1')) {
      if (n.includes('أ') || n.includes(' أ') || n.includes('a')) return 40;
      if (n.includes('ب') || n.includes(' ب') || n.includes('b')) return 41;
      if (n.includes('ج') || n.includes(' ج') || n.includes('c')) return 42;
      return 40;
    }
    if (n.includes('ثاني') || n.includes('ثان') || n.includes('2')) return 44;
    if (n.includes('ثالث') || n.includes('3')) return 46;
    if (n.includes('رابع') || n.includes('4')) return 48;
    return 40;
  }

  // Lycée / Secondaire en arabe : الثانوي
  if (n.includes('ثانوي') || n.includes('ثانوية')) {
    if (n.includes('اول') || n.includes('أول') || n.includes('1') || n.includes('عاشر')) return 60;
    if (n.includes('ثاني') || n.includes('ثان') || n.includes('2') || n.includes('حادي')) return 62;
    if (n.includes('ثالث') || n.includes('3') || n.includes('ثاني عشر') || n.includes('بكالوريا')) return 64;
    return 60;
  }

  // 3. Primaire en français / CI, CP, CE, CM
  if (
    n.includes('ci') ||
    n.includes('cp1') ||
    (n.includes('cp') && !n.includes('cp2'))
  ) {
    return 20;
  }
  if (n.includes('cp2')) {
    return 22;
  }
  if (n.includes('ce1')) {
    return 24;
  }
  if (n.includes('ce2')) {
    return 26;
  }
  if (n.includes('cm1')) {
    return 28;
  }
  if (n.includes('cm2')) {
    return 30;
  }

  // 4. Collège en français / 6ème, 5ème, 4ème, 3ème
  if (n.includes('6è') || n.includes('6e') || n.includes('6eme') || n.includes('6ème')) {
    return 40;
  }
  if (n.includes('5è') || n.includes('5e') || n.includes('5eme') || n.includes('5ème')) {
    return 44;
  }
  if (n.includes('4è') || n.includes('4e') || n.includes('4eme') || n.includes('4ème')) {
    return 46;
  }
  if (n.includes('3è') || n.includes('3e') || n.includes('3eme') || n.includes('3ème')) {
    return 48;
  }

  // 5. Lycée en français / 2nde, 1ère, Terminale
  if (n.includes('2nd') || n.includes('2nde') || n.includes('seconde')) {
    return 60;
  }
  if (n.includes('1er') || n.includes('1ère') || n.includes('1ere') || n.includes('premiere')) {
    return 62;
  }
  if (n.includes('tle') || n.includes('term') || n.includes('terminale')) {
    return 64;
  }

  // 6. Détection générique par niveau
  if (l === 'primaire') return 25;
  if (l === 'collège' || l === 'college') return 45;
  if (l === 'lycée' || l === 'lycee') return 63;

  // 7. Mots-clés ordinaux génériques sans cycle spécifié
  if (n.includes('اول') || n.includes('أول')) return 20;
  if (n.includes('ثاني') || n.includes('ثان')) return 22;
  if (n.includes('ثالث')) return 24;
  if (n.includes('رابع')) return 26;
  if (n.includes('خامس')) return 28;
  if (n.includes('سادس')) return 30;

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
