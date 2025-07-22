import { useState, useEffect } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Lock, EyeOff, Eye } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

export default function ResetPassword() {
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const { toast } = useToast();

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/[a-z]/.test(password)) return "Senha deve conter pelo menos uma letra minúscula";
    if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos um número";
    if (!/[!@#$%^&*]/.test(password)) return "Senha deve conter pelo menos um caractere especial (!@#$%^&*)";
    return null;
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!password || !confirmPassword) {
      toast({
        title: "Campos obrigatórios",
        description: "Por favor, preencha todos os campos.",
        variant: "destructive",
      });
      return;
    }

    const passwordError = validatePassword(password);
    if (passwordError) {
      toast({
        title: "Senha inválida",
        description: passwordError,
        variant: "destructive",
      });
      return;
    }

    if (password !== confirmPassword) {
      toast({
        title: "Senhas diferentes",
        description: "As senhas não coincidem.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      const { error } = await supabase.auth.updateUser({
        password: password
      });

      if (error) {
        console.error("Erro do Supabase:", error);
        throw error;
      }
      
      toast({
        title: "Senha atualizada com sucesso!",
        description: "Sua senha foi redefinida. Você será redirecionado para o login.",
        variant: "default",
      });

      // Sign out após mudança de senha para forçar novo login
      await supabase.auth.signOut();

      // Redirecionar para login após sucesso
      setTimeout(() => {
        navigate("/register?isLoginMode=true");
      }, 2000);

    } catch (error: any) {
      console.error("Erro ao redefinir senha:", error);
      
      let errorMessage = "Não foi possível redefinir sua senha.";
      
      if (error?.message?.includes("session_not_found")) {
        errorMessage = "Sessão expirada. Solicite um novo link de recuperação.";
      } else if (error?.message?.includes("Invalid password")) {
        errorMessage = "Senha inválida. Verifique os critérios de segurança.";
      }
      
      toast({
        title: "Erro ao redefinir senha",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    // Verificar se há parâmetros de erro na URL
    const error = searchParams.get('error');
    const errorDescription = searchParams.get('error_description');
    const accessToken = searchParams.get('access_token');
    const refreshToken = searchParams.get('refresh_token');
    const type = searchParams.get('type');
    
    console.log("URL params:", { error, errorDescription, accessToken: !!accessToken, refreshToken: !!refreshToken, type });
    
    // Se há erro na URL, mostrar erro e redirecionar
    if (error) {
      console.error("Erro na URL:", error, errorDescription);
      toast({
        title: "Link inválido",
        description: errorDescription || "O link de recuperação é inválido ou expirou. Solicite um novo link.",
        variant: "destructive",
      });
      
      setTimeout(() => {
        navigate("/register?isLoginMode=true");
      }, 3000);
      return;
    }

    // Se há tokens de recuperação na URL, configurar a sessão do Supabase
    if (accessToken && refreshToken && type === 'recovery') {
      console.log("Configurando sessão de recuperação com tokens da URL");
      
      // Configurar a sessão do Supabase manualmente
      supabase.auth.setSession({
        access_token: accessToken,
        refresh_token: refreshToken
      }).then(({ data, error: sessionError }) => {
        if (sessionError) {
          console.error("Erro ao configurar sessão:", sessionError);
          toast({
            title: "Erro na sessão",
            description: "Não foi possível validar o link de recuperação. Tente novamente.",
            variant: "destructive",
          });
          setTimeout(() => {
            navigate("/register?isLoginMode=true");
          }, 3000);
        } else {
          console.log("Sessão de recuperação configurada com sucesso");
        }
      });
      return;
    }

    // Se não há tokens nem erro, verificar se já existe uma sessão válida
    const checkSession = async () => {
      const { data: { session }, error: sessionError } = await supabase.auth.getSession();
      console.log("Sessão atual:", { hasSession: !!session, sessionError });
      
      if (!session && !accessToken) {
        console.log("Nenhuma sessão ou tokens encontrados");
        toast({
          title: "Link expirado",
          description: "O link de recuperação expirou ou é inválido. Solicite um novo link.",
          variant: "destructive",
        });
        
        setTimeout(() => {
          navigate("/register?isLoginMode=true");
        }, 3000);
      }
    };

    // Se não há tokens na URL, verificar sessão existente
    if (!accessToken) {
      checkSession();
    }
  }, [searchParams, toast, navigate]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-4xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
        <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
          <div className="h-full flex flex-col justify-between">
            <div>
              <ShoppingBag className="h-12 w-12 mb-6" />
              <h1 className="text-3xl font-bold mb-2">Redefinir Senha</h1>
              <p className="text-white/80 mb-8">Crie uma nova senha segura para sua conta no conversor XML Promob para Excel</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Segurança</h3>
                  <p className="text-sm text-white/70">Sua nova senha deve ser forte e única</p>
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
              Nova Senha
            </CardTitle>
            <CardDescription>
              Digite sua nova senha para finalizar a recuperação
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="password">Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="password"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                  <button
                    type="button"
                    onClick={togglePasswordVisibility}
                    className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400"
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
                <p className="text-xs text-gray-500 mt-1">
                  A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.
                </p>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="confirmPassword">Confirmar Nova Senha</Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                  <Input
                    id="confirmPassword"
                    type={showPassword ? "text" : "password"}
                    placeholder="••••••••"
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              
              <div className="pt-4">
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
                      Redefinindo...
                    </>
                  ) : (
                    "Redefinir Senha"
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}