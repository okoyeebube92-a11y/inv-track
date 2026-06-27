'use client';
// src/context/AuthContext.tsx
import { createContext, useContext, useEffect, useMemo, useState } from 'react';
import type { User, Session } from '@supabase/supabase-js';
import { createClient } from '@/lib/supabase/client';

interface AuthContextType {
  user: User | null;
  session: Session | null;
  loading: boolean;
  signIn: (email: string, password: string) => Promise<unknown>;
  signOut: () => Promise<void>;
  isAdmin: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const { supabase, configError } = useMemo(() => {
    try {
      return { supabase: createClient(), configError: '' };
    } catch (error: any) {
      return { supabase: null, configError: error.message || 'Supabase is not configured.' };
    }
  }, []);
  const [user, setUser]       = useState<User | null>(null);
  const [session, setSession] = useState<Session | null>(null);
  const [loading, setLoading] = useState(!configError);
  const [isAdmin, setIsAdmin] = useState(false);

  useEffect(() => {
    if (!supabase) {
      setLoading(false);
      return;
    }

    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      setLoading(false);
    }).catch(() => {
      setLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_e, session) => {
      setSession(session);
      setUser(session?.user ?? null);
      if (session?.user) checkAdmin(session.user.id);
      else setIsAdmin(false);
    });

    return () => subscription.unsubscribe();
  }, [supabase]);

  async function checkAdmin(userId: string) {
    if (!supabase) return;

    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('user_id', userId)
      .single();
    setIsAdmin(data?.role === 'admin');
  }

  async function signIn(email: string, password: string) {
    if (!supabase) {
      throw new Error(configError);
    }

    const { data, error } = await supabase.auth.signInWithPassword({ email, password });

    if (error) {
      console.error('Supabase signIn failed:', error);
      throw new Error(error.message || 'Unable to sign in. Check your credentials and network connection.');
    }

    return data;
  }

  async function signOut() {
    if (!supabase) return;
    await supabase.auth.signOut();
  }

  return (
    <AuthContext.Provider value={{ user, session, loading, signIn, signOut, isAdmin }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth must be used inside AuthProvider');
  return ctx;
}

