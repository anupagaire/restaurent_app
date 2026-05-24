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
  // me.role = already resolved role string (from login flow)
  // me.roles = [{id, name}] array (from /user/me/ API)
  // Support both formats
  let role = me?.role || '';

  if (!role && me?.roles?.length) {
    // Pick primary role from roles array
    const roleNames: string[] = me.roles.map((r: any) =>
      (r?.name ?? '').toLowerCase()
    );
    if (roleNames.some(r => r.includes('super')))       role = 'super_admin';
    else if (roleNames.some(r => r.includes('admin')))  role = 'admin';
    else if (roleNames.some(r => r.includes('staff')))  role = 'staff';
    else if (roleNames.some(r => r.includes('customer'))) role = 'customer';
    else role = 'staff';
  }

  if (!role) role = 'staff';

  const r = role.toLowerCase();
  const isOwnerOrAdmin = r === 'owner' || r === 'admin' || r === 'super_admin';

  // Extract backend permission codenames if available
  const backendPerms: string[] = (me?.roles ?? []).flatMap((role: any) =>
    (role?.permissions ?? []).map((p: any) => p?.codename ?? '')
  );

  const hasPerm = (codename: string) =>
    isOwnerOrAdmin || backendPerms.includes(codename) || me.permissions?.[codename] || false;

  return {
    id: me.id,
    name: me.name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.email || 'User',
    email: me.email,
    role,
    permissions: {
      viewOrders:     isOwnerOrAdmin || hasPerm('view_order')        || me.permissions?.viewOrders    || false,
      manageOrders:   isOwnerOrAdmin || hasPerm('change_order')      || me.permissions?.manageOrders  || false,
      addMenuItems:   isOwnerOrAdmin || hasPerm('add_menuitem')      || me.permissions?.addMenuItems  || false,
      editMenuItems:  isOwnerOrAdmin || hasPerm('change_menuitem')   || me.permissions?.editMenuItems || false,
      menuSettings:   isOwnerOrAdmin || hasPerm('add_category')      || me.permissions?.menuSettings  || false,
      globalSettings: isOwnerOrAdmin || hasPerm('change_restaurant') || me.permissions?.globalSettings|| false,
      manageStaff:    isOwnerOrAdmin || hasPerm('add_user')          || me.permissions?.manageStaff   || false,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const initAuth = () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const me = JSON.parse(savedUser);
          const user = buildUserFromProfile(me);
          setCurrentUser(user);
          setIsAuthenticated(true);
        } catch (e) {
          console.error('Auth parse error:', e);
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
    localStorage.removeItem('restaurant_id');
  };

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
          body: JSON.stringify({ refresh }),
        });
      }
    } catch (error) {
      console.error('Logout error:', error);
    } finally {
      clearAuthStorage();
      document.cookie = 'access_token=; path=/; max-age=0';
      document.cookie = 'role=; path=/; max-age=0';
      setCurrentUser(null);
      setIsAuthenticated(false);
      window.location.href = '/login';
    }
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout, isAuthenticated, isLoading }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};