/**
 * API base URL. Defaults to empty string so requests use relative `/api/*` paths
 * through the nginx gateway (same origin in production and Docker).
 *
 * Override only when the UI is served from a different origin than the gateway.
 */
export const API_BASE_URL = (import.meta.env.PUBLIC_API_BASE_URL ?? '').replace(/\/$/, '');

export function apiUrl(path: string): string {
  const normalized = path.startsWith('/') ? path : `/${path}`;
  return `${API_BASE_URL}${normalized}`;
}
