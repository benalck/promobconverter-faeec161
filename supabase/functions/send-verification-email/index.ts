
import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { Resend } from "npm:resend@2.0.0";

const resend = new Resend(Deno.env.get("RESEND_API_KEY"));

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

interface VerificationEmailRequest {
  email: string;
  name: string;
  code: string;
}

const handler = async (req: Request): Promise<Response> => {
  // Handle CORS preflight requests
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { email, name, code }: VerificationEmailRequest = await req.json();

    console.log(`Sending verification email to ${email} with code ${code}`);

    const emailResponse = await resend.emails.send({
      from: "Conversor XML para Excel <onboarding@resend.dev>",
      to: [email],
      subject: "Verifique seu email - Conversor XML para Excel",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e0e0e0; border-radius: 5px;">
          <div style="text-align: center; margin-bottom: 20px;">
            <h1 style="color: #4f46e5;">Conversor XML para Excel</h1>
          </div>
          <div style="margin-bottom: 30px;">
            <h2 style="color: #333;">Olá ${name},</h2>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Obrigado por se cadastrar no nosso sistema de conversão de XML para Excel. Para completar seu cadastro, por favor use o código de verificação abaixo:
            </p>
            <div style="background-color: #f5f5f5; padding: 15px; text-align: center; border-radius: 5px; margin: 20px 0;">
              <h2 style="font-family: monospace; letter-spacing: 5px; font-size: 24px; margin: 0; color: #4f46e5;">${code}</h2>
            </div>
            <p style="color: #555; font-size: 16px; line-height: 1.5;">
              Este código é válido por 30 minutos. Se você não solicitou este código, por favor ignore este email.
            </p>
          </div>
          <div style="border-top: 1px solid #e0e0e0; padding-top: 20px; color: #888; font-size: 12px;">
            <p>© ${new Date().getFullYear()} XML Excel Wizard. Todos os direitos reservados.</p>
          </div>
        </div>
      `,
    });

    console.log("Email sent successfully:", emailResponse);

    return new Response(JSON.stringify(emailResponse), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
        ...corsHeaders,
      },
    });
  } catch (error: any) {
    console.error("Error in send-verification-email function:", error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { "Content-Type": "application/json", ...corsHeaders },
      }
    );
  }
};

serve(handler);
