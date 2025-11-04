
import { supabase } from '@/integrations/supabase/client';

export async function logout() {
  try {
    const { error } = await supabase.auth.signOut();
    if (error) {
      console.error('Erro ao fazer logout:', error);
      return { success: false, error: error.message };
    }
    return { success: true };
  } catch (error) {
    console.error('Erro ao fazer logout:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao fazer logout' 
    };
  }
}

export async function getSession() {
  try {
    const { data, error } = await supabase.auth.getSession();
    if (error) {
      console.error('Erro ao obter sessão:', error);
      return { success: false, error: error.message, session: null };
    }
    return { success: true, session: data.session };
  } catch (error) {
    console.error('Erro ao obter sessão:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Erro desconhecido ao obter sessão',
      session: null 
    };
  }
}
