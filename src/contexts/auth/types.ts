
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
  name: string | null;
  email: string | null;
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned?: boolean;
  credits: number;
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
  register: (userData: {
    name: string;
    email: string;
    password: string;
    credits?: number;
    role?: 'admin' | 'user';
  }) => Promise<void>;
  logout: () => Promise<void>;
  deleteUser: (id: string) => void;
  updateUser: (id: string, data: Partial<User>) => void;
  getAllUsers: () => User[];
  refreshUserCredits: () => Promise<void>;
  setUser: React.Dispatch<React.SetStateAction<User | null>>;
  addExtraCredits: (userId: string, extraCredits: number) => Promise<number | undefined>;
}
