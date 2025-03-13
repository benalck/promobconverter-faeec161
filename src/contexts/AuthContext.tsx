
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

interface User {
  id: string;
  name: string | null;
  email: string | null;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  credits: number;
  activePlan?: Plan | null;
  planExpiryDate?: string | null;
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
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  getAllUsers: () => User[];
  refreshUserCredits: () => Promise<void>;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', supabaseUser.id)
        .single();

      // Default to user role
      let userRole: 'admin' | 'user' = 'user';
      
      // Only assign admin role if explicitly defined
      if (profile?.role === 'admin') {
        userRole = 'admin';
      } else if (supabaseUser.user_metadata && supabaseUser.user_metadata.role === 'admin') {
        userRole = 'admin';
      }

      const planExpiryDate = profile?.plan_expiry_date || null;

      return {
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
        email: supabaseUser.email,
        role: userRole,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLogin: supabaseUser.last_sign_in_at,
        isBanned: profile?.is_banned || false,
        credits: profile?.credits || 0,
        activePlan: profile?.plans || null,
        planExpiryDate
      };
    } catch (error) {
      console.error('Erro ao converter usuário do Supabase:', error);
      return {
        id: supabaseUser.id,
        name: supabaseUser.user_metadata?.name || 'Usuário',
        email: supabaseUser.email,
        role: 'user',
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLogin: supabaseUser.last_sign_in_at,
        credits: 0
      };
    }
  };

  const syncUsers = async () => {
    try {
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*, plans(*)');

      if (error) throw error;

      if (!supabaseUsers || supabaseUsers.length === 0) {
        setUsers([]);
        return;
      }

      const formattedUsers: User[] = [];
      
      for (const profile of supabaseUsers) {
        try {
          let userEmail = null;
          // Initialize userRole with the default value of 'user'
          let userRole: 'admin' | 'user' = 'user';
          
          try {
            // This will fail in the browser since admin APIs are only available server-side
            // Let's catch it and continue
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
            userEmail = userData?.user?.email || null;
          } catch (error) {
            console.log('Erro ao buscar metadados do usuário:', error);
          }
          
          // Only assign 'admin' if the profile role is explicitly 'admin'
          if (profile.role === 'admin') {
            userRole = 'admin';
          }
          
          formattedUsers.push({
            id: profile.id,
            name: profile.name,
            email: userEmail,
            role: userRole,
            createdAt: profile.created_at,
            lastLogin: profile.last_login || undefined,
            isBanned: profile.is_banned,
            credits: profile.credits || 0,
            activePlan: profile.plans || null,
            planExpiryDate: profile.plan_expiry_date || null
          });
        } catch (error) {
          console.error('Erro ao processar usuário:', error);
        }
      }

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao sincronizar usuários:', error);
    }
  };

  const refreshUserCredits = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          credits: profile?.credits || 0,
          activePlan: profile?.plans || null,
          planExpiryDate: profile?.plan_expiry_date || null
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        console.log('Initializing AuthContext...');
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session?.user) {
          console.log('User found in session:', session.session.user.id);
          const currentUser = await convertSupabaseUser(session.session.user);
          setUser(currentUser);
          
          if (currentUser.isBanned) {
            toast({
              title: "Conta suspensa",
              description: "Sua conta foi suspensa. Entre em contato com o administrador.",
              variant: "destructive",
            });
            await logout();
            return;
          }
        } else {
          console.log('No user found in session');
        }

        await syncUsers();
      } catch (error) {
        console.error('Erro na inicialização do AuthContext:', error);
      } finally {
        console.log('AuthContext initialization complete');
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

  const login = async (email: string, password: string) => {
    try {
      console.log('Attempting login with email:', email);
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        console.log('Login successful, user:', data.user.id);
        const currentUser = await convertSupabaseUser(data.user);
        
        if (currentUser.isBanned) {
          toast({
            title: "Conta suspensa",
            description: "Sua conta foi suspensa. Entre em contato com o administrador.",
            variant: "destructive",
          });
          await logout();
          throw new Error('Sua conta foi banida. Entre em contato com o administrador.');
        }

        await supabase
          .from('profiles')
          .update({ last_login: new Date().toISOString() })
          .eq('id', currentUser.id);
          
        setUser(currentUser);
        await syncUsers();
      }
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error) {
        if (error.message.includes('banida')) {
          throw error;
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        } else {
          throw new Error('Falha ao fazer login');
        }
      } else {
        throw new Error('Falha ao fazer login');
      }
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      console.log('Attempting registration with email:', email);
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

      if (data.user) {
        console.log('Registration successful, user:', data.user.id);
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        const isFirstUser = count === 0 || countError;
        const userRole = isFirstUser ? 'admin' : 'user';

        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_banned: false,
              role: userRole,
              credits: 0
            }
          ]);

        if (profileError) throw profileError;

        try {
          await supabase.auth.updateUser({
            data: { 
              role: userRole 
            }
          });
          
          console.log(`Usuário registrado com role: ${userRole}`);
        } catch (roleError) {
          console.error('Erro ao definir role nos metadados:', roleError);
        }

        const newUser = await convertSupabaseUser(data.user);
        newUser.role = userRole;
        setUser(newUser);
        await syncUsers();
      }
    } catch (error) {
      console.error('Erro ao registrar:', error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Este email já está em uso');
        } else {
          throw new Error('Falha ao registrar usuário');
        }
      } else {
        throw new Error('Falha ao registrar usuário');
      }
    }
  };

  const deleteUser = (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id)
        .then(() => syncUsers());
        
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = (id: string, data: Partial<User>) => {
    try {
      const profileData: { 
        name?: string; 
        is_banned?: boolean;
        role?: string;
        credits?: number;
        active_plan?: string | null;
        plan_expiry_date?: string | null;
      } = {};
      
      if (data.name !== undefined) profileData.name = data.name;
      if (data.isBanned !== undefined) profileData.is_banned = data.isBanned;
      
      if (data.role !== undefined) {
        if (data.role === 'admin' || data.role === 'user') {
          profileData.role = data.role;
        } else {
          profileData.role = 'user';
          console.warn('Invalid role provided, defaulting to "user"');
        }
      }
      
      if (data.credits !== undefined) profileData.credits = data.credits;
      if (data.activePlan !== undefined) profileData.active_plan = data.activePlan?.id || null;
      if (data.planExpiryDate !== undefined) profileData.plan_expiry_date = data.planExpiryDate;
      
      if (Object.keys(profileData).length > 0) {
        supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id)
          .then(() => syncUsers());
      }
        
      if (data.role) {
        try {
          console.log(`Tentando atualizar role para: ${data.role}`);
          supabase.auth.updateUser({
            data: { role: data.role }
          });
        } catch (e) {
          console.error('Erro ao atualizar role:', e);
        }
      }
      
      const newUsers = users.map(u => 
        u.id === id ? { ...u, ...data } : u
      );
      setUsers(newUsers);

      if (user?.id === id && data.isBanned) {
        logout();
      } else if (user?.id === id) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Falha ao atualizar usuário');
    }
  };

  const getAllUsers = () => {
    return users;
  };

  const logout = async () => {
    await supabase.auth.signOut();
    setUser(null);
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
        refreshUserCredits
      }}
    >
      {isInitialized ? children : <div className="min-h-screen flex items-center justify-center">Carregando...</div>}
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
