
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from './auth/types';
import { getAllUsers, getCurrentUser, loginUser, logoutUser, registerUser, updateUser, addCredits, banUser, unbanUser } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Sincronizar usuários
  const syncUsers = async () => {
    try {
      const allUsers = getAllUsers();
      setUsers(allUsers);
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao sincronizar usuários:', error);
      return Promise.reject(error);
    }
  };

  // Atualizar créditos do usuário atual
  const refreshUserCredits = async () => {
    if (!user) return Promise.resolve();
    
    try {
      const currentUser = getCurrentUser();
      if (currentUser) {
        setUser(currentUser);
      }
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
      return Promise.reject(error);
    }
  };

  // Adicionar créditos iniciais se necessário
  const addInitialCreditsIfNeeded = async (userId: string) => {
    try {
      // No nosso sistema local, os créditos iniciais já são adicionados ao criar o usuário
      return Promise.resolve();
    } catch (error) {
      console.error('Erro ao adicionar créditos iniciais:', error);
      return Promise.reject(error);
    }
  };

  // Login
  const login = async (email: string, password: string) => {
    try {
      const loggedUser = loginUser(email, password);
      setUser(loggedUser);
      await syncUsers();
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Falha ao fazer login');
      }
    }
  };

  // Registro
  const register = async (name: string, email: string, password: string) => {
    try {
      registerUser({ name, email, password });
      return { email, name };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      if (error instanceof Error) {
        throw error;
      } else {
        throw new Error('Falha ao registrar usuário');
      }
    }
  };

  // Logout
  const logout = async () => {
    logoutUser();
    setUser(null);
  };

  // Excluir usuário (banir)
  const deleteUser = (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      const bannedUser = banUser(id);
      if (bannedUser) {
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === id ? { ...u, isBanned: true } : u
        ));
      }
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  // Atualizar usuário
  const userManagementUpdate = (id: string, data: Partial<User>) => {
    try {
      const updatedUser = updateUser(id, data);
      
      if (updatedUser) {
        // Atualizar lista de usuários
        setUsers(prevUsers => prevUsers.map(u => 
          u.id === id ? updatedUser : u
        ));
        
        // Se for o usuário atual, atualizar também o estado do usuário
        if (user?.id === id) {
          setUser(updatedUser);
          
          if (updatedUser.isBanned) {
            logout();
          }
        }
      }
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      throw new Error('Falha ao atualizar usuário');
    }
  };

  // Inicialização
  useEffect(() => {
    const initialize = async () => {
      try {
        console.log("AuthContext initializing...");
        const currentUser = getCurrentUser();
        
        if (currentUser) {
          console.log("User session found:", currentUser.id);
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
