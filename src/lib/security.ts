import DOMPurify from 'dompurify';

/**
 * Moteur de Sécurité & Nettoyage des Entrées (Anti-XSS & Anti-Injection SQL)
 */

/**
 * Nettoie une chaîne de caractères contre les attaques XSS et les injections de balises HTML/Scripts.
 */
export function sanitizeText(input: unknown): string {
  if (input === null || input === undefined) return '';
  if (typeof input !== 'string') {
    return String(input);
  }

  // 1. Suppression des caractères nuls et caractères de contrôle dangereux
  let cleaned = input.replace(/\0/g, '').replace(/[\u0000-\u0008\u000B\u000C\u000E-\u001F\u007F-\u009F]/g, '');

  // 2. Nettoyage DOMPurify strict (aucune balise HTML autorisée pour les champs standards)
  cleaned = DOMPurify.sanitize(cleaned, {
    ALLOWED_TAGS: [],
    ALLOWED_ATTR: [],
    KEEP_CONTENT: true,
  });

  // 3. Suppression des patterns de script résiduels ou injections
  cleaned = cleaned
    .replace(/javascript\s*:/gi, '')
    .replace(/data\s*:\s*text\/html/gi, '')
    .replace(/vbscript\s*:/gi, '')
    .replace(/onload\s*=/gi, '')
    .replace(/onerror\s*=/gi, '')
    .replace(/onclick\s*=/gi, '');

  return cleaned.trim();
}

/**
 * Nettoie du contenu HTML enrichi (si des balises de mise en forme sont autorisées)
 */
export function sanitizeHtml(htmlContent: string): string {
  if (!htmlContent) return '';
  return DOMPurify.sanitize(htmlContent, {
    ALLOWED_TAGS: ['b', 'i', 'em', 'strong', 'a', 'p', 'br', 'ul', 'ol', 'li', 'span', 'h1', 'h2', 'h3', 'h4', 'h5', 'h6'],
    ALLOWED_ATTR: ['href', 'target', 'rel', 'class', 'style'],
    FORBID_TAGS: ['script', 'iframe', 'object', 'embed', 'form', 'svg'],
    FORBID_ATTR: ['onerror', 'onload', 'onclick', 'onmouseover', 'onfocus', 'onblur'],
  });
}

/**
 * Nettoie une chaîne pour les requêtes de recherche (évite les injections de wildcards % et _ ou caractères PostgREST)
 */
export function sanitizeSearchQuery(query: string): string {
  if (!query) return '';
  const clean = sanitizeText(query);
  // Échappe les caractères spéciaux SQL / PostgREST
  return clean.replace(/[%_\\]/g, '\\$&').slice(0, 100); // Limite la longueur max de recherche
}

/**
 * Valide et nettoie un montant ou un nombre positif
 */
export function sanitizeAmount(val: unknown, min = 0, max = 1000000000): number {
  const num = typeof val === 'number' ? val : parseFloat(String(val).replace(/[^0-9.-]+/g, ''));
  if (isNaN(num) || !isFinite(num)) return min;
  return Math.max(min, Math.min(max, Math.round(num * 100) / 100));
}

/**
 * Valide une adresse email
 */
export function isValidEmail(email: string): boolean {
  if (!email || typeof email !== 'string') return false;
  const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
  return emailRegex.test(email.trim()) && email.length <= 254;
}

/**
 * Valide un numéro de téléphone international ou local
 */
export function isValidPhone(phone: string): boolean {
  if (!phone || typeof phone !== 'string') return false;
  const cleanPhone = phone.replace(/[\s\-\.\(\)]/g, '');
  const phoneRegex = /^\+?[0-9]{8,15}$/;
  return phoneRegex.test(cleanPhone);
}

/**
 * Nettoie et valide un matricule scolaire (uniquement alphanumérique + tirets)
 */
export function sanitizeMatricule(matricule: string): string {
  if (!matricule) return '';
  return sanitizeText(matricule).replace(/[^a-zA-Z0-9\-_]/g, '').toUpperCase().slice(0, 50);
}

/**
 * Nettoie récursivement un objet de données (ex: payload formulaire avant envoi Supabase)
 * Protège également contre la pollution de prototype (__proto__, constructor).
 */
export function sanitizeObject<T>(obj: T): T {
  if (obj === null || obj === undefined) return obj;

  if (typeof obj === 'string') {
    return sanitizeText(obj) as unknown as T;
  }

  if (typeof obj === 'number') {
    if (isNaN(obj) || !isFinite(obj)) return 0 as unknown as T;
    return obj;
  }

  if (typeof obj === 'boolean') {
    return obj;
  }

  if (Array.isArray(obj)) {
    return obj.map(item => sanitizeObject(item)) as unknown as T;
  }

  if (typeof obj === 'object') {
    const sanitizedObj: Record<string, any> = {};
    for (const key of Object.keys(obj)) {
      // Protection anti Prototype Pollution
      if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
        continue;
      }
      sanitizedObj[key] = sanitizeObject((obj as any)[key]);
    }
    return sanitizedObj as T;
  }

  return obj;
}

/**
 * Nettoie systématiquement un objet FormData HTML avant traitement ou insertion en base
 */
export function sanitizeFormData(formData: FormData): Record<string, any> {
  const result: Record<string, any> = {};

  formData.forEach((value, key) => {
    // Protection anti Prototype Pollution
    if (key === '__proto__' || key === 'constructor' || key === 'prototype') {
      return;
    }

    if (typeof value === 'string') {
      // Traitement spécial selon le nom du champ
      const lowerKey = key.toLowerCase();
      if (lowerKey.includes('amount') || lowerKey.includes('fee') || lowerKey.includes('montant') || lowerKey.includes('price') || lowerKey.includes('salaire')) {
        result[key] = sanitizeAmount(value);
      } else if (lowerKey.includes('matricule')) {
        result[key] = sanitizeMatricule(value);
      } else if (lowerKey.includes('email')) {
        result[key] = sanitizeText(value).toLowerCase();
      } else {
        result[key] = sanitizeText(value);
      }
    } else {
      result[key] = value;
    }
  });

  return result;
}
