import { supabase } from "@/integrations/supabase/client";
import { AuthContextType, User } from "../AuthContext";
import { useState, useEffect, useCallback } from "react";
import { useNavigate } from "react-router-dom";
import { transformUser, transformAppUserToDbUser } from "./userUtils";

export const useAuthManagement = (): AuthContextType => {
  const [user, setUser] = useState<User | null>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isCEO, setIsCEO] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    const initializeAuth = async () => {
      const { data } = await supabase.auth.getSession();

      if (data?.session?.user) {
        const appUser = await transformUser(data.session.user);
        setUser(appUser);
        setIsAuthenticated(true);
        setIsAdmin(appUser?.role === "admin");
        setIsCEO(appUser?.role === "ceo");
      } else {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsCEO(false);
      }
      setIsInitialized(true);
    };

    initializeAuth();

    supabase.auth.onAuthStateChange(async (event, session) => {
      if (event === "SIGNED_IN" || event === "INITIAL_SESSION") {
        if (session?.user) {
          const appUser = await transformUser(session.user);
          setUser(appUser);
          setIsAuthenticated(true);
          setIsAdmin(appUser?.role === "admin");
          setIsCEO(appUser?.role === "ceo");
        }
      } else if (event === "SIGNED_OUT") {
        setUser(null);
        setIsAuthenticated(false);
        setIsAdmin(false);
        setIsCEO(false);
      }
    });
  }, [navigate]);

  const login = async (email: string, password: string) => {
    try {
      const { error } = await supabase.auth.signInWithPassword({
        email,
        password,
      });

      if (error) {
        console.error("Login error:", error);
        return { success: false, message: error.message };
      }

      // Fetch user data after successful login
      const { data } = await supabase.auth.getSession();
      if (data?.session?.user) {
        const appUser = await transformUser(data.session.user);
        setUser(appUser);
        setIsAuthenticated(true);
        setIsAdmin(appUser?.role === "admin");
        setIsCEO(appUser?.role === "ceo");
      }

      return { success: true };
    } catch (err) {
      console.error("Login failed", err);
      return { success: false, message: 'Login falhou. Verifique suas credenciais.' };
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
          emailRedirectTo: `${window.location.origin}/verify-email`,
        },
      });

      if (authError) {
        console.error("Registration error:", authError);
        return { success: false, message: authError.message };
      }

      if (authData.user) {
        const updates = {
          id: authData.user.id,
          name: data.name,
          email: data.email,
          phone: data.phone,
          updated_at: new Date(),
        };

        const { error: profileError } = await supabase
          .from("profiles")
          .upsert(updates, { returning: "minimal" });

        if (profileError) {
          console.error("Profile creation error:", profileError);
          return { success: false, message: profileError.message };
        }
      }

      return { success: true };
    } catch (err) {
      console.error("Registration failed", err);
      return { success: false, message: 'Erro ao registrar usuário.' };
    }
  };

  const logout = useCallback(async () => {
    try {
      const { error } = await supabase.auth.signOut();
      if (error) {
        console.error("Logout error:", error.message);
      }
      setUser(null);
      setIsAuthenticated(false);
      setIsAdmin(false);
      setIsCEO(false);
      navigate("/login");
    } catch (err) {
      console.error("Logout failed", err);
    }
  }, [navigate]);

  const getAllUsers = useCallback(async () => {
    try {
      const { data: dbUsers, error } = await supabase
        .from("profiles")
        .select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      const transformedUsers = dbUsers.map((dbUser) => transformUser(dbUser));
      setUsers(transformedUsers as User[]);
      return transformedUsers as User[];
    } catch (err) {
      console.error("Error fetching users:", err);
      return [];
    }
  }, []);

  const deleteUser = async (id: string) => {
    try {
      // Delete user from auth.users
      const { error: authError } = await supabase.auth.admin.deleteUser(id);

      if (authError) {
        console.error("Error deleting user from auth:", authError);
        throw authError; // Re-throw to prevent profile deletion
      }

      // If auth deletion is successful, proceed to delete the profile
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", id);

      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        throw profileError; // Re-throw to indicate failure
      }

      setUsers((prevUsers) => prevUsers.filter((user) => user.id !== id));
    } catch (error: any) {
      console.error("Error deleting user:", error.message);
      throw error; // Propagate the error to the caller
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const transformedData = transformAppUserToDbUser({
        ...user,
        ...data,
        id: id,
        email: user?.email || '',
        createdAt: user?.createdAt || new Date().toISOString(),
        role: data.role || user?.role || 'user'
      });

      const { error } = await supabase
        .from("profiles")
        .update(transformedData)
        .eq("id", id);

      if (error) {
        console.error("Error updating user:", error);
        return;
      }

      // Optimistically update the local state
      setUsers((prevUsers) =>
        prevUsers.map((existingUser) =>
          existingUser.id === id ? { ...existingUser, ...data } : existingUser
        )
      );

      // If the updated user is the current user, update the current user state
      if (user?.id === id) {
        setUser({ ...user, ...data } as User);
        setIsAdmin(data.role === "admin" || user?.role === "admin");
        setIsCEO(data.role === "ceo" || user?.role === "ceo");
      }
    } catch (err) {
      console.error("Error updating user:", err);
    }
  };

  return {
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
};
