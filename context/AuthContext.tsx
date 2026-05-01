'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface UserPermissions {
  viewOrders: boolean;
  manageOrders: boolean;
  addMenuItems: boolean;
  editMenuItems: boolean;
  globalSettings: boolean;
  menuSettings: boolean;
  manageStaff: boolean;
}

interface CurrentUser {
  id: number;
  name: string;
  email?: string;
  role: string;
  permissions: UserPermissions;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserFromProfile(me: any): CurrentUser {
  const role = (me?.role || 'staff');
  const isOwnerOrAdmin = role === 'Owner' || role === 'Admin' || role === 'admin' || role === 'owner';

  return {
    id: me.id,
    name: me.name || me.email || 'User',
    email: me.email,
    role: role,
    permissions: {
      viewOrders: isOwnerOrAdmin || me.permissions?.viewOrders || false,
      manageOrders: isOwnerOrAdmin || me.permissions?.manageOrders || false,
      addMenuItems: isOwnerOrAdmin || me.permissions?.addMenuItems || false,
      editMenuItems: isOwnerOrAdmin || me.permissions?.editMenuItems || false,
      menuSettings: isOwnerOrAdmin || me.permissions?.menuSettings || false,
      globalSettings: isOwnerOrAdmin || me.permissions?.globalSettings || false,
      manageStaff: isOwnerOrAdmin || me.permissions?.manageStaff || false,
    }
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);

  useEffect(() => {
    // Token cha bhane user load garo
    const token = localStorage.getItem('access_token');
    const savedUser = localStorage.getItem('user');

    if (token && savedUser) {
      try {
        const me = JSON.parse(savedUser);
        const user = buildUserFromProfile(me);
        setCurrentUser(user);
        setIsAuthenticated(true);
      } catch {
        // Corrupted data — clear garo
        localStorage.removeItem('user');
        localStorage.removeItem('access_token');
        localStorage.removeItem('refresh_token');
      }
    }
  }, []);

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await apiFetch('/api/v1/logout/', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ refresh }),
        });
      }
    } catch {
    } finally {
      localStorage.removeItem('access_token');
      localStorage.removeItem('refresh_token');
      localStorage.removeItem('user');
      localStorage.removeItem('currentUser');

      // Cookie pani clear
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'role=; path=/; max-age=0';

      setCurrentUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth must be used inside an AuthProvider');
  }
  return context;
};