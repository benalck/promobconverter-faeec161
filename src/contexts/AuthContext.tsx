
import React, {
  createContext,
  useState,
  useEffect,
  useContext,
  useCallback,
} from "react";
import { Session } from "@supabase/supabase-js";
import { User, AuthContextType } from "./auth/types";
import { transformUser, getCurrentUser } from "./auth/userUtils";
import { supabase } from "@/integrations/supabase/client";

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCEO, setIsCEO] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        const initialUser = await getCurrentUser();
        setUser(initialUser);
        setIsAuthenticated(!!initialUser);
        setIsAdmin(initialUser?.role === "admin");
        setIsCEO(initialUser?.role === "ceo" ? true : false);
      } catch (error) {
        console.error("Authentication initialization error:", error);
      } finally {
        setIsInitialized(true);
      }
    };

    initializeAuth();
    
    // Set up auth state change listener
    const { data: { subscription } } = supabase.auth.onAuthStateChange(
      async (event, session) => {
        if (event === 'SIGNED_IN' || event === 'TOKEN_REFRESHED') {
          const user = await getCurrentUser();
          setUser(user);
          setIsAuthenticated(!!user);
          setIsAdmin(user?.role === "admin" ? true : false);
          setIsCEO(user?.role === "ceo" ? true : false);
        } else if (event === 'SIGNED_OUT') {
          setUser(null);
          setIsAuthenticated(false);
          setIsAdmin(false);
          setIsCEO(false);
        }
      }
    );

    // Cleanup subscription on unmount
    return () => {
      subscription.unsubscribe();
    };
  }, []);

  useEffect(() => {
    setIsAuthenticated(!!user);
    setIsAdmin(user?.role === "admin" ? true : false);
    setIsCEO(user?.role === "ceo" ? true : false);
  }, [user]);

  const login = async (email: string, password: string) => {
    try {
      const { data, error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, message: error.message };
      }

      const loggedInUser = await getCurrentUser();
      setUser(loggedInUser);
      setIsAuthenticated(!!loggedInUser);
      setIsAdmin(loggedInUser?.role === "admin" ? true : false);
      setIsCEO(loggedInUser?.role === "ceo" ? true : false);

      return { success: true };
    } catch (error) {
      console.error("Login failed", error);
      return { success: false, message: 'Login failed' };
    }
  };

  const register = async (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => {
    try {
      const { data: authData, error: authError } = await supabase.auth.signUp({
        email: data.email,
        password: data.password,
        options: {
          data: {
            name: data.name,
            phone: data.phone,
          },
        },
      });

      if (authError) {
        console.error("Registration error:", authError);
        return { success: false, message: authError.message };
      }

      return { success: true };
    } catch (error) {
      console.error("Registration failed", error);
      return { success: false, message: 'Registration failed' };
    }
  };

  const logout = async () => {
    try {
      await supabase.auth.signOut();
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsCEO(false);
    } catch (error) {
      console.error("Logout error:", error);
    }
  };

  const deleteUser = async (id: string) => {
    try {
      await supabase.from("profiles").delete().eq("id", id);
      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error) {
      console.error("Error deleting user:", error);
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const { error } = await supabase
        .from("profiles")
        .update(data)
        .eq("id", id);

      if (error) {
        console.error("Error updating user:", error);
        throw error;
      }

      setUsers((prevUsers) =>
        prevUsers.map((user) => (user.id === id ? { ...user, ...data } : user))
      );

      // If updating the current user, also update the user state
      if (user?.id === id) {
        setUser({ ...user, ...data });
      }
    } catch (error) {
      console.error("Error updating user:", error);
    }
  };

  const getAllUsers = async () => {
    try {
      const { data, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      const transformedUsers = data.map((dbUser) => transformUser(dbUser)) as User[];
      setUsers(transformedUsers);
      return transformedUsers;
    } catch (error) {
      console.error("Error fetching users:", error);
      return [];
    }
  };

  const value = {
    user,
    users,
    isAuthenticated,
    isAdmin,
    isCEO,
    isInitialized,
    login,
    register,
    logout,
    deleteUser,
    updateUser,
    getAllUsers,
    setUser,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextType {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
