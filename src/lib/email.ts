import { supabase } from '@/integrations/supabase/client';

export async function sendConfirmationEmail(email: string, redirectUrl: string) {
  try {
    // Tentar enviar email de confirmação usando método apropriado
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: redirectUrl
      }
    });

    if (error) {
      console.error('Erro ao enviar email de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }

    return {
      success: true,
      error: null
    };
  } catch (error) {
    console.error('Erro ao enviar email de confirmação:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Erro desconhecido'
    };
  }
}
