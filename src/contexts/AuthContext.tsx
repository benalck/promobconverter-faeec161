
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from './auth/types';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Session } from '@supabase/supabase-js';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();
  const [session, setSession] = useState<Session | null>(null);

  // Convert Supabase user to our User type
  const mapSupabaseUser = (session: Session | null): User | null => {
    if (!session?.user) return null;

    return {
      id: session.user.id,
      name: session.user.user_metadata?.name || session.user.email?.split('@')[0] || null,
      email: session.user.email,
      role: 'user', // Default role, will be updated from profile
      createdAt: session.user.created_at,
      lastLogin: new Date().toISOString(),
      isBanned: false, // Default value, will be updated from profile
      credits: 3 // Default credits, will be updated from profile
    };
  };

  // Fetch user profile data
  const fetchUserProfile = async (userId: string) => {
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error fetching profile:', error);
        return null;
      }

      return data;
    } catch (error) {
      console.error('Error in fetchUserProfile:', error);
      return null;
    }
  };

  // Update user with profile data
  const updateUserWithProfile = async (baseUser: User): Promise<User> => {
    try {
      const profile = await fetchUserProfile(baseUser.id);
      
      if (profile) {
        return {
          ...baseUser,
          role: profile.role || 'user',
          isBanned: profile.is_banned || false,
          credits: profile.credits || 3,
          name: profile.name || baseUser.name,
        };
      }
      
      return baseUser;
    } catch (error) {
      console.error('Error updating user with profile:', error);
      return baseUser;
    }
  };

  // Sync users (for admin purposes)
  const syncUsers = async () => {
    try {
      if (!user || user.role !== 'admin') return;

      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching users:', error);
        return;
      }

      const mappedUsers = data.map(profile => ({
        id: profile.id,
        name: profile.name,
        email: null, // Email is not stored in profiles
        role: profile.role || 'user',
        createdAt: profile.created_at,
        lastLogin: profile.last_login,
        isBanned: profile.is_banned || false,
        credits: profile.credits || 0
      }));

      setUsers(mappedUsers);
    } catch (error) {
      console.error('Error syncing users:', error);
    }
  };

  // Refresh user credits
  const refreshUserCredits = async () => {
    if (!user) return;
    
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', user.id)
        .single();

      if (error) {
        console.error('Error fetching credits:', error);
        return;
      }

      if (data) {
        setUser(prev => prev ? { ...prev, credits: data.credits } : null);
      }
    } catch (error) {
      console.error('Error refreshing credits:', error);
    }
  };

  // Login with email and password
  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;
      
      // User will be set in the session change listener
      return data;
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name
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
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Ban/unban a user
  const banUser = async (userId: string, isBanned: boolean) => {
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: isBanned })
        .eq('id', userId);

      if (error) throw error;

      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === userId ? { ...u, isBanned } : u)
      );

      // If the banned user is the current user, log them out
      if (isBanned && user?.id === userId) {
        logout();
      }
    } catch (error) {
      console.error('Error updating ban status:', error);
      throw error;
    }
  };

  // Delete a user (by banning them)
  const deleteUser = async (id: string) => {
    return banUser(id, true);
  };

  // Update a user
  const userManagementUpdate = async (id: string, data: Partial<User>) => {
    try {
      const updateData: any = {};
      
      if (data.name !== undefined) updateData.name = data.name;
      if (data.role !== undefined) updateData.role = data.role;
      if (data.isBanned !== undefined) updateData.is_banned = data.isBanned;
      if (data.credits !== undefined) updateData.credits = data.credits;

      const { error } = await supabase
        .from('profiles')
        .update(updateData)
        .eq('id', id);

      if (error) throw error;

      // Update users list
      setUsers(prevUsers => 
        prevUsers.map(u => u.id === id ? { ...u, ...data } : u)
      );

      // If the updated user is the current user, update the user state
      if (user?.id === id) {
        setUser(prev => prev ? { ...prev, ...data } : null);
        
        // If the user is being banned, log them out
        if (data.isBanned) {
          logout();
        }
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw error;
    }
  };

  // Initialize auth state and listen for auth changes
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth...");
        
        // Get initial session
        const { data: { session } } = await supabase.auth.getSession();
        setSession(session);
        
        if (session?.user) {
          console.log("Found session for user:", session.user.id);
          let mappedUser = mapSupabaseUser(session);
          
          if (mappedUser) {
            // Fetch additional profile data
            mappedUser = await updateUserWithProfile(mappedUser);
            setUser(mappedUser);
            
            // If user is banned, sign them out
            if (mappedUser.isBanned) {
              toast({
                title: "Conta suspensa",
                description: "Sua conta foi suspensa. Entre em contato com o administrador.",
                variant: "destructive",
              });
              await logout();
            } else {
              // Sync users list if admin
              if (mappedUser.role === 'admin') {
                await syncUsers();
              }
            }
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
        console.log("Auth initialization complete");
      }
    };

    // Setup auth state listener
    const { data: authListener } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        console.log("Auth state changed:", event);
        setSession(session);
        
        // Handle specific auth events
        if (event === 'SIGNED_IN' && session) {
          let mappedUser = mapSupabaseUser(session);
          if (mappedUser) {
            mappedUser = await updateUserWithProfile(mappedUser);
            setUser(mappedUser);
            
            if (mappedUser.role === 'admin') {
              await syncUsers();
            }
          }
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
        } else if (event === 'USER_UPDATED' && session) {
          let mappedUser = mapSupabaseUser(session);
          if (mappedUser) {
            mappedUser = await updateUserWithProfile(mappedUser);
            setUser(mappedUser);
          }
        }
      }
    );

    // Initialize
    initAuth();

    // Cleanup
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
        logout,
        deleteUser,
        updateUser: userManagementUpdate,
        getAllUsers: () => users,
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
