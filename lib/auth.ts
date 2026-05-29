const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

// ── AuthData interface ──
export interface AuthData {
  access: string;
  refresh: string;
  email: string;
}

// ── Single source of truth for localStorage key ──
// Must match whatever MenuSection.tsx uses when saving order auth
const AUTH_KEY = 'qr_menu_auth';

export function getAuth(): AuthData | null {
  try {
    const raw = localStorage.getItem(AUTH_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch { return null; }
}

export function saveAuth(auth: AuthData): void {
  localStorage.setItem(AUTH_KEY, JSON.stringify(auth));
}

export function clearAuth(): void {
  localStorage.removeItem(AUTH_KEY);
}

// ── Existing apiFetch (unchanged) ──
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const auth = getAuth();
  const token = auth?.access;
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  const res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });
  return res;
}

// ── Token refresh — reads refresh token from AuthData (NOT separate key) ──
export async function apiRefreshToken(refreshToken?: string): Promise<string | null> {
  // Use passed-in token, or fall back to stored AuthData's refresh field
  const token = refreshToken ?? getAuth()?.refresh;
  if (!token) return null;

  const res = await fetch(`${BASE_URL}/api/v1/token/refresh/`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ refresh: token }),
  });

  if (!res.ok) {
    clearAuth();
    return null;
  }

  const data = await res.json();
  if (!data.access) return null;

  // Update stored auth with new access token
  const existing = getAuth();
  if (existing) {
    saveAuth({ ...existing, access: data.access });
  }

  return data.access;
}

// Alias for backwards compat
export const refreshAccessToken = apiRefreshToken;

// ── withTokenRefresh ──
// Runs fn(token), and if it throws a 401 error, refreshes and retries once.
export async function withTokenRefresh<T>(
  fn: (token: string) => Promise<T>
): Promise<{ result: T; freshAuth: AuthData }> {
  const auth = getAuth();
  if (!auth) throw new Error('Not logged in.');

  try {
    const result = await fn(auth.access);
    // Re-read in case token was refreshed mid-flight elsewhere
    const currentAuth = getAuth() ?? auth;
    return { result, freshAuth: currentAuth };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';

    // Only retry on 401
    if (!msg.includes('401')) throw err;

    // Try to get a new access token using the refresh token from AuthData
    const newAccess = await apiRefreshToken(auth.refresh);
    if (!newAccess) {
      clearAuth();
      throw new Error('Session has expired. Please log in again.');
    }

    const fresh: AuthData = { ...auth, access: newAccess };
    saveAuth(fresh);

    const result = await fn(newAccess);
    return { result, freshAuth: fresh };
  }
}