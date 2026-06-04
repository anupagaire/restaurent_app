const BASE_URL = process.env.NEXT_PUBLIC_API_URL;

export interface AuthData {
  access: string;
  refresh: string;
  email: string;
}

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

let isRefreshing = false;
let refreshPromise: Promise<string | null> | null = null;

export async function apiRefreshToken(refreshToken?: string): Promise<string | null> {
  const token = refreshToken ?? getAuth()?.refresh;
  if (!token) return null;

  // Prevent multiple simultaneous refresh attempts
  if (isRefreshing && refreshPromise) {
    console.log('⏳ Already refreshing QR auth, waiting...');
    return refreshPromise;
  }

  isRefreshing = true;
  
  refreshPromise = (async () => {
    try {
      console.log('🔄 Refreshing QR menu token...');
      
      const res = await fetch(`${BASE_URL}/api/v1/token/refresh/`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ refresh: token }),
      });

      if (!res.ok) {
        console.error('❌ QR refresh failed:', res.status);
        clearAuth();
        return null;
      }

      const data = await res.json();
      if (!data.access) {
        console.error('❌ No access token in refresh response');
        clearAuth();
        return null;
      }

      // Update stored auth with new access token
      const existing = getAuth();
      if (existing) {
        saveAuth({ ...existing, access: data.access });
      }

      console.log('✅ QR token refreshed successfully');
      return data.access;
      
    } catch (error) {
      console.error('❌ QR refresh error:', error);
      clearAuth();
      return null;
    } finally {
      isRefreshing = false;
      refreshPromise = null;
    }
  })();

  return refreshPromise;
}

export const refreshAccessToken = apiRefreshToken;

// Updated apiFetch for QR menu with auto-refresh
export async function apiFetch(endpoint: string, options: RequestInit = {}) {
  const auth = getAuth();
  let token = auth?.access;
  
  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string>),
  };
  if (token) headers['Authorization'] = `Bearer ${token}`;
  
  let res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers });

  // ✅ Auto-refresh on 401
  if (res.status === 401 && !endpoint.includes('/token/refresh/')) {
    console.log('🔄 QR menu 401 detected, refreshing...');
    
    const newToken = await apiRefreshToken();
    
    if (!newToken) {
      throw new Error('Session expired');
    }

    console.log('🔄 Retrying QR request with new token...');
    
    const retryHeaders: Record<string, string> = {
      'Content-Type': 'application/json',
      ...(options.headers as Record<string, string>),
      'Authorization': `Bearer ${newToken}`,
    };

    res = await fetch(`${BASE_URL}${endpoint}`, { ...options, headers: retryHeaders });
  }

  return res;
}

export async function withTokenRefresh<T>(
  fn: (token: string) => Promise<T>
): Promise<{ result: T; freshAuth: AuthData }> {
  const auth = getAuth();
  if (!auth) throw new Error('Not logged in.');

  try {
    const result = await fn(auth.access);
    const currentAuth = getAuth() ?? auth;
    return { result, freshAuth: currentAuth };
  } catch (err: unknown) {
    const msg = err instanceof Error ? err.message : '';

    if (!msg.includes('401')) throw err;

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