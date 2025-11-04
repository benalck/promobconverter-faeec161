import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';
import { useToast } from '@/hooks/use-toast';
import { logAdminAction } from '@/utils/adminLogger'; // Import the new logger

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone?: string;
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
      // Fetch all user profiles from profiles table
      const { data: profilesData, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (!profilesData || profilesData.length === 0) {
        setUsers([]);
        return;
      }

      // Map the profile data to User objects
      const formattedUsers: User[] = profilesData.map(profile => {
        return {
          id: profile.id,
          name: profile.name || '',
          email: profile.email || '',
          phone: profile.phone || '', // Now fetching phone from profiles table
          role: profile.role as 'admin' | 'user' | 'ceo',
          createdAt: profile.created_at,
          lastLogin: profile.last_login || undefined,
          isBanned: profile.is_banned,
          credits: profile.credits || 0,
          emailVerified: profile.email_verified || false,
        };
      });

      setUsers(formattedUsers);
      console.log("Users synced successfully:", formattedUsers.length);
    } catch (error) {
      console.error('Error syncing users:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      // Mark user as banned instead of deleting
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id);
        
      if (error) throw error;
      
      await logAdminAction('ban_user', id, { reason: 'User marked as banned instead of deleted' });
      await syncUsers();
      
      return;
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = async (id: string, data: Partial<User>) => {
    try {
      const profileData: { 
        name?: string; 
        is_banned?: boolean;
        role?: 'admin' | 'user' | 'ceo';
        credits?: number;
        phone?: string;
      } = {};
      
      if (data.name !== undefined) profileData.name = data.name;
      if (data.isBanned !== undefined) profileData.is_banned = data.isBanned;
      if (data.credits !== undefined) profileData.credits = data.credits;
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
          
        if (error) throw error;
        
        // Log admin action for updates
        await logAdminAction('update_user_profile', id, { updates: data });
        await syncUsers();
      }
      
      // If the current user is being updated, update local state
      if (user?.id === id) {
        if (data.isBanned) {
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

// Simplified getUserProfile function that doesn't rely on admin privileges
export async function getUserProfile(userId: string): Promise<UserProfile | null> {
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
    role: profile.role as 'admin' | 'user' | 'ceo' || 'user',
    created_at: profile.created_at,
    phone: profile.phone || ''
  };
}

export async function createUserProfile(user: User, name: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        name,
        email: user.email,
        role: 'user',
        phone: user.phone || ''
      }
    ])
    .select()
    .single();

  if (error) {
    console.error('Error creating user profile:', error);
    return null;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: user.email,
    role: profile.role as 'admin' | 'user' | 'ceo',
    created_at: profile.created_at,
    phone: profile.phone || ''
  };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  // Filter out properties that don't exist in the profiles table
  const { email, ...validUpdates } = updates;
  
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

  return {
    id: profile.id,
    name: profile.name,
    email: profile.email || '',
    role: profile.role as 'admin' | 'user' | 'ceo',
    created_at: profile.created_at,
    phone: profile.phone || ''
  };
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  // Instead of deleting, we'll ban the user
  const { error } = await supabase
    .from('profiles')
    .update({ is_banned: true })
    .eq('id', userId);

  if (error) {
    console.error('Error banning user profile:', error);
    return false;
  }

  return true;
}

export const userManagement = {
  getUserProfile,
  createUserProfile,
  updateUserProfile,
  deleteUserProfile
};