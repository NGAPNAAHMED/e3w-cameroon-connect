import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, Session } from '@supabase/supabase-js';
import type { Database } from '@/integrations/supabase/types';

type Profile = Database['public']['Tables']['profiles']['Row'];

export interface AuthUser {
  id: string;
  nom: string;
  prenom: string;
  email: string;
  role: 'admin' | 'gestionnaire' | 'client';
  avatar?: string;
  telephone?: string;
  client_type?: 'salarie' | 'independant' | 'entreprise' | null;
}

interface AuthContextType {
  user: AuthUser | null;
  session: Session | null;
  loading: boolean;
  login: (email: string, password: string) => Promise<{ error: string | null }>;
  signup: (email: string, password: string, metadata: { nom: string; prenom: string; role?: string }) => Promise<{ error: string | null }>;
  logout: () => Promise<void>;
  isAuthenticated: boolean;
  // Legacy support for demo
  loginAs: (role: 'admin' | 'gestionnaire' | 'client') => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Demo users for quick access (until real users are created)
const demoUsers: Record<string, AuthUser> = {
  admin: {
    id: 'demo_admin',
    nom: 'Onana',
    prenom: 'Ngoua',
    email: 'admin@e3w.cm',
    role: 'admin',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    telephone: '+237 6 99 88 77 66'
  },
  gestionnaire: {
    id: 'demo_gestionnaire',
    nom: 'Ngapna',
    prenom: 'Ahmed',
    email: 'ahmed@e3w.cm',
    role: 'gestionnaire',
    avatar: 'https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face',
    telephone: '+237 6 77 66 55 44'
  },
  client: {
    id: 'demo_client',
    nom: 'Ekedi',
    prenom: 'Jean-Paul',
    email: 'client@e3w.cm',
    role: 'client',
    avatar: 'https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face',
    telephone: '+237 6 99 00 11 22'
  }
};

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<AuthUser | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // Set up auth state listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      (event, session) => {
        setSession(session);
        
        if (session?.user) {
          // Defer profile fetch to avoid deadlock
          setTimeout(() => {
            fetchProfile(session.user.id);
          }, 0);
        } else {
          setUser(null);
          setLoading(false);
        }
      }
    );

    // Check for existing session
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      if (session?.user) {
        fetchProfile(session.user.id);
      } else {
        setLoading(false);
      }
    });

    return () => subscription.unsubscribe();
  }, []);

  const fetchProfile = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('user_id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        setLoading(false);
        return;
      }

      if (profile) {
        setUser({
          id: profile.user_id,
          nom: profile.nom,
          prenom: profile.prenom,
          email: profile.email || '',
          role: profile.role,
          client_type: profile.client_type,
          avatar: `https://ui-avatars.com/api/?name=${encodeURIComponent(profile.prenom + ' ' + profile.nom)}&background=random`
        });
      }
    } catch (err) {
      console.error('Profile fetch error:', err);
    } finally {
      setLoading(false);
    }
  };

  const login = async (email: string, password: string): Promise<{ error: string | null }> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erreur de connexion' };
    }
  };

  const signup = async (
    email: string, 
    password: string, 
    metadata: { nom: string; prenom: string; role?: string }
  ): Promise<{ error: string | null }> => {
    try {
      const redirectUrl = `${window.location.origin}/`;
      
      const { error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          emailRedirectTo: redirectUrl,
          data: {
            nom: metadata.nom,
            prenom: metadata.prenom,
            role: metadata.role || 'client'
          }
        }
      });

      if (error) {
        return { error: error.message };
      }

      return { error: null };
    } catch (err: any) {
      return { error: err.message || 'Erreur lors de l\'inscription' };
    }
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
    setSession(null);
  };

  // Legacy demo login support
  const loginAs = (role: 'admin' | 'gestionnaire' | 'client') => {
    setUser(demoUsers[role]);
    setLoading(false);
  };

  return (
    <AuthContext.Provider value={{
      user,
      session,
      loading,
      login,
      signup,
      logout,
      isAuthenticated: !!user,
      loginAs
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
