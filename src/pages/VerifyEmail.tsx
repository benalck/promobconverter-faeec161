import { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, CheckCircle } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

// Define the type for verification code response
interface VerificationCode {
  id: string;
  user_id: string;
  email: string;
  code: string;
  created_at: string;
}

// Define the type for user ID response
interface UserIdResponse {
  id: string;
}

export default function VerifyEmail() {
  const [isLoading, setIsLoading] = useState(false);
  const [code, setCode] = useState("");
  const [email, setEmail] = useState("");
  const [name, setName] = useState("");
  const [verificationSuccess, setVerificationSuccess] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  useEffect(() => {
    const searchParams = new URLSearchParams(location.search);
    const emailParam = searchParams.get("email");
    const nameParam = searchParams.get("name");
    
    if (emailParam) {
      setEmail(emailParam);
    }
    
    if (nameParam) {
      setName(nameParam);
    }
  }, [location]);
  
  const verifyCode = async () => {
    if (!code || code.length !== 6) {
      toast({
        title: "Código inválido",
        description: "Por favor, insira o código de 6 dígitos enviado ao seu email.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Use RPC to verify code
      const { data, error } = await supabase.rpc('verify_code', {
        p_email: email,
        p_code: code
      });
      
      if (error || !data) {
        console.error("Erro ao verificar código:", error);
        toast({
          title: "Código inválido",
          description: "O código informado é inválido ou expirou. Por favor, tente novamente.",
          variant: "destructive",
        });
        return;
      }
      
      // Check if code is expired (30 minutes)
      const verificationData = data as unknown as VerificationCode;
      const createdAt = new Date(verificationData.created_at);
      const now = new Date();
      const diffInMinutes = (now.getTime() - createdAt.getTime()) / (1000 * 60);
      
      if (diffInMinutes > 30) {
        toast({
          title: "Código expirado",
          description: "O código informado expirou. Por favor, solicite um novo código.",
          variant: "destructive",
        });
        return;
      }
      
      // Update user's email_verified status
      await supabase.rpc('update_email_verified_status', {
        p_user_id: verificationData.user_id
      });
      
      // Remove the verification code
      await supabase.rpc('delete_verification_code', {
        p_id: verificationData.id
      });
      
      setVerificationSuccess(true);
      
      toast({
        title: "Email verificado com sucesso!",
        description: "Sua conta foi verificada. Você já pode fazer login.",
      });
      
    } catch (error) {
      console.error("Erro na verificação:", error);
      toast({
        title: "Erro na verificação",
        description: "Ocorreu um erro ao verificar seu código. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  const handleResendCode = async () => {
    if (!email) {
      toast({
        title: "Email não encontrado",
        description: "Não foi possível identificar seu email. Por favor, tente novamente.",
        variant: "destructive",
      });
      return;
    }
    
    try {
      setIsLoading(true);
      
      // Generate a new 6-digit code
      const newCode = Math.floor(100000 + Math.random() * 900000).toString();
      
      // Get user_id from email
      const { data: userData, error: userError } = await supabase.rpc('get_user_id_by_email', {
        p_email: email
      });
      
      if (!userData || userError) {
        throw new Error("Usuário não encontrado");
      }
      
      const userIdData = userData as unknown as UserIdResponse;
      
      // Delete any existing codes
      await supabase.rpc('delete_verification_codes_by_email', {
        p_email: email
      });
      
      // Store new code
      await supabase.rpc('insert_verification_code', {
        p_user_id: userIdData.id,
        p_email: email,
        p_code: newCode
      });
      
      // Send email with code
      const response = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/send-verification-email`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
        },
        body: JSON.stringify({
          email,
          name,
          code: newCode,
        }),
      });
      
      if (!response.ok) {
        throw new Error("Falha ao enviar email");
      }
      
      toast({
        title: "Código reenviado",
        description: "Um novo código de verificação foi enviado para seu email.",
      });
      
    } catch (error) {
      console.error("Erro ao reenviar código:", error);
      toast({
        title: "Erro ao reenviar código",
        description: "Ocorreu um erro ao enviar o novo código. Por favor, tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-md">
        <Card className="border shadow-lg">
          <CardHeader className="pt-8 pb-4 text-center">
            <div className="mx-auto mb-4">
              <ShoppingBag className="h-12 w-12 text-primary mx-auto" />
            </div>
            <CardTitle className="text-2xl font-bold">
              {verificationSuccess ? "Email Verificado" : "Verificação de Email"}
            </CardTitle>
            <CardDescription>
              {verificationSuccess 
                ? "Seu email foi verificado com sucesso!" 
                : "Digite o código de 6 dígitos enviado para seu email"}
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {verificationSuccess ? (
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center">
                  <CheckCircle className="h-16 w-16 text-green-500" />
                </div>
                <p className="text-gray-600">
                  Sua conta foi verificada com sucesso. Agora você pode acessar todos os recursos do nosso sistema de conversão XML para Excel.
                </p>
                <Button 
                  onClick={() => navigate("/login")}
                  className="w-full py-6 mt-4"
                >
                  Ir para o Login
                </Button>
              </div>
            ) : (
              <div className="space-y-6">
                <div className="space-y-2">
                  <div className="flex justify-center mb-6">
                    <InputOTP 
                      maxLength={6} 
                      value={code} 
                      onChange={setCode}
                      disabled={isLoading}
                      render={({ slots }) => (
                        <InputOTPGroup>
                          {slots.map((slot, index) => (
                            <InputOTPSlot key={index} {...slot} index={index} />
                          ))}
                        </InputOTPGroup>
                      )}
                    />
                  </div>
                  
                  <p className="text-center text-sm text-gray-500 mt-4">
                    Não recebeu o código? {" "}
                    <button
                      type="button"
                      onClick={handleResendCode}
                      disabled={isLoading}
                      className="text-primary hover:underline font-medium"
                    >
                      Reenviar código
                    </button>
                  </p>
                </div>
                
                <Button
                  onClick={verifyCode}
                  className="w-full py-6"
                  disabled={isLoading || code.length !== 6}
                >
                  {isLoading ? "Verificando..." : "Verificar Email"}
                </Button>
              </div>
            )}
          </CardContent>
          
          <CardFooter className="flex justify-center pb-8 pt-0">
            <p className="text-center text-sm text-gray-500">
              O código expira após 30 minutos
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
