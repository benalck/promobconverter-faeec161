import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Mail, ArrowLeft } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ForgotPassword() {
  const [email, setEmail] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [emailSent, setEmailSent] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  // Validação de email
  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "E-mail inválido";
    return null;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!email) {
      toast({
        title: "Campo obrigatório",
        description: "Por favor, informe seu e-mail.",
        variant: "destructive",
      });
      return;
    }

    // Validar formato do email
    const emailError = validateEmail(email);
    if (emailError) {
      toast({
        title: "E-mail inválido",
        description: emailError,
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.resetPasswordForEmail(email, {
        redirectTo: `${window.location.origin}/reset-password`
      });

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }
      
      // Sucesso - mostrar mensagem de confirmação
      setEmailSent(true);
      toast({
        title: "E-mail enviado com sucesso!",
        description: "Verifique sua caixa de entrada e spam. Clique no link para redefinir sua senha.",
        variant: "default",
      });
      
    } catch (error: any) {
      console.error("Erro ao enviar e-mail de recuperação:", error);
      
      let errorMessage = "Não foi possível enviar o e-mail de recuperação.";
      
      // Tratamento específico de erros
      if (error?.message?.includes("Invalid email")) {
        errorMessage = "E-mail inválido. Verifique o formato do e-mail.";
      } else if (error?.message?.includes("Email address not found")) {
        errorMessage = "E-mail não encontrado. Verifique se você possui uma conta cadastrada.";
      } else if (error?.message?.includes("Too many requests")) {
        errorMessage = "Muitas tentativas. Aguarde alguns minutos antes de tentar novamente.";
      } else if (error?.message?.includes("Rate limit")) {
        errorMessage = "Limite de tentativas atingido. Tente novamente em alguns minutos.";
      }
      
      toast({
        title: "Erro ao enviar e-mail",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleBackToLogin = () => {
    navigate("/register?isLoginMode=true");
  };

  const handleTryAgain = () => {
    setEmailSent(false);
    setEmail("");
  };

  if (emailSent) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
          <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
            <div className="h-full flex flex-col justify-between">
              <div>
                <ShoppingBag className="h-12 w-12 mb-6" />
                <h1 className="text-3xl font-bold mb-2">E-mail Enviado</h1>
                <p className="text-white/80 mb-8">Verifique sua caixa de entrada para redefinir sua senha</p>
              </div>
              
              <div className="space-y-4">
                <div className="flex items-start space-x-3">
                  <div className="bg-white/20 p-2 rounded-full">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="font-medium">Verifique sua caixa de entrada</h3>
                    <p className="text-sm text-white/70">O link de recuperação foi enviado para seu e-mail</p>
                  </div>
                </div>
              </div>
              
              <div className="mt-12 text-sm text-white/60">
                © {new Date().getFullYear()} XML Promob para Excel. Todos os direitos reservados.
              </div>
            </div>
          </div>
          
          <Card className="md:w-1/2 border-0 rounded-none shadow-none">
            <CardHeader className="pt-12 pb-6 text-center">
              <CardTitle className="text-2xl font-bold text-green-600">
                E-mail Enviado!
              </CardTitle>
              <CardDescription>
                Um e-mail com instruções para redefinir sua senha foi enviado para <strong>{email}</strong>
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-4 text-center">
                <div className="bg-green-50 border border-green-200 rounded-md p-4">
                  <Mail className="h-8 w-8 text-green-600 mx-auto mb-2" />
                  <p className="text-sm text-green-800 mb-2">
                    Verifique sua caixa de entrada e spam
                  </p>
                  <p className="text-xs text-green-700">
                    O link expira em 24 horas por segurança
                  </p>
                </div>

                <div className="space-y-3">
                  <Button 
                    onClick={handleBackToLogin}
                    className="w-full"
                  >
                    Voltar ao Login
                  </Button>
                  
                  <Button 
                    variant="outline"
                    onClick={handleTryAgain}
                    className="w-full"
                  >
                    Enviar para outro e-mail
                  </Button>
                </div>

                <div className="text-xs text-gray-500 mt-4">
                  <p>Não recebeu o e-mail? Verifique sua pasta de spam ou</p>
                  <button 
                    onClick={handleTryAgain}
                    className="text-primary hover:underline"
                  >
                    tente novamente
                  </button>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
        <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
          <div className="h-full flex flex-col justify-between">
            <div>
              <ShoppingBag className="h-12 w-12 mb-6" />
              <h1 className="text-3xl font-bold mb-2">Recuperar Senha</h1>
              <p className="text-white/80 mb-8">Digite seu e-mail para receber as instruções de recuperação de senha</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Mail className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Recuperação Segura</h3>
                  <p className="text-sm text-white/70">Enviaremos um link seguro para seu e-mail</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-sm text-white/60">
              © {new Date().getFullYear()} XML Promob para Excel. Todos os direitos reservados.
            </div>
          </div>
        </div>
        
        <Card className="md:w-1/2 border-0 rounded-none shadow-none">
          <CardHeader className="pt-12 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">
              Esqueci minha senha
            </CardTitle>
            <CardDescription>
              Digite seu e-mail para receber as instruções de recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email">E-mail</Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="email"
                    type="email"
                    placeholder="seu@email.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                    autoComplete="email"
                    autoFocus
                  />
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  Digite o e-mail da sua conta cadastrada
                </p>
              </div>
              
              <div className="pt-4 space-y-3">
                <Button 
                  type="submit" 
                  className="w-full" 
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <span className="mr-2">
                        <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                        </svg>
                      </span>
                      Enviando...
                    </>
                  ) : (
                    "Enviar instruções"
                  )}
                </Button>
                
                <Button 
                  type="button"
                  variant="outline" 
                  onClick={handleBackToLogin}
                  className="w-full"
                >
                  <ArrowLeft className="w-4 h-4 mr-2" />
                  Voltar ao login
                </Button>
              </div>
            </form>
            
            <div className="mt-6 text-center text-xs text-gray-500">
              <p>Lembrou da senha? <Link to="/register?isLoginMode=true" className="text-primary hover:underline">Fazer login</Link></p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}