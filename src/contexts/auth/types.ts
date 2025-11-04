
import React from 'react';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  emailVerified?: boolean;
  credits?: number;
  activePlan?: Plan | null;
  planExpiryDate?: string | null;
}

export interface AuthContextType {
  user: User | null;
  isAuthenticated: boolean;
  isAdmin: boolean;
  users: User[];
  isInitialized: boolean;
  login: (email: string, password: string) => Promise<void>;
  register: (data: {
    name: string;
    email: string;
    phone: string;
    password: string;
  }) => Promise<{ success: boolean; message: string; }>;
  logout: () => Promise<void>;
  deleteUser: (userId: string) => Promise<void>;
  updateUser: (userId: string, updates: Partial<User>) => Promise<void>;
  getAllUsers: () => Promise<User[]>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
}
