import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Mail, CheckCircle2, XCircle } from "lucide-react";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";

export default function VerifyEmail() {
  const [isVerifying, setIsVerifying] = useState(true);
  const [isSuccess, setIsSuccess] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    const handleEmailVerification = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        
        if (!user) {
          setIsSuccess(false);
          setIsVerifying(false);
          return;
        }

        // Atualizar o status de verificação no perfil
        const { error: updateError } = await supabase
          .from('profiles')
          .update({ email_verified: true })
          .eq('id', user.id);

        if (updateError) {
          throw updateError;
        }

        setIsSuccess(true);
        toast({
          title: "Email verificado com sucesso!",
          description: "Sua conta está pronta para uso.",
        });

        // Redirecionar após 3 segundos
        setTimeout(() => {
          navigate("/");
        }, 3000);

      } catch (error) {
        console.error('Erro na verificação:', error);
        setIsSuccess(false);
        toast({
          title: "Erro na verificação",
          description: "Não foi possível verificar seu email. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsVerifying(false);
      }
    };

    handleEmailVerification();
  }, [navigate, toast]);

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
              <XCircle className="h-8 w-8 text-red-500" />
            )}
          </div>

          <div className="text-center space-y-2">
            <p className="text-gray-600">
              {isVerifying
                ? "Aguarde enquanto verificamos seu email..."
                : isSuccess
                  ? "Seu email foi verificado com sucesso! Você será redirecionado em alguns segundos."
                  : "Não foi possível verificar seu email. Por favor, tente novamente ou entre em contato com o suporte."}
            </p>
          </div>

          {!isVerifying && !isSuccess && (
            <Button
              onClick={() => navigate("/")}
              className="w-full"
            >
              Voltar para o início
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
 