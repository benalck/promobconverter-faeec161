
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
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) throw error;

      if (!supabaseUsers || supabaseUsers.length === 0) {
        setUsers([]);
        return;
      }

      const formattedUsers: User[] = [];
      
      for (const profile of supabaseUsers) {
        try {
          let userEmail = null;
          let userRole: 'admin' | 'user' = 'user';
          let userPhone = '';
          
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
            userEmail = userData?.user?.email || null;
            userPhone = userData?.user?.user_metadata?.phone || '';
          } catch (error) {
            console.log('Erro ao buscar metadados do usuário:', error);
          }
          
          if (profile.role === 'admin') {
            userRole = 'admin';
          }
          
          formattedUsers.push({
            id: profile.id,
            name: profile.name,
            email: userEmail || '',
            phone: userPhone,
            role: userRole,
            createdAt: profile.created_at,
            lastLogin: profile.last_login || undefined,
            isBanned: profile.is_banned
          });
        } catch (error) {
          console.error('Erro ao processar usuário:', error);
        }
      }

      setUsers(formattedUsers);
    } catch (error) {
      console.error('Erro ao sincronizar usuários:', error);
    }
  };

  const deleteUser = async (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      const { error } = await supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id);
        
      if (error) throw error;
      
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
        role?: string;
      } = {};
      
      if (data.name !== undefined) profileData.name = data.name;
      if (data.isBanned !== undefined) profileData.is_banned = data.isBanned;
      
      if (data.role !== undefined) {
        if (data.role === 'admin' || data.role === 'user') {
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
        
        await syncUsers();
      }
        
      if (data.role) {
        try {
          console.log(`Tentando atualizar role para: ${data.role}`);
          await supabase.auth.updateUser({
            data: { role: data.role }
          });
        } catch (e) {
          console.error('Erro ao atualizar role:', e);
        }
      }
      
      if (user?.id === id && data.isBanned) {
        await logout();
      } else if (user?.id === id) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return { ...prevUser, ...data };
        });
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

  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const email = userData?.user?.email || '';

  return {
    id: profile.id,
    name: profile.name,
    email,
    role: profile.role,
    created_at: profile.created_at,
    phone: userData?.user?.user_metadata?.phone
  };
}

export async function createUserProfile(user: User, name: string): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .insert([
      {
        id: user.id,
        name,
        role: 'user',
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
    role: profile.role,
    created_at: profile.created_at,
    phone: user.phone
  };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  // Filter out properties that don't exist in the profiles table
  const { email, phone, ...validUpdates } = updates;
  
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

  // Retrieve user email from auth
  const { data: userData } = await supabase.auth.admin.getUserById(userId);
  const userEmail = userData?.user?.email || '';

  return {
    id: profile.id,
    name: profile.name,
    email: userEmail,
    role: profile.role,
    created_at: profile.created_at,
    phone: userData?.user?.user_metadata?.phone
  };
}

export async function deleteUserProfile(userId: string): Promise<boolean> {
  const { error } = await supabase
    .from('profiles')
    .delete()
    .eq('id', userId);

  if (error) {
    console.error('Error deleting user profile:', error);
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
