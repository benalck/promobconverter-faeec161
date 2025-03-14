
import { User } from './types';

// Mock function to convert user data
export const convertUserData = (userData: any): User => {
  try {
    return {
      id: userData.id,
      name: userData.name || 'Usuário',
      email: userData.email,
      role: userData.role === 'admin' ? 'admin' : 'user',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: userData.lastLogin,
      isBanned: userData.isBanned || false,
      credits: userData.credits || 0
    };
  } catch (error) {
    console.error('Erro ao converter dados do usuário:', error);
    return {
      id: userData.id,
      name: userData.name || 'Usuário',
      email: userData.email,
      role: 'user',
      createdAt: userData.createdAt || new Date().toISOString(),
      lastLogin: userData.lastLogin,
      credits: 0
    };
  }
};
