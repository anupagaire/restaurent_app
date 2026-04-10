'use client';

import { createContext, useContext, useState, ReactNode, useEffect } from 'react';

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
  email?: string;        // ← Add this
  role: string;
  permissions: UserPermissions;
}

interface AuthContextType {
  currentUser: CurrentUser | null;
  login: (user: CurrentUser) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<CurrentUser | null>(null);

  // Set default Owner when app starts
  useEffect(() => {
    const savedUser = localStorage.getItem('currentUser');
    
    if (savedUser) {
      setCurrentUser(JSON.parse(savedUser));
    } else {
      // Default: You are the Restaurant Owner (Full Access)
      const owner: CurrentUser = {
        id: 1,
        name: "Restaurant Owner",
        role: "Owner",
        permissions: {
          viewOrders: true,
          manageOrders: true,
          addMenuItems: true,
          editMenuItems: true,
          menuSettings: true,        
          globalSettings: true,
          manageStaff: true,
        }
      };
      
      setCurrentUser(owner);
      localStorage.setItem('currentUser', JSON.stringify(owner));
    }
  }, []);

  const login = (user: CurrentUser) => {
    setCurrentUser(user);
    localStorage.setItem('currentUser', JSON.stringify(user));
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem('currentUser');
    window.location.href = '/login';
  };

  return (
    <AuthContext.Provider value={{ currentUser, login, logout }}>
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