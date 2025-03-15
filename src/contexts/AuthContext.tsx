
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from './auth/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/lib/supabase';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  // Initialize auth state from Supabase
  useEffect(() => {
    const initAuth = async () => {
      try {
        // Set up Supabase auth listener
        const { data: { session } } = await supabase.auth.getSession();
        
        if (session) {
          const { data: userData } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();

          // Convert Supabase user to our User format
          const userObj: User = {
            id: session.user.id,
            name: userData?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
            email: session.user.email,
            role: userData?.role || 'user',
            createdAt: session.user.created_at,
            isBanned: userData?.is_banned || false,
            credits: userData?.credits || 3,
            lastLogin: userData?.last_login || null
          };
          
          setUser(userObj);
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();

    // Subscribe to auth changes
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session) {
        // Get or create profile
        const { data: profile } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        if (!profile) {
          // Create profile if it doesn't exist
          await supabase
            .from('profiles')
            .insert([
              { 
                id: session.user.id, 
                full_name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
                email: session.user.email,
                role: 'user',
                credits: 3,
                is_banned: false
              }
            ]);
        }

        // Get user data with profile
        const { data: userData } = await supabase
          .from('profiles')
          .select('*')
          .eq('id', session.user.id)
          .single();

        // Convert Supabase user to our User format
        const userObj: User = {
          id: session.user.id,
          name: userData?.full_name || session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
          email: session.user.email,
          role: userData?.role || 'user',
          createdAt: session.user.created_at,
          isBanned: userData?.is_banned || false,
          credits: userData?.credits || 3,
          lastLogin: userData?.last_login || null
        };
        
        setUser(userObj);

        // Update last login
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', session.user.id);

      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Sync users (for admin purposes)
  const syncUsers = async () => {
    if (user?.role === 'admin') {
      const { data } = await supabase
        .from('profiles')
        .select('*');
        
      if (data) {
        const mappedUsers: User[] = data.map(profile => ({
          id: profile.id,
          name: profile.full_name,
          email: profile.email,
          role: profile.role,
          createdAt: profile.created_at,
          lastLogin: profile.last_login,
          isBanned: profile.is_banned,
          credits: profile.credits
        }));
        setUsers(mappedUsers);
      }
    }
    return Promise.resolve();
  };

  // Refresh user credits
  const refreshUserCredits = async () => {
    if (user) {
      const { data } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();
        
      if (data && user) {
        setUser({ ...user, credits: data.credits });
      }
    }
    return Promise.resolve();
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password
      });
      
      if (error) throw error;
      
      // Auth state will be updated by the listener
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      const { error, data } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          }
        }
      });
      
      if (error) throw error;
      
      return { email, name };
    } catch (error: any) {
      console.error('Error registering:', error);
      throw new Error(error.message || 'Failed to register');
    }
  };

  // Logout
  const logout = async () => {
    try {
      await supabase.auth.signOut();
      // Auth state will be updated by the listener
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Delete a user (admin only)
  const deleteUser = async (id: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      await supabase
        .from('profiles')
        .delete()
        .eq('id', id);
        
      await syncUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Update a user
  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      // Convert User object to profiles table structure
      const profileData: any = {};
      
      if (data.name !== undefined) profileData.full_name = data.name;
      if (data.role !== undefined) profileData.role = data.role;
      if (data.isBanned !== undefined) profileData.is_banned = data.isBanned;
      if (data.credits !== undefined) profileData.credits = data.credits;
      
      await supabase
        .from('profiles')
        .update(profileData)
        .eq('id', id);

      // If it's the current user, update the local state
      if (user && user.id === id) {
        setUser({ ...user, ...data });
      }

      // Resync users list if admin
      if (user?.role === 'admin') {
        await syncUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
    }
  };

  // Get all users (admin only)
  const getAllUsers = () => {
    return users;
  };

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
        logout,
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
