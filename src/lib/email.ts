
import { supabase } from '@/integrations/supabase/client';

export async function sendConfirmationEmail(email: string, redirectUrl: string) {
  try {
    console.log("Tentando enviar email para:", email);
    console.log("URL de redirecionamento original:", redirectUrl);
    
    // Garantir que estamos usando a URL base do site (sem caminhos adicionais)
    const siteUrl = window.location.origin;
    
    // Configurar o Supabase para usar a URL correta para redirecionamento
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: siteUrl
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
    console.log('URL de redirecionamento configurado:', siteUrl);
    
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
