import { supabase } from '@/integrations/supabase/client';

export async function sendConfirmationEmail(email: string, redirectUrl: string) {
  try {
    console.log("Tentando enviar email para:", email);
    
    // Garantir que a URL de redirecionamento seja absoluta
    let completeRedirectUrl = redirectUrl;
    if (!redirectUrl.startsWith('http')) {
      // Se for relativa, converter para absoluta usando o domínio atual
      completeRedirectUrl = window.location.origin + (redirectUrl.startsWith('/') ? '' : '/') + redirectUrl;
    }
    
    // Para diagnóstico
    console.log('Enviando email com redirecionamento para:', completeRedirectUrl);
    
    // Tentar enviar email de confirmação usando método apropriado
    const { error } = await supabase.auth.resend({
      type: 'signup',
      email: email,
      options: {
        emailRedirectTo: completeRedirectUrl
      }
    });

    if (error) {
      console.error('Erro ao enviar email de confirmação:', error);
      
      // Tentar método alternativo se o primeiro falhar
      if (error.message.includes('already confirmed') || error.message.includes('Email address not found')) {
        // Se o usuário já está confirmado ou email não encontrado, tentar método de recuperação
        const { error: resetError } = await supabase.auth.resetPasswordForEmail(email, {
          redirectTo: completeRedirectUrl
        });
        
        if (resetError) {
          return {
            success: false,
            error: `Tentativas de envio falharam: ${error.message} e ${resetError.message}`
          };
        }
        
        return {
          success: true,
          error: null
        };
      }
      
      return {
        success: false,
        error: error.message
      };
    }

    console.log('Email de confirmação enviado com sucesso para:', email);
    console.log('URL de redirecionamento configurado:', completeRedirectUrl);
    
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