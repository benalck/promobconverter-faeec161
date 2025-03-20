
import { supabase } from "@/integrations/supabase/client";
import { User as SupabaseUser } from "@supabase/supabase-js";
import { Plan, User } from "./types";

export interface UserProfile {
  id: string;
  name: string;
  email: string;
  role: string;
  created_at: string;
  phone?: string;
}

export async function convertSupabaseUser(supabaseUser: SupabaseUser): Promise<User> {
  try {
    const { data: profile } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    let userRole: 'admin' | 'user' = 'user';
    
    if (profile?.role === 'admin') {
      userRole = 'admin';
    } else if (supabaseUser.user_metadata && supabaseUser.user_metadata.role === 'admin') {
      userRole = 'admin';
    }

    return {
      id: supabaseUser.id,
      name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
      email: supabaseUser.email || '',
      phone: profile?.phone || supabaseUser.user_metadata?.phone || '',
      role: userRole,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLogin: supabaseUser.last_sign_in_at || null,
      isBanned: profile?.is_banned || false,
      emailVerified: profile?.email_verified || false,
      credits: profile?.credits || 0,
      activePlan: null,
      planExpiryDate: profile?.plan_expiry_date || null
    };
  } catch (error) {
    console.error('Erro ao converter usuário do Supabase:', error);
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || 'Usuário',
      email: supabaseUser.email || '',
      phone: supabaseUser.user_metadata?.phone || '',
      role: 'user',
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLogin: supabaseUser.last_sign_in_at || null,
      isBanned: false,
      emailVerified: false,
      credits: 0,
      activePlan: null,
      planExpiryDate: null
    };
  }
}

export async function fetchUserProfile(user: User): Promise<UserProfile | null> {
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*, email:email')
    .eq('id', user.id)
    .single();

  if (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: user.email, // Use the email from the User object
    role: profile.role,
    created_at: profile.created_at,
    phone: user.phone
  };
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  // Filter out properties that don't exist in the profiles table
  const { email, ...validUpdates } = updates;
  
  const { data: profile, error } = await supabase
    .from('profiles')
    .update(validUpdates)
    .eq('id', userId)
    .select()
    .single();

  if (error) {
    console.error('Error updating user profile:', error);
    return null;
  }

  return {
    id: profile.id,
    name: profile.name,
    email: updates.email || '',
    role: profile.role,
    created_at: profile.created_at,
    phone: updates.phone
  };
}
