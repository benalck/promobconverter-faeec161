
import axios from 'axios';
import { User } from '@/contexts/auth/types';

// Definir a URL base da API
const API_URL = process.env.NODE_ENV === 'production' 
  ? 'https://sua-api-de-producao.com/api' 
  : 'http://localhost:5000/api';

// Configurar headers de autorização para requisições autenticadas
const authHeader = () => {
  const token = localStorage.getItem('authToken');
  return token ? { Authorization: `Bearer ${token}` } : {};
};

// Converter resposta do backend para formato User do frontend
export function convertToAppUser(user: any): User {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    role: user.role,
    createdAt: user.createdAt,
    lastLogin: user.lastLogin,
    isBanned: user.isBanned,
    credits: user.credits,
  };
}

// Registrar um novo usuário
export async function registerUser(userData: { 
  name: string; 
  email: string; 
  password: string;
  role?: 'admin' | 'user';
}): Promise<any> {
  try {
    const response = await axios.post(`${API_URL}/auth/register`, userData);
    return response.data;
  } catch (error: any) {
    if (error.response && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// Autenticar usuário
export async function loginUser(email: string, password: string): Promise<User> {
  try {
    const response = await axios.post(`${API_URL}/auth/login`, { email, password });
    
    // Salvar token
    localStorage.setItem('authToken', response.data.token);
    
    return convertToAppUser(response.data.user);
  } catch (error: any) {
    if (error.response && error.response.data.message) {
      throw new Error(error.response.data.message);
    }
    throw error;
  }
}

// Verificar sessão atual
export async function getCurrentUser(): Promise<User | null> {
  const token = localStorage.getItem('authToken');
  if (!token) return null;
  
  try {
    const response = await axios.get(`${API_URL}/auth/me`, {
      headers: authHeader()
    });
    
    return convertToAppUser(response.data.user);
  } catch (error) {
    console.error('Erro ao verificar usuário atual:', error);
    localStorage.removeItem('authToken');
    return null;
  }
}

// Fazer logout
export function logoutUser(): void {
  try {
    axios.post(`${API_URL}/auth/logout`, {}, {
      headers: authHeader()
    });
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
  } finally {
    localStorage.removeItem('authToken');
  }
}

// Obter todos os usuários (admin)
export async function getAllUsers(): Promise<User[]> {
  try {
    const response = await axios.get(`${API_URL}/users`, {
      headers: authHeader()
    });
    
    return response.data.map(convertToAppUser);
  } catch (error) {
    console.error('Erro ao buscar usuários:', error);
    return [];
  }
}

// Banir um usuário
export async function banUser(userId: string): Promise<User | null> {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/ban`, {}, {
      headers: authHeader()
    });
    
    return convertToAppUser(response.data);
  } catch (error) {
    console.error('Erro ao banir usuário:', error);
    return null;
  }
}

// Desbanir um usuário
export async function unbanUser(userId: string): Promise<User | null> {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}/unban`, {}, {
      headers: authHeader()
    });
    
    return convertToAppUser(response.data);
  } catch (error) {
    console.error('Erro ao desbanir usuário:', error);
    return null;
  }
}

// Atualizar um usuário
export async function updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): Promise<User | null> {
  try {
    const response = await axios.put(`${API_URL}/users/${userId}`, updates, {
      headers: authHeader()
    });
    
    return convertToAppUser(response.data);
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    return null;
  }
}

// Adicionar créditos a um usuário
export async function addCredits(userId: string, amount: number): Promise<User | null> {
  try {
    const response = await axios.post(`${API_URL}/users/${userId}/credits`, { amount }, {
      headers: authHeader()
    });
    
    return convertToAppUser(response.data);
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    return null;
  }
}
