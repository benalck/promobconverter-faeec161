
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/lib/supabase';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
}

interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: User[];
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (name: string, email: string, password: string) => Promise<void>;
  logout: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  useEffect(() => {
    const initializeAuth = async () => {
      // Check if user is already authenticated
      const { data: { session } } = await supabase.auth.getSession();
      
      if (session?.user) {
        try {
          // Fetch profile from database
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
            
          if (profileError) throw profileError;
          
          // Transform Supabase profile to our User type
          const currentUser: User = {
            id: session.user.id,
            name: profileData.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'user', // Default role
            createdAt: profileData.created_at,
            lastLogin: profileData.last_login,
            isBanned: profileData.is_banned
          };

          // Check if user is banned
          if (currentUser.isBanned) {
            await supabase.auth.signOut();
            setUser(null);
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Error fetching user profile:', error);
          await supabase.auth.signOut();
          setUser(null);
        }
      }
      
      setIsInitialized(true);
    };

    initializeAuth();

    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        try {
          // Fetch profile
          const { data: profileData, error: profileError } = await supabase
            .from('profiles')
            .select('*')
            .eq('id', session.user.id)
            .single();
          
          if (profileError) throw profileError;
          
          // Update user data
          const currentUser: User = {
            id: session.user.id,
            name: profileData.name || session.user.email?.split('@')[0] || 'User',
            email: session.user.email || '',
            role: 'user',
            createdAt: profileData.created_at,
            lastLogin: profileData.last_login,
            isBanned: profileData.is_banned
          };

          if (currentUser.isBanned) {
            await supabase.auth.signOut();
            setUser(null);
            toast({
              title: 'Conta banida',
              description: 'Sua conta foi banida. Entre em contato com o administrador.',
              variant: 'destructive',
            });
          } else {
            setUser(currentUser);
          }
        } catch (error) {
          console.error('Error handling auth state change:', error);
        }
      } else if (event === 'SIGNED_OUT') {
        setUser(null);
      }
    });

    return () => {
      subscription.unsubscribe();
    };
  }, []);

  // Fetch all users (admin only function)
  const getAllUsers = async (): Promise<User[]> => {
    if (!user || user.role !== 'admin') {
      return [];
    }

    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      const fetchedUsers: User[] = data.map(profile => ({
        id: profile.id,
        name: profile.name || 'Usuário',
        email: '', // We don't store emails in profiles table, would need a separate query
        role: 'user', // Default role
        createdAt: profile.created_at,
        lastLogin: profile.last_login,
        isBanned: profile.is_banned
      }));

      setUsers(fetchedUsers);
      return fetchedUsers;
    } catch (error) {
      console.error('Error fetching users:', error);
      toast({
        title: 'Erro ao buscar usuários',
        description: 'Não foi possível carregar a lista de usuários.',
        variant: 'destructive',
      });
      return [];
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) throw error;

      if (data.user) {
        // Update last login time
        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', data.user.id);
      }
    } catch (error: any) {
      console.error('Login error:', error);
      throw new Error(error.message || 'Falha ao fazer login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: {
            name,
          },
        },
      });

      if (error) throw error;

      // Profile is automatically created by database trigger
      return;
    } catch (error: any) {
      console.error('Registration error:', error);
      throw new Error(error.message || 'Falha ao registrar usuário');
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
    } catch (error) {
      console.error('Logout error:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (!user || user.role !== 'admin') {
      throw new Error('Não autorizado');
    }

    if (user.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }

    try {
      // In Supabase, we typically don't delete users directly
      // Instead, we can ban them or set inactive flag
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id);

      if (error) throw error;

      // Update local state
      await getAllUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      // Update profile in database
      const { error } = await supabase
        .from('profiles')
        .update({
          name: data.name,
          is_banned: data.isBanned,
        })
        .eq('id', id);

      if (error) throw error;

      // Update local state if needed
      if (user?.id === id) {
        setUser(prev => prev ? { ...prev, ...data } : null);
      }

      // Refresh user list if admin
      if (user?.role === 'admin') {
        await getAllUsers();
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Falha ao atualizar usuário');
    }
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
        getAllUsers
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
