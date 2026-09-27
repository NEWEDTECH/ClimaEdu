/**
 * Utilities for white-label domain handling.
 * Pure functions, safe to use on both server and client.
 */

/** Main platform domain (multi-institution access, SUPER_ADMIN, etc.) */
export const PLATFORM_DOMAIN = (
  process.env.NEXT_PUBLIC_PLATFORM_DOMAIN || 'climaedu.newedtech.com.br'
).toLowerCase();

const DOMAIN_REGEX = /^(?=.{4,253}$)(?:[a-z0-9](?:[a-z0-9-]{0,61}[a-z0-9])?\.)+[a-z]{2,63}$/i;

/**
 * Normalizes a domain typed by a user or received in a Host header:
 * trims, lowercases, removes protocol, path, port and trailing dot.
 * e.g. " https://Escola.com.br:443/login " -> "escola.com.br"
 */
export function normalizeDomain(value: string | null | undefined): string {
  if (!value) return '';
  return value
    .trim()
    .toLowerCase()
    .replace(/^[a-z]+:\/\//, '')
    .split('/')[0]
    .split('?')[0]
    .replace(/:\d+$/, '')
    .replace(/\.$/, '');
}

export function isValidDomain(domain: string): boolean {
  return DOMAIN_REGEX.test(domain);
}

/**
 * Hosts that serve the platform itself (no institution resolved by domain):
 * the platform domain, localhost and Vercel preview deployments.
 */
export function isPlatformHost(host: string): boolean {
  const normalized = normalizeDomain(host);
  return (
    !normalized ||
    normalized === PLATFORM_DOMAIN ||
    normalized === 'localhost' ||
    normalized.endsWith('.vercel.app') ||
    // Acesso por IP (ex.: servidor de dev acessado pela rede local)
    /^\d{1,3}(\.\d{1,3}){3}$/.test(normalized) ||
    normalized.startsWith('[')
  );
}

/**
 * Returns the institution domain to look up for a given host, or null when the
 * host is the platform itself.
 * In local development, "<domain>.localhost" (e.g. escola.com.br.localhost:3000)
 * simulates the institution domain.
 */
export function getInstitutionDomainFromHost(host: string): string | null {
  const normalized = normalizeDomain(host);

  if (normalized.endsWith('.localhost')) {
    return normalized.slice(0, -'.localhost'.length) || null;
  }

  if (isPlatformHost(normalized)) {
    return null;
  }

  return normalized;
}

/** Absolute URL for an institution domain (falls back to the platform domain) */
export function buildInstitutionUrl(domain: string | null | undefined, path = '/'): string {
  const target = normalizeDomain(domain) || PLATFORM_DOMAIN;
  return `https://${target}${path.startsWith('/') ? path : `/${path}`}`;
}
