// Configuração de autenticação admin baseada em Supabase
import { supabase } from '@/integrations/supabase/client';

export interface AdminAuthResult {
  success: boolean;
  error?: string;
  user?: any;
}

export const authenticateAdmin = async (email: string, password: string): Promise<AdminAuthResult> => {
  try {
    // Fazer login com Supabase
    const { data: authData, error: authError } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (authError || !authData.user) {
      return { success: false, error: authError?.message || 'Erro de autenticação' };
    }

    // Verificar se o usuário tem role de admin
    const { data: profile, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', authData.user.id)
      .single();

    if (profileError || !profile || profile.role !== 'admin') {
      // Fazer logout se não for admin
      await supabase.auth.signOut();
      return { success: false, error: 'Acesso negado. Apenas administradores podem acessar.' };
    }

    return { success: true, user: authData.user };
  } catch (error) {
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido' 
    };
  }
};

export const checkAdminAuth = async (): Promise<boolean> => {
  try {
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session?.user) {
      return false;
    }

    const { data: profile, error } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();

    return !error && profile?.role === 'admin';
  } catch {
    return false;
  }
};

export const logoutAdmin = async (): Promise<void> => {
  await supabase.auth.signOut();
};