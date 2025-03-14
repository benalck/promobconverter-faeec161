
import { supabase } from '@/integrations/supabase/client';
import { User } from './types';
import { convertSupabaseUser } from './userUtils';
import { useToast } from '@/hooks/use-toast';

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
      console.log('Fetching profiles from Supabase...');
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*');

      if (error) {
        console.error('Error fetching profiles:', error);
        throw error;
      }

      console.log('Profiles data:', supabaseUsers);

      if (!supabaseUsers || supabaseUsers.length === 0) {
        console.log('No profiles found');
        setUsers([]);
        return;
      }

      const formattedUsers: User[] = [];
      
      for (const profile of supabaseUsers) {
        try {
          // Get the user email from auth.users
          const { data: authUser, error: authError } = await supabase.auth.admin.getUserById(profile.id);
          
          if (authError) {
            console.log('Error fetching auth user:', authError);
            // Continue with available data
          }
          
          const userEmail = authUser?.user?.email || null;
          console.log(`User ${profile.id} email:`, userEmail);
          
          let userRole: 'admin' | 'user' = 'user';
          if (profile.role === 'admin') {
            userRole = 'admin';
          }
          
          formattedUsers.push({
            id: profile.id,
            name: profile.name || 'Usuário',
            email: userEmail,
            role: userRole,
            createdAt: profile.created_at,
            lastLogin: profile.last_login || undefined,
            isBanned: profile.is_banned,
            credits: profile.credits || 0
          });
        } catch (error) {
          console.error('Error processing user:', error);
        }
      }

      console.log('Formatted users:', formattedUsers);
      setUsers(formattedUsers);
    } catch (error) {
      console.error('Error syncing users:', error);
    }
  };

  const refreshUserCredits = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          credits: profile?.credits || 0
        };
      });
    } catch (error) {
      console.error('Error updating credits:', error);
    }
  };

  const addInitialCreditsIfNeeded = async (userId: string) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('last_login, credits')
        .eq('id', userId)
        .single();
        
      if (error) throw error;
      
      if (profile && profile.credits === 0) {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ credits: 3 })
          .eq('id', userId);
          
        if (updateError) throw updateError;
        
        toast({
          title: "Boas-vindas!",
          description: "Você recebeu 3 créditos gratuitos para começar a usar o conversor.",
          variant: "default",
        });
        
        await refreshUserCredits();
      }
    } catch (error) {
      console.error('Error adding initial credits:', error);
    }
  };

  const deleteUser = (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      supabase
        .from('profiles')
        .update({ is_banned: true })
        .eq('id', id)
        .then(() => syncUsers());
        
      const newUsers = users.filter(u => u.id !== id);
      setUsers(newUsers);
    } catch (error) {
      console.error('Error deleting user:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = (id: string, data: Partial<User>) => {
    try {
      const profileData: { 
        name?: string; 
        is_banned?: boolean;
        role?: string;
        credits?: number;
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
      
      if (data.credits !== undefined) profileData.credits = data.credits;
      
      if (Object.keys(profileData).length > 0) {
        supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id)
          .then(() => syncUsers());
      }
        
      if (data.role) {
        try {
          console.log(`Trying to update role to: ${data.role}`);
          supabase.auth.updateUser({
            data: { role: data.role }
          }).then(response => {
            console.log("Role update response:", response);
          });
        } catch (e) {
          console.error('Error updating role:', e);
        }
      }
      
      const newUsers = users.map(u => 
        u.id === id ? { ...u, ...data } : u
      );
      setUsers(newUsers);

      if (user?.id === id && data.isBanned) {
        logout();
      } else if (user?.id === id) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
      }
    } catch (error) {
      console.error('Error updating user:', error);
      throw new Error('Falha ao atualizar usuário');
    }
  };

  const getAllUsers = () => {
    return users;
  };

  return {
    syncUsers,
    refreshUserCredits,
    addInitialCreditsIfNeeded,
    deleteUser,
    updateUser,
    getAllUsers
  };
};
