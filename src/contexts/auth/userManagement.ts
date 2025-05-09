
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';
import { useToast } from '@/hooks/use-toast';

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone?: string;
  last_login?: string;
  is_banned?: boolean;
}

export const useUserManagement = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  user: User | null,
  users: User[],
  logout: () => Promise<void>
) => {
  const { toast } = useToast();

  const syncUsers = async () => {
    try {
      console.log("Fetching all user profiles");
      // Fetch all user profiles from profiles table
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) {
        console.error("Error fetching profiles:", error);
        throw error;
      }

      if (!profilesData || profilesData.length === 0) {
        console.log("No profiles found");
        setUsers([]);
        return;
      }

      // Map the profile data to User objects
      const formattedUsers: User[] = profilesData.map(profile => {
        return {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '',  // Use optional chaining to handle potential undefined
          role: profile.role as 'admin' | 'user' | 'ceo', // Added 'ceo' role
          createdAt: profile.created_at,
          lastLogin: profile.last_login || undefined,
          isBanned: profile.is_banned || false
        };
      });

      setUsers(formattedUsers);
      console.log("Users synced successfully:", formattedUsers.length);
    } catch (error) {
      console.error('Error syncing users:', error);
      toast({
        variant: "destructive",
        title: "Erro na sincronização",
        description: "Não foi possível carregar a lista de usuários."
      });
    }
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      console.log(`Attempting to ban user with ID: ${id}`);
      // Mark user as banned instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id);
        
      if (error) {
        console.error("Error banning user:", error);
        throw error;
      }
      
      await syncUsers();
      
      toast({
        title: "Usuário desativado",
        description: "O usuário foi banido com sucesso."
      });
      
      return;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro ao excluir",
        description: "Falha ao desativar o usuário. Verifique suas permissões."
      });
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      console.log(`Updating user with ID: ${id}`, data);
      const profileData: { 
        name?: string; 
        is_banned?: boolean;
        role?: string;
        phone?: string;
      } = {};
      
      if (data.name !== undefined) profileData.name = data.name;
      if (data.isBanned !== undefined) profileData.is_banned = data.isBanned;
      if (data.phone !== undefined) profileData.phone = data.phone;
      
      if (data.role !== undefined) {
        if (data.role === 'admin' || data.role === 'user' || data.role === 'ceo') {
          profileData.role = data.role;
        } else {
          profileData.role = 'user';
          console.warn('Invalid role provided, defaulting to "user"');
        }
      }
      
      if (Object.keys(profileData).length > 0) {
        const { error } = await supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id);
          
        if (error) {
          console.error("Error updating user in profiles table:", error);
          throw error;
        }
        
        await syncUsers();
        
        toast({
          title: "Usuário atualizado",
          description: "As informações do usuário foram atualizadas com sucesso."
        });
      }
      
      // If the current user is being updated, update local state
      if (user?.id === id) {
        if (data.isBanned) {
          toast({
            variant: "destructive",
            title: "Sua conta foi banida",
            description: "Entre em contato com o administrador."
          });
          await logout();
        } else {
          setUser(prevUser => {
            if (!prevUser) return null;
            return { ...prevUser, ...data };
          });
        }
      }
      
      return;
    } catch (error) {
      console.error('Erro ao atualizar usuário:', error);
      toast({
        variant: "destructive",
        title: "Erro na atualização",
        description: "Não foi possível atualizar o usuário."
      });
      throw new Error('Falha ao atualizar usuário');
    }
  };

  const getAllUsers = async () => {
    return users;
  };

  return {
    syncUsers,
    deleteUser,
    updateUser,
    getAllUsers,
  };
};

// Get user profile from the profiles table
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
  try {
    console.log(`Fetching profile for user ID: ${userId}`);
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', userId)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    return {
      id: profile.id,
      name: profile.name || '',
      email: profile.email || '',
      role: profile.role || 'user',
      created_at: profile.created_at,
      phone: profile.phone || '',
      last_login: profile.last_login,
      is_banned: profile.is_banned
    };
  } catch (error) {
    console.error('Error in getUserProfile:', error);
    return null;
  }
}

// Create a new user profile
export async function createUserProfile(user: User, name: string): Promise<UserProfile | null> {
  try {
    console.log(`Creating profile for user: ${user.email} with name: ${name}`);
    const { data: profile, error } = await supabase
      .from('profiles')
      .insert([
        {
          id: user.id,
          name,
          email: user.email,
          role: 'user',
          is_banned: false,
          phone: user.phone || '' // Add phone field
        }
      ])
      .select()
      .single();

    if (error) {
      console.error('Error creating user profile:', error);
      return null;
    }

    console.log("Profile created successfully:", profile);
    return {
      id: profile.id,
      name: profile.name,
      email: user.email,
      role: profile.role,
      created_at: profile.created_at,
      phone: profile.phone || '',
      last_login: profile.last_login,
      is_banned: profile.is_banned
    };
  } catch (error) {
    console.error('Error in createUserProfile:', error);
    return null;
  }
}

// Update an existing user profile
export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Filter out properties that don't exist in the profiles table
    const { email, ...validUpdates } = updates;
    
    console.log(`Updating profile for user ID: ${userId}`, validUpdates);
    const { data: profile, error } = await supabase
      .from('profiles')
      .update(validUpdates)
      .eq('id', userId)
      .select()
      .single();

    if (error) {
      console.error('Error updating user profile:', error);
      return null;
    }

    console.log("Profile updated successfully:", profile);
    return {
      id: profile.id,
      name: profile.name,
      email: profile.email || '',
      role: profile.role,
      created_at: profile.created_at,
      phone: profile.phone || '',
      last_login: profile.last_login,
      is_banned: profile.is_banned
    };
  } catch (error) {
    console.error('Error in updateUserProfile:', error);
    return null;
  }
}

// Mark a user profile as deleted (soft delete)
export async function deleteUserProfile(userId: string): Promise<boolean> {
  try {
    console.log(`Marking user ${userId} as banned`);
    const { error } = await supabase
      .from('profiles')
      .update({ is_banned: true })
      .eq('id', userId);

    if (error) {
      console.error('Error soft-deleting user profile:', error);
      return false;
    }
    
    console.log(`User ${userId} marked as banned successfully`);
    return true;
  } catch (error) {
    console.error('Error in deleteUserProfile:', error);
    return false;
  }
}

// Hard delete a user profile (use with caution)
export async function hardDeleteUserProfile(userId: string): Promise<boolean> {
  try {
    console.log(`Hard deleting profile for user ID: ${userId}`);
    const { error } = await supabase
      .from('profiles')
      .delete()
      .eq('id', userId);

    if (error) {
      console.error('Error deleting user profile:', error);
      return false;
    }
    
    console.log(`User ${userId} profile deleted successfully`);
    return true;
  } catch (error) {
    console.error('Error in hardDeleteUserProfile:', error);
    return false;
  }
}

// Update user's last login timestamp
export async function updateLastLogin(userId: string): Promise<boolean> {
  try {
    console.log(`Updating last login for user ID: ${userId}`);
    const { error } = await supabase
      .from('profiles')
      .update({ last_login: new Date().toISOString() })
      .eq('id', userId);

    if (error) {
      console.error('Error updating last login:', error);
      return false;
    }
    
    console.log(`Last login updated for user ${userId}`);
    return true;
  } catch (error) {
    console.error('Error in updateLastLogin:', error);
    return false;
  }
}

export const userManagement = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile,
  hardDeleteUserProfile,
  updateLastLogin
};
