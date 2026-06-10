import React, { createContext, useState, useEffect } from 'react';
import { supabase } from '../../data/datasources/supabase/client';
import { Session, User } from '@supabase/supabase-js';
import { NotificationService } from '../../services/notificationService';

export const AuthContext = createContext<{
  session: Session | null;
  user: User | null;
  isLoading: boolean;
  signOut: () => Promise<void>;
}>({ session: null, user: null, isLoading: true, signOut: async () => {} });

export const AuthProvider = ({ children }: { children: React.ReactNode }) => {
  const [session, setSession] = useState<Session | null>(null);
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setUser(session?.user ?? null);
      setIsLoading(false);
    });

    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setUser(session?.user ?? null);
    });

    return () => subscription.unsubscribe();
  }, []);

  useEffect(() => {
    if (user?.id) {
      const registerPushToken = async () => {
        const token = await NotificationService.getExpoPushToken();
        if (token) {
          const { error } = await supabase
            .from('users')
            .update({ push_token: token })
            .eq('id', user.id);
            
          if (error) {
            console.error('[AuthContext] Erro ao salvar push token:', error);
          }
        }
      };
      registerPushToken();
    }
  }, [user?.id]);

  const signOut = async () => {
    await supabase.auth.signOut();
  };

  return (
    <AuthContext.Provider value={{ session, user, isLoading, signOut }}>
      {children}
    </AuthContext.Provider>
  );
};
