/**
 * Utility functions for Multi-tenant Subdomain management
 */

// Reserved subdomains that shouldn't be treated as school tenants
const RESERVED_SUBDOMAINS = new Set([
  'www',
  'app',
  'admin',
  'api',
  'dev',
  'staging',
  'test',
  'localhost',
  '127',
  '0',
  'mail',
  'ftp',
  'smtp',
  'dashboard',
  'portal',
  'etablissement',
]);

/**
 * Extracts the tenant subdomain from current hostname or location search params.
 */
export function getSubdomain(hostname: string = window.location.hostname, search: string = window.location.search): string | null {
  // 1. Check search params first (useful for dev testing like ?subdomain=saint-joseph)
  const urlParams = new URLSearchParams(search);
  const paramSubdomain = urlParams.get('subdomain') || urlParams.get('school_subdomain');
  if (paramSubdomain) {
    const cleanedParam = paramSubdomain.toLowerCase().trim();
    if (isValidSubdomain(cleanedParam) && !RESERVED_SUBDOMAINS.has(cleanedParam)) {
      return cleanedParam;
    }
  }

  // 2. Check hostname parts
  const parts = hostname.toLowerCase().trim().split('.');

  // If IP address or plain localhost without subdomain, return null
  if (/^(\d{1,3}\.){3}\d{1,3}$/.test(hostname) || hostname === 'localhost') {
    return null;
  }

  // Handle local development subdomains e.g. "school.localhost"
  if (parts.length === 2 && parts[1] === 'localhost') {
    const sub = parts[0];
    return RESERVED_SUBDOMAINS.has(sub) ? null : sub;
  }

  // Production domain e.g. "school.domain.com" or "school.app.domain.com"
  if (parts.length >= 3) {
    const sub = parts[0];
    if (RESERVED_SUBDOMAINS.has(sub)) {
      return null;
    }
    return sub;
  }

  return null;
}

/**
 * Validates whether a string is a valid subdomain slug.
 */
export function isValidSubdomain(subdomain: string): boolean {
  if (!subdomain || subdomain.length < 2 || subdomain.length > 63) {
    return false;
  }
  const regex = /^[a-z0-9]+(-[a-z0-9]+)*$/;
  return regex.test(subdomain);
}

/**
 * Converts a string (e.g. school name) to a valid subdomain slug.
 */
export function slugifySubdomain(text: string): string {
  if (!text) return '';
  
  let slug = text.toLowerCase();
  
  // Replace accents
  const from = 'àáâãäåèéêëìíîïòóôõöùúûüýÿñç';
  const to = 'aaaaaaeeeeiiiiooooouuuuync';
  for (let i = 0; i < from.length; i++) {
    slug = slug.replace(new RegExp(from[i], 'g'), to[i]);
  }

  // Replace non-alphanumeric with hyphen
  slug = slug.replace(/[^a-z0-9]+/g, '-');
  
  // Trim hyphens
  slug = slug.replace(/^-+|-+$/g, '');

  return slug || 'ecole';
}

/**
 * Builds the full URL for a school subdomain based on current host & port.
 */
export function getSchoolUrl(subdomain: string | null | undefined): string {
  if (!subdomain) {
    return window.location.origin;
  }

  const { protocol, hostname, port } = window.location;
  const portStr = port ? `:${port}` : '';

  // Localhost development
  if (hostname === 'localhost' || hostname.endsWith('.localhost')) {
    return `${protocol}//${subdomain}.localhost${portStr}`;
  }

  // Check if current hostname is already multi-part domain (e.g. app.domain.com or test.domain.com)
  const parts = hostname.split('.');
  let rootDomain = hostname;
  if (parts.length >= 2) {
    // If e.g. "sub.domain.com", extract "domain.com"
    rootDomain = parts.slice(-2).join('.');
  }

  return `${protocol}//${subdomain}.${rootDomain}${portStr}`;
}
