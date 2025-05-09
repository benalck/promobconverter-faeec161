
import { supabase } from "@/integrations/supabase/client";
import { User } from "./types";
import { transformUser, transformAppUserToDbUser } from "./userUtils";

export const useAuthManagement = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>
) => {
  const fetchAllUsers = async (): Promise<User[]> => {
    try {
      const { data, error } = await supabase.from("profiles").select("*");

      if (error) {
        console.error("Error fetching users:", error);
        return [];
      }

      if (!data) return [];

      // Map the database users to our User type
      const appUsers: User[] = data
        .map(dbUser => transformUser(dbUser))
        .filter((user): user is User => user !== null);

      setUsers(appUsers);
      return appUsers;
    } catch (error) {
      console.error("Error in fetchAllUsers:", error);
      return [];
    }
  };

  const deleteUser = async (userId: string) => {
    try {
      // First, delete from auth
      const { error: authError } = await supabase.auth.admin.deleteUser(userId);
      
      if (authError) {
        console.error("Error deleting user from auth:", authError);
        throw authError;
      }

      // Then delete from profiles
      const { error: profileError } = await supabase
        .from("profiles")
        .delete()
        .eq("id", userId);

      if (profileError) {
        console.error("Error deleting user profile:", profileError);
        throw profileError;
      }

      // Update local state
      setUsers(prevUsers => prevUsers.filter(user => user.id !== userId));
      
      return { success: true, message: "User deleted successfully" };
    } catch (error) {
      console.error("Error in deleteUser:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  const updateUserProfile = async (userId: string, userData: Partial<User>) => {
    try {
      // Convert User type to database format
      const dbData: Record<string, any> = {};
      
      if (userData.name !== undefined) dbData.name = userData.name;
      if (userData.email !== undefined) dbData.email = userData.email;
      if (userData.phone !== undefined) dbData.phone = userData.phone;
      if (userData.role !== undefined) dbData.role = userData.role;
      if (userData.isBanned !== undefined) dbData.is_banned = userData.isBanned;
      if (userData.credits !== undefined) dbData.credits = userData.credits;
      if (userData.activePlan !== undefined) dbData.active_plan = userData.activePlan;
      if (userData.planExpiryDate !== undefined) dbData.plan_expiry_date = userData.planExpiryDate;
      
      // Add updated_at timestamp
      dbData.updated_at = new Date();

      // Update in database
      const { data, error } = await supabase
        .from("profiles")
        .update(dbData)
        .eq("id", userId)
        .select()
        .single();

      if (error) {
        console.error("Error updating user:", error);
        throw error;
      }

      // Convert back to User type
      const updatedUser = transformUser(data);
      
      // Update users list
      setUsers(prevUsers =>
        prevUsers.map(user => (user.id === userId ? { ...user, ...userData } : user))
      );

      // If this is the current user, update the current user state
      const currentUser = await supabase.auth.getUser();
      if (currentUser.data?.user?.id === userId) {
        setUser(prevUser => prevUser ? { ...prevUser, ...userData } : null);
      }

      return { success: true, user: updatedUser };
    } catch (error) {
      console.error("Error in updateUserProfile:", error);
      return {
        success: false,
        message: error instanceof Error ? error.message : "Unknown error occurred"
      };
    }
  };

  const banUser = async (userId: string, ban: boolean) => {
    return updateUserProfile(userId, { isBanned: ban });
  };

  const changeUserRole = async (userId: string, role: "user" | "admin" | "ceo") => {
    return updateUserProfile(userId, { role });
  };

  return {
    fetchAllUsers,
    deleteUser,
    updateUserProfile,
    banUser,
    changeUserRole
  };
};
