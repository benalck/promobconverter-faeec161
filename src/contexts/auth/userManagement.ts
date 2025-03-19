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
      const { data: supabaseUsers, error } = await supabase
        .from('profiles')
        .select('*, plans(*)');

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
          
          try {
            const { data: userData } = await supabase.auth.admin.getUserById(profile.id);
            userEmail = userData?.user?.email || null;
          } catch (error) {
            console.log('Erro ao buscar metadados do usuário:', error);
          }
          
          if (profile.role === 'admin') {
            userRole = 'admin';
          }
          
          formattedUsers.push({
            id: profile.id,
            name: profile.name,
            email: userEmail,
            role: userRole,
            createdAt: profile.created_at,
            lastLogin: profile.last_login || undefined,
            isBanned: profile.is_banned,
            credits: profile.credits || 0,
            activePlan: profile.plans || null,
            planExpiryDate: profile.plan_expiry_date || null
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

  const refreshUserCredits = async () => {
    if (!user) return;
    
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('*, plans(*)')
        .eq('id', user.id)
        .single();
        
      if (error) throw error;
      
      setUser(prevUser => {
        if (!prevUser) return null;
        return {
          ...prevUser,
          credits: profile?.credits || 0,
          activePlan: profile?.plans || null,
          planExpiryDate: profile?.plan_expiry_date || null
        };
      });
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
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
      console.error('Erro ao adicionar créditos iniciais:', error);
    }
  };

  const addExtraCredits = async (userId: string, credits: number) => {
    try {
      const { data: profile, error } = await supabase
        .from('profiles')
        .select('credits')
        .eq('id', userId)
        .single();
      
      if (error) throw error;
      
      const currentCredits = profile?.credits || 0;
      const newCredits = currentCredits + credits;
      
      const { error: updateError } = await supabase
        .from('profiles')
        .update({ credits: newCredits })
        .eq('id', userId);
        
      if (updateError) throw updateError;
      
      // Update local state
      if (user?.id === userId) {
        setUser({
          ...user,
          credits: newCredits
        });
      }
      
      const newUsers = users.map(u => 
        u.id === userId ? { ...u, credits: newCredits } : u
      );
      setUsers(newUsers);
      
      return newCredits;
    } catch (error) {
      console.error('Erro ao adicionar créditos extras:', error);
      throw new Error('Falha ao adicionar créditos extras');
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
      console.error('Erro ao excluir usuário:', error);
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
        active_plan?: string | null;
        plan_expiry_date?: string | null;
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
      if (data.activePlan !== undefined) profileData.active_plan = data.activePlan?.id || null;
      if (data.planExpiryDate !== undefined) profileData.plan_expiry_date = data.planExpiryDate;
      
      if (Object.keys(profileData).length > 0) {
        supabase
          .from('profiles')
          .update(profileData)
          .eq('id', id)
          .then(() => syncUsers());
      }
        
      if (data.role) {
        try {
          console.log(`Tentando atualizar role para: ${data.role}`);
          supabase.auth.updateUser({
            data: { role: data.role }
          });
        } catch (e) {
          console.error('Erro ao atualizar role:', e);
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
      console.error('Erro ao atualizar usuário:', error);
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
    getAllUsers,
    addExtraCredits
  };
};
