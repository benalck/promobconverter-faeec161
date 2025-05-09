
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  name: string;
  phone?: string;
  createdAt: string;
  lastLogin?: string;
  role: 'admin' | 'user' | 'ceo'; // Added 'ceo' role
  isBanned?: boolean;
  // Add missing properties
  credits?: number;
  emailVerified?: boolean;
  activePlan?: string | null;
  planExpiryDate?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  isCEO?: boolean; // Added CEO check
  users: User[];
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<{
    success: boolean;
    message?: string;
  }>;
  register: (data: {
    name: string;
    email: string;
    password: string;
    phone?: string;
  }) => Promise<{
    success: boolean;
    message?: string;
  }>;
  logout: () => Promise<void>;
  deleteUser: (id: string) => Promise<void>;
  updateUser: (id: string, data: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}

export type UserWithoutRole = Omit<User, 'role'>;
