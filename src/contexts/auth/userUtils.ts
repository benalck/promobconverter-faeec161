
import { supabase } from '@/integrations/supabase/client';
import { User as SupabaseUser } from '@supabase/supabase-js';
import { User } from './types';

export const convertSupabaseUser = async (supabaseUser: SupabaseUser): Promise<User> => {
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
      email: supabaseUser.email,
      role: userRole,
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLogin: supabaseUser.last_sign_in_at,
      isBanned: profile?.is_banned || false,
      credits: profile?.credits || 0
    };
  } catch (error) {
    console.error('Erro ao converter usuário do Supabase:', error);
    return {
      id: supabaseUser.id,
      name: supabaseUser.user_metadata?.name || 'Usuário',
      email: supabaseUser.email,
      role: 'user',
      createdAt: supabaseUser.created_at || new Date().toISOString(),
      lastLogin: supabaseUser.last_sign_in_at,
      credits: 0
    };
  }
};
