import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User, AuthContextType } from './auth/types';
import { convertSupabaseUser } from './auth/userUtils';
import { useUserManagement } from './auth/userManagement';
import { useAuthentication } from './auth/authHooks';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // We need to partially initialize logout to break the circular dependency
  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
  };

  const {
    syncUsers,
    deleteUser,
    updateUser,
    getAllUsers,
  } = useUserManagement(setUser, setUsers, user, users, logout);

  const {
    login,
    register,
    logout: authLogout
  } = useAuthentication(setUser, syncUsers);

  // Override the partial logout with the complete one
  const completeLogout = authLogout;

  useEffect(() => {
    const initialize = async () => {
      try {
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session?.user) {
          const currentUser = await convertSupabaseUser(session.session.user);
          setUser(currentUser);
          
          if (currentUser.isBanned) {
            toast({
              title: "Conta suspensa",
              description: "Sua conta foi suspensa. Entre em contato com o administrador.",
              variant: "destructive",
            });
            await completeLogout();
            return;
          }
        }

        await syncUsers();
      } catch (error) {
        console.error('Erro na inicialização do AuthContext:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = await convertSupabaseUser(session.user);
        setUser(newUser);
        await syncUsers();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  // Update user activity every 2 minutes when logged in
  useEffect(() => {
    if (!user) return;

    const updateActivity = async () => {
      try {
        await supabase.rpc('update_user_activity');
      } catch (error) {
        console.error('Error updating user activity:', error);
      }
    };

    // Update immediately on login
    updateActivity();

    // Then update every 2 minutes
    const interval = setInterval(updateActivity, 2 * 60 * 1000);

    return () => clearInterval(interval);
  }, [user]);

  return (
    <AuthContext.Provider
      value={{
        user,
        isAuthenticated: !!user,
        // isAdmin now includes both 'admin' and 'ceo' roles
        isAdmin: !!user && (user.role === 'admin' || user.role === 'ceo'),
        users,
        isInitialized,
        login,
        register,
        logout: completeLogout,
        deleteUser,
        updateUser,
        getAllUsers,
        setUser
      }}
    >
      {isInitialized ? children : null}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error('useAuth deve ser usado dentro de um AuthProvider');
  }
  return context;
}