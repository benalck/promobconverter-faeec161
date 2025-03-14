
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from './auth/types';
import { useToast } from '@/hooks/use-toast';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

// Mock users for demonstration purposes
const MOCK_USERS: User[] = [
  {
    id: '1',
    name: 'Admin User',
    email: 'admin@example.com',
    role: 'admin',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isBanned: false,
    credits: 100
  },
  {
    id: '2',
    name: 'Test User',
    email: 'user@example.com',
    role: 'user',
    createdAt: new Date().toISOString(),
    lastLogin: new Date().toISOString(),
    isBanned: false,
    credits: 10
  }
];

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>(MOCK_USERS);
  const [isInitialized, setIsInitialized] = useState(false);
  const { toast } = useToast();

  // Load user from localStorage on mount
  useEffect(() => {
    const initAuth = async () => {
      try {
        const storedUser = localStorage.getItem('user');
        
        if (storedUser) {
          setUser(JSON.parse(storedUser));
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Sync users (for admin purposes)
  const syncUsers = async () => {
    // In a real implementation, this would fetch users from an API
    console.log('Syncing users (mock)');
    return Promise.resolve();
  };

  // Refresh user credits
  const refreshUserCredits = async () => {
    if (!user) return;
    
    // In a real implementation, this would fetch the latest credits from an API
    console.log('Refreshing user credits (mock)');
    return Promise.resolve();
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      // Find user in mock data - in real implementation this would call an API
      const mockUser = MOCK_USERS.find(u => u.email === email);
      
      if (!mockUser || password !== 'password') { // mock password check
        throw new Error('Invalid email or password');
      }
      
      if (mockUser.isBanned) {
        toast({
          title: "Conta suspensa",
          description: "Sua conta foi suspensa. Entre em contato com o administrador.",
          variant: "destructive",
        });
        throw new Error("Conta suspensa");
      }
      
      setUser(mockUser);
      localStorage.setItem('user', JSON.stringify(mockUser));
      
      // Update last login
      mockUser.lastLogin = new Date().toISOString();
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw new Error(error.message || 'Failed to login');
    }
  };

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      // Check if user already exists
      if (MOCK_USERS.some(u => u.email === email)) {
        throw new Error('Email already in use');
      }
      
      // In a real implementation, this would create a user in the database
      console.log('Registering user:', name, email);
      
      return { email, name };
    } catch (error: any) {
      console.error('Error registering:', error);
      throw new Error(error.message || 'Failed to register');
    }
  };

  // Logout
  const logout = async () => {
    try {
      localStorage.removeItem('user');
      setUser(null);
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Delete a user
  const deleteUser = (id: string) => {
    setUsers(prevUsers => prevUsers.filter(u => u.id !== id));
    
    // If the deleted user is the current user, log them out
    if (user?.id === id) {
      logout();
    }
  };

  // Update a user
  const updateUser = (id: string, data: Partial<User>) => {
    setUsers(prevUsers => 
      prevUsers.map(u => u.id === id ? { ...u, ...data } : u)
    );

    // If the updated user is the current user, update the user state
    if (user?.id === id) {
      const updatedUser = { ...user, ...data };
      setUser(updatedUser);
      localStorage.setItem('user', JSON.stringify(updatedUser));
      
      // If the user is being banned, log them out
      if (data.isBanned) {
        logout();
      }
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
