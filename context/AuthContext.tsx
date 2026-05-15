'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { apiFetch } from '@/lib/api';

interface UserPermissions {
  viewOrders: boolean;
  manageOrders: boolean;
  addMenuItems: boolean;
  editMenuItems: boolean;
  menuSettings: boolean;
  globalSettings: boolean;
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
  isLoading: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserFromProfile(me: any): CurrentUser {
  const role = (me?.role || 'staff');
  const isOwnerOrAdmin = role === 'Owner' || role === 'Admin' || 
                        role === 'admin' || role === 'owner';

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
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('access_token');
      // दुवै पुरानो र नयाँ key check गरौं
      const savedUser = localStorage.getItem('user') || localStorage.getItem('currentUser');

      if (token && savedUser) {
        try {
          const me = JSON.parse(savedUser);
          const user = buildUserFromProfile(me);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (e) {
          console.error("Auth parse error:", e);
          clearAuthStorage();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const clearAuthStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
  };

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user)); // consistent key
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
    } catch (error) {
      console.error("Logout error:", error);
    } finally {
      clearAuthStorage();

      // Clear cookies
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'role=; path=/; max-age=0';

      setCurrentUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        login,
        logout,
        isAuthenticated,
        isLoading,
      }}
    >
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