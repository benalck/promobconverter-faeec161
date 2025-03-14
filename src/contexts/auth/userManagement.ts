
import { User } from './types';
import { getAllUsers as fetchAllUsers, addCredits, banUser as apiBanUser, unbanUser as apiUnbanUser, updateUser as apiUpdateUser } from '@/services/authService';
import { useToast } from '@/hooks/use-toast';
import axios from 'axios';

const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-de-producao.com/api' 
  : 'http://localhost:5000/api';

export const useUserManagement = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  setUsers: React.Dispatch<React.SetStateAction<User[]>>,
  user: User | null,
  users: User[],
  logout: () => Promise<void>
) => {
  const { toast } = useToast();
  
  // Header de autorização para requisições
  const authHeader = () => {
    const token = localStorage.getItem('authToken');
    return token ? { Authorization: `Bearer ${token}` } : {};
  };

  const syncUsers = async () => {
    try {
      if (!user || user.role !== 'admin') {
        // Apenas admins podem ver todos os usuários
        return;
      }
      
      console.log('Buscando usuários...');
      const allUsers = await fetchAllUsers();
      console.log('Usuários encontrados:', allUsers);
      
      setUsers(allUsers);
    } catch (error) {
      console.error('Erro ao sincronizar usuários:', error);
    }
  };

  const refreshUserCredits = async () => {
    if (!user) return;
    
    try {
      const response = await axios.get(`${API_URL}/auth/me`, {
        headers: authHeader()
      });
      
      if (response.data && response.data.user) {
        setUser(prevUser => {
          if (!prevUser) return null;
          return {
            ...prevUser,
            credits: response.data.user.credits || 0
          };
        });
      }
    } catch (error) {
      console.error('Erro ao atualizar créditos:', error);
    }
  };

  const addInitialCreditsIfNeeded = async (userId: string) => {
    try {
      // Verificar se o usuário já tem créditos
      const userToCheck = users.find(u => u.id === userId);
      
      if (userToCheck && userToCheck.credits === 0) {
        // Adicionar 3 créditos iniciais
        await addCredits(userId, 3);
        
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

  const deleteUser = (id: string) => {
    if (user?.id === id) {
      throw new Error('Não é possível excluir o usuário atual');
    }
    
    try {
      // No nosso sistema, "excluir" significa banir
      apiBanUser(id).then(() => syncUsers());
        
      // Atualizar a UI imediatamente
      const newUsers = users.map(u => 
        u.id === id ? { ...u, isBanned: true } : u
      );
      setUsers(newUsers);
    } catch (error) {
      console.error('Erro ao excluir usuário:', error);
      throw new Error('Falha ao excluir usuário');
    }
  };

  const updateUser = (id: string, data: Partial<User>) => {
    try {
      // Enviar atualização para o servidor
      apiUpdateUser(id, data).then(() => syncUsers());
      
      // Atualizar a UI imediatamente
      const newUsers = users.map(u => 
        u.id === id ? { ...u, ...data } : u
      );
      setUsers(newUsers);

      // Se for o usuário atual, atualizar também o estado do usuário
      if (user?.id === id) {
        const updatedUser = { ...user, ...data };
        setUser(updatedUser);
        
        if (updatedUser.isBanned) {
          logout();
        }
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
    getAllUsers
  };
};
