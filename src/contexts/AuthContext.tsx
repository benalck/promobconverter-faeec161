import React, { createContext, useContext, useState, useEffect } from 'react';

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
  logout: () => void;
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  getAllUsers: () => User[];
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    try {
      // Carregar usuário atual
      const storedUser = localStorage.getItem('user');
      if (storedUser) {
        const parsedUser = JSON.parse(storedUser);
        setUser(parsedUser);
      }

      // Carregar lista de usuários
      const storedUsers = localStorage.getItem('users');
      if (storedUsers) {
        const parsedUsers = JSON.parse(storedUsers);
        setUsers(parsedUsers);
      }
    } catch (error) {
      console.error('Erro ao carregar dados do localStorage:', error);
      // Em caso de erro, limpar os dados corrompidos
      localStorage.removeItem('user');
      localStorage.removeItem('users');
    } finally {
      setIsInitialized(true);
    }
  }, []);

  // Monitorar mudanças nos usuários para verificar banimento
  useEffect(() => {
    if (user) {
      const currentUser = users.find(u => u.id === user.id);
      if (currentUser?.isBanned) {
        // Se o usuário atual foi banido, fazer logout
        logout();
      }
    }
  }, [users, user]);

  const saveUsers = (newUsers: User[]) => {
    try {
      setUsers(newUsers);
      localStorage.setItem('users', JSON.stringify(newUsers));
    } catch (error) {
      console.error('Erro ao salvar usuários:', error);
      throw new Error('Falha ao salvar dados dos usuários');
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const foundUser = users.find(u => u.email === email);
      
      if (!foundUser) {
        throw new Error('Usuário não encontrado');
      }

      // Verificar se o usuário está banido
      if (foundUser.isBanned) {
        throw new Error('Usuário banido');
      }

      // Em um sistema real, você verificaria a senha aqui
      const updatedUser = {
        ...foundUser,
        lastLogin: new Date().toISOString()
      };

      // Atualizar o último login do usuário
      const updatedUsers = users.map(u => 
        u.id === updatedUser.id ? updatedUser : u
      );

      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      saveUsers(updatedUsers);
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error && error.message === 'Usuário banido') {
        throw new Error('Sua conta foi banida. Entre em contato com o administrador.');
      }
      throw new Error('Falha ao fazer login');
    }
  };

  const register = async (name: string, email: string, password: string) => {
    try {
      // Verificar se o email já existe
      if (users.some(u => u.email === email)) {
        throw new Error('Email já cadastrado');
      }

      const newUser: User = {
        id: Date.now().toString(),
        name,
        email,
        role: users.length === 0 ? 'admin' : 'user', // Primeiro usuário é admin
        createdAt: new Date().toISOString(),
        lastLogin: new Date().toISOString()
      };

      const newUsers = [...users, newUser];
      saveUsers(newUsers);
      setUser(newUser);
      localStorage.setItem('user', JSON.stringify(newUser));
    } catch (error) {
      console.error('Erro ao registrar:', error);
      throw new Error('Falha ao registrar usuário');
    }
  };

  const deleteUser = (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    const newUsers = users.filter(u => u.id !== id);
    saveUsers(newUsers);
  };

  const updateUser = (id: string, data: Partial<User>) => {
    const newUsers = users.map(u => 
      u.id === id ? { ...u, ...data } : u
    );
    saveUsers(newUsers);

    // Se o usuário atualizado for o atual e estiver sendo banido, fazer logout
    if (user?.id === id && data.isBanned) {
      logout();
    } else if (user?.id === id) {
      // Se não estiver sendo banido, atualizar o estado do usuário
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
    }
  };

  const getAllUsers = () => {
    return users;
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
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