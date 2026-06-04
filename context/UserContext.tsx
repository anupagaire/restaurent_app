'use client';

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { apiFetch } from '@/lib/api';

interface User {
  id?: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no?: string;
  address?: string;
}

interface UserContextValue {
  user: User | null;
  loading: boolean;
  error: string;
  refetch: () => Promise<void>;
  updateUser: (partial: Partial<User>) => void;
}

const UserContext = createContext<UserContextValue | null>(null);

export function UserProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  const fetchUser = async () => {
    try {
      const res = await apiFetch('/api/v1/user/me/');
      if (res.status === 401) {
        window.location.href = '/login';
        return;
      }
      const raw = await res.json();
      const data = raw.data ?? raw;
      setUser(data);

      // keep localStorage in sync (for other parts of the app that still read it)
      const access  = localStorage.getItem('access_token')  || '';
      const refresh = localStorage.getItem('refresh_token') || '';
      if (access && data.email) {
        localStorage.setItem('qr_menu_auth', JSON.stringify({ access, refresh, email: data.email }));
      }
    } catch {
      setError('Failed to load user');
      window.location.href = '/login';
    } finally {
      setLoading(false);
    }
  };

  // updateUser — optimistic update without re-fetching (used after PATCH)
  const updateUser = (partial: Partial<User>) => {
    setUser(prev => prev ? { ...prev, ...partial } : prev);
    // also update localStorage
    const stored = localStorage.getItem('user');
    if (stored) {
      try {
        localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...partial }));
      } catch {}
    }
  };

  useEffect(() => { fetchUser(); }, []);

  return (
    <UserContext.Provider value={{ user, loading, error, refetch: fetchUser, updateUser }}>
      {children}
    </UserContext.Provider>
  );
}

// Hook — use this in any page instead of calling apiFetch('/api/v1/user/me/')
export function useUser() {
  const ctx = useContext(UserContext);
  if (!ctx) throw new Error('useUser must be used inside <UserProvider>');
  return ctx;
}