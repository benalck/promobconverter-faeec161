
import { supabase } from '@/integrations/supabase/client';

export async function sendConfirmationEmail(email: string, redirectUrl: string) {
  try {
    // Verificar se a URL de redirecionamento está correta e não tem hash ou parâmetros extras
    const cleanRedirectUrl = new URL(redirectUrl).origin + '/verify';
    
    // Tentar enviar email de confirmação usando método apropriado
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: cleanRedirectUrl
      }
    });

    if (error) {
      console.error('Erro ao enviar email de confirmação:', error);
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Email de confirmação enviado com sucesso para:', email);
    console.log('URL de redirecionamento configurado:', cleanRedirectUrl);
    
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
