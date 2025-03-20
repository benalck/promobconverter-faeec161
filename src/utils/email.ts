import { Resend } from 'resend';

const resend = new Resend(import.meta.env.VITE_RESEND_API_KEY);

export async function sendConfirmationEmail(email: string, confirmationUrl: string) {
  try {
    const { data, error } = await resend.emails.send({
      from: 'Conversor XML Promob <noreply@promobconverter.cloud>',
      to: email,
      subject: 'Confirme seu cadastro no Conversor XML Promob',
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px;">
          <h2>Confirme seu cadastro no Conversor XML Promob</h2>
          <p>Olá,</p>
          <p>Estamos felizes em ter você conosco! Para começar a usar nosso conversor, por favor, confirme seu email clicando no botão abaixo:</p>
          <div style="text-align: center; margin: 30px 0;">
            <a href="${confirmationUrl}" 
               style="background-color: #1a73e8; 
                      color: white; 
                      padding: 12px 30px; 
                      text-decoration: none; 
                      border-radius: 5px; 
                      font-weight: bold;
                      display: inline-block;">
              Confirmar meu Email
            </a>
          </div>
          <p>Se você não criou uma conta em nosso sistema, pode ignorar este email com segurança.</p>
          <div style="margin-top: 30px; text-align: center; color: #666;">
            <p>Atenciosamente,<br>Equipe Conversor XML Promob</p>
          </div>
        </div>
      `
    });

    if (error) {
      console.error('Erro ao enviar email:', error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error('Erro ao enviar email:', error);
    throw error;
  }
} 