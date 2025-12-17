import React, { createContext, useContext, useState, ReactNode } from 'react';
import { Staff, staff } from '@/data/mockData';

interface AuthContextType {
  user: Staff | null;
  login: (email: string, password: string) => boolean;
  loginAs: (role: 'admin' | 'gestionnaire' | 'client') => void;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<Staff | null>(null);

  const login = (email: string, _password: string): boolean => {
    const foundUser = staff.find(s => s.email === email);
    if (foundUser) {
      setUser(foundUser);
      return true;
    }
    return false;
  };

  const loginAs = (role: 'admin' | 'gestionnaire' | 'client') => {
    if (role === 'admin') {
      setUser(staff.find(s => s.role === 'admin')!);
    } else if (role === 'gestionnaire') {
      setUser(staff.find(s => s.email === 'ahmed@e3w.cm')!);
    } else {
      // Mock client login
      setUser({
        id: 'client_demo',
        nom: 'Ekedi',
        prenom: 'Jean-Paul',
        email: 'client@e3w.cm',
        role: 'client',
        avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
        telephone: '+237 6 99 00 11 22'
      });
    }
  };

  const logout = () => {
    setUser(null);
  };

  return (
    <AuthContext.Provider value={{
      user,
      login,
      loginAs,
      logout,
      isAuthenticated: !!user
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return context;
}
