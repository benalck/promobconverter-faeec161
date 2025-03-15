
import React, { createContext, useContext, useState, useEffect } from 'react';
import { User, AuthContextType } from './auth/types';
import { useToast } from '@/hooks/use-toast';
import { xanoAuth, xanoApi } from '@/lib/xano';

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [isInitialized, setIsInitialized] = useState(false);
  const [users, setUsers] = useState<User[]>([]);
  const { toast } = useToast();

  // Initialize auth state from Xano
  useEffect(() => {
    const initAuth = async () => {
      try {
        console.log("Initializing auth state from Xano");
        // Get current session from Xano
        const { data: { session } } = await xanoAuth.getSession();
        
        if (session) {
          console.log("Found existing session:", session);
          // Convert Xano user to our User format
          const userObj: User = {
            id: session.user.id,
            name: session.user.full_name || session.user.name || null,
            email: session.user.email,
            role: session.user.role || 'user',
            createdAt: session.user.created_at,
            isBanned: session.user.is_banned || false,
            credits: session.user.credits || 3,
            lastLogin: session.user.last_login || null
          };
          
          setUser(userObj);
          
          // If admin, sync users
          if (userObj.role === 'admin') {
            await syncUsers();
          }
        } else {
          console.log("No active session found");
        }
      } catch (error) {
        console.error("Error initializing auth:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initAuth();
  }, []);

  // Refresh user credits
  const refreshUserCredits = async () => {
    if (user) {
      try {
        const { data: { session } } = await xanoAuth.getSession();
        if (session && user) {
          setUser({ ...user, credits: session.user.credits });
        }
      } catch (error) {
        console.error("Error refreshing user credits:", error);
      }
    }
    return Promise.resolve();
  };

  // Sync users (for admin purposes)
  const syncUsers = async () => {
    if (user?.role === 'admin') {
      try {
        const response = await xanoApi.get('/users');
        const data = response.data;
        
        if (data) {
          const mappedUsers: User[] = data.map((profile: any) => ({
            id: profile.id,
            name: profile.full_name || profile.name,
            email: profile.email,
            role: profile.role,
            createdAt: profile.created_at,
            lastLogin: profile.last_login,
            isBanned: profile.is_banned,
            credits: profile.credits
          }));
          setUsers(mappedUsers);
        }
      } catch (error) {
        console.error("Error syncing users:", error);
      }
    }
    return Promise.resolve();
  };

  // Login with email and password
  const login = async (email: string, password: string): Promise<void> => {
    try {
      console.log("Starting login process for email:", email);
      const data = await xanoAuth.signIn(email, password);
      console.log("Login response:", data);
      
      if (data.user) {
        // Convert response to our User format
        const userObj: User = {
          id: data.user.id,
          name: data.user.full_name || data.user.name || null,
          email: data.user.email,
          role: data.user.role || 'user',
          createdAt: data.user.created_at,
          isBanned: data.user.is_banned || false,
          credits: data.user.credits || 3,
          lastLogin: data.user.last_login || null
        };
        
        setUser(userObj);
        console.log("User set in state:", userObj);
        
        // Update last login
        try {
          await xanoApi.put(`/users/${data.user.id}/lastlogin`, {
            last_login: new Date().toISOString()
          });
        } catch (err) {
          console.warn("Could not update last login time:", err);
        }
        
        // If admin, sync users
        if (userObj.role === 'admin') {
          await syncUsers();
        }
      } else {
        throw new Error("User data not found in response");
      }
    } catch (error: any) {
      console.error('Error signing in:', error);
      throw error;
    }
  };

  // Register a new user
  const register = async (name: string, email: string, password: string) => {
    try {
      console.log("Starting registration for:", { name, email });
      const data = await xanoAuth.signUp(email, password, {
        full_name: name,
        role: 'user',
        credits: 3,
        is_banned: false
      });
      
      console.log("Registration response:", data);
      return { email, name };
    } catch (error: any) {
      console.error('Error registering:', error);
      throw error;
    }
  };

  // Logout
  const logout = async () => {
    try {
      console.log("Starting logout process");
      await xanoAuth.signOut();
      setUser(null);
      console.log("User logged out successfully");
    } catch (error) {
      console.error('Error logging out:', error);
      throw error;
    }
  };

  // Delete a user (admin only)
  const deleteUser = async (id: string) => {
    if (user?.role !== 'admin') return;
    
    try {
      await xanoApi.delete(`/users/${id}`);
      await syncUsers();
    } catch (error) {
      console.error('Error deleting user:', error);
    }
  };

  // Update a user
  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      // Convert User object to Xano user structure
      const userData: any = {};
      
      if (data.name !== undefined) userData.full_name = data.name;
      if (data.role !== undefined) userData.role = data.role;
      if (data.isBanned !== undefined) userData.is_banned = data.isBanned;
      if (data.credits !== undefined) userData.credits = data.credits;
      
      await xanoAuth.updateProfile(id, userData);

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
