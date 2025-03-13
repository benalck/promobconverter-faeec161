
import React, { createContext, useContext, useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { useToast } from '@/hooks/use-toast';

interface User {
  id: string;
  name: string | null;
  email: string | null;
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
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Converte um usuário do Supabase para o formato interno do app
  const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
    try {
      // Buscar profile no Supabase
      const { data: profile } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', supabaseUser.id)
        .single();

      // Determinar a role (admin ou user)
      // Como o perfil pode não ter o campo role ainda, definimos um valor padrão
      let userRole: 'admin' | 'user' = 'user';
      
      // Se o perfil tiver um campo adicional 'role', tentamos usá-lo
      if (profile && typeof profile === 'object') {
        // @ts-ignore - Ignoramos o erro de tipagem aqui, pois estamos verificando em runtime
        if (profile.role === 'admin') {
          userRole = 'admin';
        }
      }

      return {
        id: supabaseUser.id,
        name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
        email: supabaseUser.email,
        role: userRole,
        createdAt: supabaseUser.created_at || new Date().toISOString(),
        lastLogin: supabaseUser.last_sign_in_at,
        isBanned: profile?.is_banned || false
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
      };
    }
  };

  // Função para sincronizar usuários locais com dados do Supabase
  const syncUsers = async () => {
    try {
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      // Converter para o formato interno da aplicação
      const formattedUsers = supabaseUsers.map(profile => {
        // Determinar role (admin ou user)
        let userRole: 'admin' | 'user' = 'user';
        
        // @ts-ignore - Verificamos em runtime
        if (profile.role === 'admin') {
          userRole = 'admin';
        }
        
        return {
          id: profile.id,
          name: profile.name,
          email: null, // Não temos o email no perfil
          role: userRole,
          createdAt: profile.created_at,
          lastLogin: profile.last_login || undefined,
          isBanned: profile.is_banned
        };
      });

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao sincronizar usuários:', error);
    }
  };

  useEffect(() => {
    const initialize = async () => {
      try {
        // Verificar se há sessão ativa
        const { data: session } = await supabase.auth.getSession();
        
        if (session.session?.user) {
          const currentUser = await convertSupabaseUser(session.session.user);
          setUser(currentUser);
          
          // Verificar se o usuário está banido
          if (currentUser.isBanned) {
            toast({
              title: "Conta suspensa",
              description: "Sua conta foi suspensa. Entre em contato com o administrador.",
              variant: "destructive",
            });
            await logout();
            return;
          }
        }

        // Sincronizar lista de usuários
        await syncUsers();
      } catch (error) {
        console.error('Erro na inicialização do AuthContext:', error);
      } finally {
        setIsInitialized(true);
      }
    };

    initialize();

    // Configurar listener para mudanças de autenticação
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
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      if (data.user) {
        const currentUser = await convertSupabaseUser(data.user);
        
        // Verificar banimento
        if (currentUser.isBanned) {
          toast({
            title: "Conta suspensa",
            description: "Sua conta foi suspensa. Entre em contato com o administrador.",
            variant: "destructive",
          });
          await logout();
          throw new Error('Sua conta foi banida. Entre em contato com o administrador.');
        }

        // Atualizar último login
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
      // Criar usuário no Supabase Auth
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
        // Verificar quantos usuários existem para determinar se é admin
        const { count, error: countError } = await supabase
          .from('profiles')
          .select('*', { count: 'exact', head: true });
          
        // O primeiro usuário registrado será admin
        const isFirstUser = count === 0 || countError;
        const userRole = isFirstUser ? 'admin' : 'user';

        // Criar perfil no Supabase
        const { error: profileError } = await supabase
          .from('profiles')
          .insert([
            {
              id: data.user.id,
              name,
              created_at: new Date().toISOString(),
              last_login: new Date().toISOString(),
              is_banned: false
            }
          ]);

        if (profileError) throw profileError;

        // Precisamos adicionar a role manualmente através de um update
        // já que o campo não existe no tipo profiles
        const { error: roleError } = await supabase.rpc('set_role', { 
          user_id: data.user.id, 
          user_role: userRole 
        }).catch(() => {
          // Se o RPC falhar, tentamos atualizar o perfil diretamente
          // @ts-ignore - Ignoramos erro de tipagem aqui
          return supabase
            .from('profiles')
            .update({ role: userRole })
            .eq('id', data.user.id);
        });

        if (roleError) console.error('Erro ao definir role:', roleError);

        const newUser = await convertSupabaseUser(data.user);
        newUser.role = userRole; // Garantir que a role esteja correta
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
      // Marcar como banido no Supabase
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
      // Atualizar no Supabase
      supabase
        .from('profiles')
        .update({
          name: data.name,
          role: data.role,
          is_banned: data.isBanned
        })
        .eq('id', id)
        .then(() => syncUsers());
        
      const newUsers = users.map(u => 
        u.id === id ? { ...u, ...data } : u
      );
      setUsers(newUsers);

      // Se o usuário atualizado for o atual e estiver sendo banido, fazer logout
      if (user?.id === id && data.isBanned) {
        logout();
      } else if (user?.id === id) {
        // Se não estiver sendo banido, atualizar o estado do usuário
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
