import { useEffect, useState } from "react";
import { useNavigate, useLocation, useSearchParams, Link } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, XCircle, AlertTriangle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { sendConfirmationEmail } from "@/lib/email";

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const [isSendingNewEmail, setIsSendingNewEmail] = useState(false);
  const [userEmail, setUserEmail] = useState<string | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);
  const navigate = useNavigate();
  const location = useLocation();
  const [searchParams] = useSearchParams();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        console.log("Verificação de email iniciada");
        console.log("URL completa:", window.location.href);
        console.log("Pathname:", location.pathname);
        console.log("Search params:", Object.fromEntries(searchParams.entries()));
        console.log("Hash:", location.hash);
        
        // Verificar se há token no hash (formato do Supabase)
        let token_hash = null;
        let access_token = null;
        
        // Verificar parâmetros de erro primeiro
        const error = searchParams.get('error');
        const error_code = searchParams.get('error_code');
        const errorDescription = searchParams.get('error_description');
        
        if (error || error_code) {
          console.error("Erro detectado na URL:", error || error_code, errorDescription);
          setIsSuccess(false);
          setErrorMessage(errorDescription || 'Ocorreu um erro ao verificar seu email');
          setIsVerifying(false);
          
          // Se o erro for de link expirado, oferecer opção de reenvio
          if ((error === 'access_denied' || error_code === 'otp_expired') && 
              (errorDescription?.includes('expired') || errorDescription?.includes('invalid'))) {
            // Buscar o email do usuário atual
            const { data } = await supabase.auth.getSession();
            if (data.session?.user?.email) {
              setUserEmail(data.session.user.email);
            }
          }
          return;
        }
        
        // Verifica no hash para tokens no formato #access_token=...
        if (location.hash.includes('access_token')) {
          const hashParams = new URLSearchParams(location.hash.substring(1));
          access_token = hashParams.get('access_token');
          console.log("Access token encontrado no hash:", access_token ? "Sim (token oculto)" : "Não");
          
          if (access_token) {
            // Se temos um access_token, é um login ou confirmação bem-sucedida
            // Vamos atualizar a sessão com este token
            const { error } = await supabase.auth.setSession({
              access_token: access_token,
              refresh_token: hashParams.get('refresh_token') || '',
            });
            
            if (error) {
              console.error("Erro ao definir sessão:", error);
              throw error;
            }
            
            console.log("Sessão atualizada com token do hash");
          }
        }
        
        // Verificar se há token na query string (formato token_hash=...)
        token_hash = searchParams.get('token_hash');
        const type = searchParams.get('type');
        
        console.log("Token hash na query:", token_hash);
        console.log("Type na query:", type);
        
        // Se tiver token na URL, confirmar o email
        if (token_hash && type === 'email_confirmation') {
          console.log("Tentando verificar OTP com token_hash");
          
          const { error } = await supabase.auth.verifyOtp({
            token_hash,
            type: 'signup',
          });
          
          if (error) {
            console.error("Erro ao verificar OTP:", error);
            throw error;
          }
          
          console.log("OTP verificado com sucesso!");
        }
        
        // Obter usuário atual
        const { data: { user } } = await supabase.auth.getUser();
        
        console.log("Usuário atual:", user);
        
        if (!user) {
          console.error("Usuário não encontrado após verificação");
          setIsSuccess(false);
          setErrorMessage('Não foi possível verificar seu email. Usuário não encontrado.');
          setIsVerifying(false);
          return;
        }

        // Atualizar o status de verificação no perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', user.id);

        if (updateError) {
          console.error("Erro ao atualizar perfil:", updateError);
          // Não vamos falhar aqui, apenas logar o erro
        } else {
          console.log("Perfil atualizado com sucesso - email verificado");
        }

        setIsSuccess(true);
        toast({
          title: "Email verificado com sucesso!",
          description: "Sua conta está pronta para uso.",
          variant: "success",
        });

        // Guardar o email do usuário
        setUserEmail(user.email);

        // Redirecionar após 3 segundos para a página de login
        setTimeout(() => {
          navigate("/register?isLoginMode=true");
        }, 3000);

      } catch (error) {
        console.error('Erro na verificação:', error);
        setIsSuccess(false);
        let errorMsg = 'Não foi possível verificar seu email.';
        
        if (error instanceof Error) {
          if (error.message.includes('expired')) {
            errorMsg = 'O link de confirmação expirou. Por favor, solicite um novo email.';
          } else {
            errorMsg = error.message;
          }
        }
        
        setErrorMessage(errorMsg);
        toast({
          title: "Erro na verificação",
          description: errorMsg,
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate, toast, location, searchParams]);

  const handleResendConfirmation = async () => {
    if (!userEmail) {
      toast({
        title: "Email necessário",
        description: "Não foi possível identificar seu email. Por favor, faça login novamente.",
        variant: "destructive",
      });
      return;
    }

    setIsSendingNewEmail(true);
    try {
      const baseUrl = window.location.origin;
      await sendConfirmationEmail(userEmail, baseUrl);
      
      toast({
        title: "Email enviado",
        description: "Um novo link de confirmação foi enviado para seu email.",
        variant: "success",
      });
    } catch (error) {
      console.error("Erro ao reenviar email:", error);
      toast({
        title: "Erro ao enviar email",
        description: "Não foi possível enviar o email de confirmação. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsSendingNewEmail(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100 p-4">
      <Card className="w-full max-w-md">
        <CardHeader className="text-center">
          <CardTitle className="text-2xl font-bold">Verificação de Email</CardTitle>
          <CardDescription>
            {isVerifying
              ? "Verificando seu email..."
              : isSuccess
                ? "Email verificado com sucesso!"
                : "Falha na verificação do email"}
          </CardDescription>
        </CardHeader>
        <CardContent className="flex flex-col items-center space-y-6">
          <div className="w-16 h-16 flex items-center justify-center rounded-full bg-primary/10">
            {isVerifying ? (
              <Mail className="h-8 w-8 text-primary animate-pulse" />
            ) : isSuccess ? (
              <CheckCircle2 className="h-8 w-8 text-green-500" />
            ) : (
              <AlertTriangle className="h-8 w-8 text-amber-500" />
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600">
              {isVerifying
                ? "Aguarde enquanto verificamos seu email..."
                : isSuccess
                  ? "Seu email foi verificado com sucesso! Você será redirecionado para a página de login em alguns segundos."
                  : errorMessage || "Não foi possível verificar seu email. Por favor, tente novamente ou entre em contato com o suporte."}
            </p>
            
            {!isSuccess && !isVerifying && userEmail && (
              <div className="mt-4 p-3 bg-amber-50 border border-amber-100 rounded-md">
                <p className="text-sm text-amber-800 mb-2">
                  O link de confirmação pode ter expirado. Solicite um novo email de confirmação.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={isSendingNewEmail}
                  className="w-full text-sm mt-2"
                >
                  {isSendingNewEmail ? "Enviando..." : "Reenviar email de confirmação"}
                </Button>
              </div>
            )}
          </div>
        </CardContent>
        <CardFooter className="flex justify-center mt-4">
          {!isVerifying && (
            <Button
              onClick={() => navigate("/register?isLoginMode=true")}
              className="w-full"
            >
              {isSuccess ? "Ir para página de login agora" : "Voltar para o login"}
            </Button>
          )}
        </CardFooter>
      </Card>
    </div>
  );
}
