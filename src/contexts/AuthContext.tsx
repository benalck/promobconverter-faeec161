
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
    refreshUserCredits,
    addInitialCreditsIfNeeded,
    deleteUser,
    updateUser,
    getAllUsers
  } = useUserManagement(setUser, setUsers, user, users, logout);

  const {
    login,
    register,
    logout: authLogout
  } = useAuthentication(setUser, syncUsers, addInitialCreditsIfNeeded);

  // Override the partial logout with the complete one
  const completeLogout = authLogout;

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("AuthContext initializing...");
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session?.user) {
          console.log("User session found:", session.session.user.id);
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
          
          await addInitialCreditsIfNeeded(currentUser.id);
        } else {
          console.log("No user session found");
        }

        console.log("Syncing users...");
        await syncUsers();
        console.log("Users synced");
      } catch (error) {
        console.error('Error initializing AuthContext:', error);
      } finally {
        setIsInitialized(true);
        console.log("AuthContext initialized");
      }
    };

    initialize();

    const { data: authListener } = supabase.auth.onAuthStateChange(async (event, session) => {
      console.log('Auth state changed:', event);
      
      if (event === 'SIGNED_IN' && session?.user) {
        const newUser = await convertSupabaseUser(session.user);
        setUser(newUser);
        
        await addInitialCreditsIfNeeded(newUser.id);
        
        await syncUsers();
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      authListener.subscription.unsubscribe();
    };
  }, []);

  return (
    <AuthContext.Provider 
      value={{ 
        user, 
        users,
        isAuthenticated: !!user && isInitialized,
        isAdmin: user?.role === 'admin',
        isInitialized,
        login, 
        register, 
        logout: completeLogout,
        deleteUser,
        updateUser,
        getAllUsers,
        refreshUserCredits,
        syncUsers
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
