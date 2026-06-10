'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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

interface UserProfile {
  id: number;
  email: string;
  first_name: string;
  last_name: string;
  contact_no?: string;
  address?: string;
  restaurant?: number;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  profile: UserProfile | null;
  profileLoading: boolean;
  login: (user: CurrentUser) => void;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  isLoading: boolean;
  refetchProfile: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function buildUserFromProfile(me: any): CurrentUser {
  let role = me?.role || '';

  if (!role && me?.roles?.length) {
    const roleNames: string[] = me.roles.map((r: any) =>
      (r?.name ?? '').toLowerCase()
    );
    if (roleNames.some(r => r.includes('super')))         role = 'super_admin';
    else if (roleNames.some(r => r.includes('admin')))    role = 'admin';
    else if (roleNames.some(r => r.includes('staff')))    role = 'staff';
    else if (roleNames.some(r => r.includes('customer'))) role = 'customer';
    else role = 'staff';
  }

  if (!role) role = 'staff';

  const r = role.toLowerCase();
  const isOwnerOrAdmin = r === 'owner' || r === 'admin' || r === 'super_admin';
  const isStaff = r === 'staff';

  const backendPerms: string[] = (me?.roles ?? []).flatMap((role: any) =>
    (role?.permissions ?? []).map((p: any) => p?.codename ?? '')
  );

  const hasPerm = (codename: string) =>
    isOwnerOrAdmin || backendPerms.includes(codename) || false;

  return {
    id: me.id,
    name: me.name || `${me.first_name || ''} ${me.last_name || ''}`.trim() || me.email || 'User',
    email: me.email,
    role,
    permissions: {
      viewOrders:     isOwnerOrAdmin || isStaff || hasPerm('view_order'),
      manageOrders:   isOwnerOrAdmin || isStaff || hasPerm('change_order'),
      addMenuItems:   isOwnerOrAdmin || isStaff || hasPerm('add_menuitem'),
      editMenuItems:  isOwnerOrAdmin || isStaff || hasPerm('change_menuitem'),
      menuSettings:   isOwnerOrAdmin || isStaff,
      globalSettings: isOwnerOrAdmin,
      manageStaff:    isOwnerOrAdmin,
    },
  };
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [profile, setProfile] = useState<UserProfile | null>(null);
  const [profileLoading, setProfileLoading] = useState(false);

  // ✅ FIXED: fetchProfile - handle errors gracefully
  const fetchProfile = async () => {
    const token = localStorage.getItem('access_token');
    if (!token) {
      setProfileLoading(false);
      return;
    }

    setProfileLoading(true);
    try {
      const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/user/me/`, {
        headers: { 'Authorization': `Bearer ${token}` },
      });

      // ✅ Don't throw error on 401 - just clear auth silently
      if (res.status === 401) {
        console.log('Token expired, clearing auth');
        clearAuthStorage();
        setCurrentUser(null);
        setIsAuthenticated(false);
        setProfile(null);
        return;
      }

      if (!res.ok) {
        console.log('Profile fetch failed:', res.status);
        return;
      }

      const raw = await res.json();
      const data = raw.data ?? raw;

      setProfile({
        id:         data.id,
        email:      data.email      ?? '',
        first_name: data.first_name ?? '',
        last_name:  data.last_name  ?? '',
        contact_no: data.contact_no ?? '',
        address:    data.address    ?? '',
        restaurant: data.restaurant,
      });

      const stored = localStorage.getItem('user');
      if (stored) {
        try { 
          localStorage.setItem('user', JSON.stringify({ ...JSON.parse(stored), ...data })); 
        } catch {}
      }

      if (data.restaurant) {
        localStorage.setItem('restaurant_id', String(data.restaurant));
      }
    } catch (e) {
      console.error('Profile fetch error:', e);
      // ✅ Don't throw - just log and continue
    } finally {
      setProfileLoading(false);
    }
  };

  const clearAuthStorage = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('currentUser');
    localStorage.removeItem('access_token');
    localStorage.removeItem('refresh_token');
    localStorage.removeItem('restaurant_id');
  };

  useEffect(() => {
    const initAuth = async () => {
      const token = localStorage.getItem('access_token');
      const savedUser = localStorage.getItem('currentUser') || localStorage.getItem('user');

      if (token && savedUser) {
        try {
          const me = JSON.parse(savedUser);
          const user = buildUserFromProfile(me);
          setCurrentUser(user);
          setIsAuthenticated(true);
          
          // ✅ Fetch profile but don't await - let it run in background
          fetchProfile();
        } catch (e) {
          console.error('Auth parse error:', e);
          clearAuthStorage();
        }
      }
      setIsLoading(false);
    };

    initAuth();
  }, []);

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
    setIsAuthenticated(true);
    localStorage.setItem('currentUser', JSON.stringify(user));
    fetchProfile();
  };

  const logout = async () => {
    try {
      const refresh = localStorage.getItem('refresh_token');
      if (refresh) {
        await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/v1/logout/`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
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
      setProfile(null);
      
      // ✅ Only redirect if on protected route
      if (typeof window !== 'undefined' && window.location.pathname.includes('/restaurant-admin')) {
        window.location.href = '/login';
      }
    }
  };

  return (
    <AuthContext.Provider value={{
      currentUser,
      profile,
      profileLoading,
      login,
      logout,
      isAuthenticated,
      isLoading,
      refetchProfile: fetchProfile,
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) throw new Error('useAuth must be used inside an AuthProvider');
  return context;
};