import { User } from './types';

export const useAuthentication = (
  setUser: React.Dispatch<React.SetStateAction<User | null>>,
  syncUsers: () => Promise<void>,
  addInitialCreditsIfNeeded: (userId: string) => Promise<void>
) => {
  const login = async (email: string, password: string) => {
    try {
      // A implementação real está em authService.ts e é chamada pelo AuthContext
      // Esta função agora serve apenas como interface para manter compatibilidade
    } catch (error) {
      console.error('Erro ao fazer login:', error);
      if (error instanceof Error) {
        if (error.message.includes('banida')) {
          throw error;
        } else if (error.message.includes('Invalid login credentials')) {
          throw new Error('Email ou senha inválidos');
        } else {
          throw new Error('Falha ao fazer login');
        }
      } else {
        throw new Error('Falha ao fazer login');
      }
    }
  };

  const register = async (name: string, email: string, password: string): Promise<{email: string, name: string} | undefined> => {
    try {
      // A implementação real está em authService.ts e é chamada pelo AuthContext
      // Esta função agora serve apenas como interface para manter compatibilidade
      
      return { email, name };
    } catch (error) {
      console.error('Erro ao registrar:', error);
      if (error instanceof Error) {
        if (error.message.includes('duplicate key')) {
          throw new Error('Este email já está em uso');
        } else {
          throw new Error('Falha ao registrar usuário');
        }
      } else {
        throw new Error('Falha ao registrar usuário');
      }
    }
  };

  const logout = async () => {
    // A implementação real está em authService.ts e é chamada pelo AuthContext
    // Esta função agora serve apenas como interface para manter compatibilidade
  };

  return {
    login,
    register,
    logout
  };
};
