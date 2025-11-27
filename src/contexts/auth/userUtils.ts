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
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', supabaseUser.id)
      .single();

    if (error) {
      throw error;
    }

    // Fetch user roles from user_roles table (secure approach)
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', supabaseUser.id);

    // Determine the primary role (CEO > admin > user)
    let userRole: 'admin' | 'user' | 'ceo' = 'user';
    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(r => r.role);
      if (roles.includes('ceo')) {
        userRole = 'ceo';
      } else if (roles.includes('admin')) {
        userRole = 'admin';
      }
    }

    return {
      id: supabaseUser.id,
      name: profile?.name || supabaseUser.user_metadata?.name || 'Usuário',
      email: supabaseUser.email || '',
      // Use phone from profile table first, then user_metadata
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
  try {
    const { data: profile, error } = await supabase
      .from('profiles')
      .select('*')
      .eq('id', user.id)
      .single();

    if (error) {
      console.error('Error fetching user profile:', error);
      return null;
    }

    // Fetch user roles from user_roles table
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', profile.id);

    let userRole: 'admin' | 'user' | 'ceo' = 'user';
    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(r => r.role);
      if (roles.includes('ceo')) {
        userRole = 'ceo';
      } else if (roles.includes('admin')) {
        userRole = 'admin';
      }
    }

    return {
      id: profile.id,
      name: profile.name || '',
      email: user.email, // Use the email from the User object
      role: userRole,
      created_at: profile.created_at || new Date().toISOString(),
      phone: profile.phone || user.phone // Use phone from profile first
    };
  } catch (error) {
    console.error('Error fetching user profile:', error);
    return null;
  }
}

export async function updateUserProfile(userId: string, updates: Partial<UserProfile>): Promise<UserProfile | null> {
  try {
    // Filter out properties that don't exist in the profiles table
    const { email, ...validUpdates } = updates; // Remove email from direct update to profiles table
    
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

    // Fetch the user's current role from user_roles table
    const { data: userRoles } = await supabase
      .from('user_roles')
      .select('role')
      .eq('user_id', userId);

    let userRole: 'admin' | 'user' | 'ceo' = 'user';
    if (userRoles && userRoles.length > 0) {
      const roles = userRoles.map(r => r.role);
      if (roles.includes('ceo')) {
        userRole = 'ceo';
      } else if (roles.includes('admin')) {
        userRole = 'admin';
      }
    }

    return {
      id: profile.id,
      name: profile.name || '',
      email: updates.email || '',
      role: userRole,
      created_at: profile.created_at || new Date().toISOString(),
      phone: profile.phone || ''
    };
  } catch (error) {
    console.error('Error updating user profile:', error);
    return null;
  }
}