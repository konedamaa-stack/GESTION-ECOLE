/**
 * Formate un numéro de téléphone avec les chiffres séparés deux à deux : XX XX XX XX XX
 * Gère les indicatifs pays (+225, +223, etc.), les séparateurs multiples (/, ;, ,),
 * et nettoie les formats existants pour garantir une présentation homogène.
 */
export const formatPhoneNumber = (phone: string | number | null | undefined): string => {
  if (!phone) return '-';
  const str = String(phone).trim();
  if (!str || str === '-') return '-';

  // Gestion des numéros multiples séparés par '/', ';', ou ','
  if (str.includes('/') || str.includes(';') || (str.includes(',') && !str.match(/^\+?\d+$/))) {
    const parts = str.split(/[/;,]/);
    const formatted = parts
      .map(p => formatPhoneNumber(p.trim()))
      .filter(p => p && p !== '-');
    return formatted.length > 0 ? formatted.join(' / ') : '-';
  }

  // Nettoyage des préfixes textuels éventuels (Tel:, Cel:, etc.)
  let cleaned = str.replace(/^(cel|tel|tél|téléphone|phone)[:.\s]+/i, '').trim();
  if (!cleaned) return '-';

  // Détection éventuelle de l'indicatif international (+225, +223, 00225, etc.)
  let prefix = '';
  let rest = cleaned;
  const matchPlus = cleaned.match(/^(\+\d{1,4}|00\d{1,4})\s*(.*)$/);
  if (matchPlus) {
    prefix = matchPlus[1] + ' ';
    rest = matchPlus[2];
  }

  // Extraction des chiffres du corps du numéro
  const digits = rest.replace(/\D/g, '');
  if (!digits) return cleaned;

  // Découpage en groupes de 2 chiffres (XX XX XX XX XX)
  const chunks = digits.match(/.{1,2}/g);
  if (chunks) {
    return (prefix + chunks.join(' ')).trim();
  }

  return cleaned;
};
