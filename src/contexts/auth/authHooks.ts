
import { User } from './types';
import axios from 'axios';

// Definir a URL base da API
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-de-producao.com/api' 
  : 'http://localhost:5000/api';

export const useAuthentication = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  syncUsers: () => Promise<void>,
  addInitialCreditsIfNeeded: (userId: string) => Promise<void>
) => {
  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post(`${API_URL}/auth/login`, { email, password });
      
      if (response.data.user) {
        // Salvar token no localStorage
        localStorage.setItem('authToken', response.data.token);
        
        // Atualizar o usuário no contexto
        setUser(response.data.user);
        
        // Sincronizar usuários (para admins)
        await syncUsers();
      }
    } catch (error: any) {
      console.error('Erro ao fazer login:', error);
      
      if (error.response) {
        // Erros específicos retornados pelo backend
        if (error.response.data.message.includes('banida')) {
          throw new Error(error.response.data.message);
        } else if (error.response.data.message.includes('inválidos')) {
          throw new Error('Email ou senha inválidos');
        } else {
          throw new Error(error.response.data.message || 'Falha ao fazer login');
        }
      } else {
        throw new Error('Falha ao fazer login');
      }
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{email: string, name: string} | undefined> => {
    try {
      const response = await axios.post(`${API_URL}/auth/register`, { name, email, password });
      
      if (response.data) {
        return { email, name };
      }
    } catch (error: any) {
      console.error('Erro ao registrar:', error);
      
      if (error.response) {
        if (error.response.data.message.includes('já está em uso')) {
          throw new Error('Este email já está em uso');
        } else {
          throw new Error(error.response.data.message || 'Falha ao registrar usuário');
        }
      } else {
        throw new Error('Falha ao registrar usuário');
      }
    }
  };

  const logout = async () => {
    try {
      const token = localStorage.getItem('authToken');
      const sessionId = localStorage.getItem('sessionId');
      
      if (token) {
        // Chamar o endpoint de logout no backend (opcional)
        await axios.post(`${API_URL}/auth/logout`, { sessionId }, {
          headers: { Authorization: `Bearer ${token}` }
        });
      }
    } catch (error) {
      console.error('Erro ao fazer logout:', error);
    } finally {
      // Remover token e outros dados de autenticação
      localStorage.removeItem('authToken');
      localStorage.removeItem('sessionId');
      
      // Limpar o usuário no contexto
      setUser(null);
    }
  };

  return {
    login,
    register,
    logout
  };
};
