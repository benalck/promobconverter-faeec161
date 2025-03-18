
import { useState } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Lock, Mail, User, EyeOff, Eye } from "lucide-react";
import HowItWorksButton from "@/components/HowItWorksButton";

export default function Register() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (isLoginMode) {
      // Login mode
      if (!email || !password) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }

      try {
        setIsLoading(true);
        await login(email, password);
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo à nossa aplicação de conversão.",
        });
        navigate("/");
      } catch (error) {
        if (error instanceof Error && error.message.includes('banida')) {
          // Isso será tratado pelo AuthContext
          throw error;
        } else {
          toast({
            title: "Erro ao fazer login",
            description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente.",
            variant: "destructive",
          });
        }
      } finally {
        setIsLoading(false);
      }
    } else {
      // Register mode
      if (!name || !email || !password || !confirmPassword) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos.",
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

      try {
        setIsLoading(true);
        await register(name, email, password);
        toast({
          title: "Conta criada com sucesso!",
          description: "Seu cadastro foi realizado. Bem-vindo à nossa aplicação.",
        });
        navigate("/");
      } catch (error) {
        toast({
          title: "Erro ao registrar",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
        {/* Banner lateral */}
        <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
          <div className="h-full flex flex-col justify-between">
            <div>
              <ShoppingBag className="h-12 w-12 mb-6" />
              <h1 className="text-3xl font-bold mb-2">Arquivo XML Promob para Plano de corte Excel</h1>
              <p className="text-white/80 mb-8">Transforme seus arquivos XML Promob em planos de corte Excel profissionais com apenas alguns cliques.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Fácil de Usar</h3>
                  <p className="text-sm text-white/70">Crie uma conta e comece a converter em segundos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Histórico de Conversões</h3>
                  <p className="text-sm text-white/70">Acompanhe todas as suas conversões anteriores</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-sm text-white/60">
              © {new Date().getFullYear()} XML Promob para Excel. Todos os direitos reservados.
            </div>
          </div>
        </div>
        
        {/* Formulário de cadastro/login */}
        <Card className="md:w-1/2 border-0 rounded-none shadow-none">
          <CardHeader className="pt-12 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">
              {isLoginMode ? "Acesse sua conta" : "Crie sua conta"}
            </CardTitle>
            <CardDescription>
              {isLoginMode 
                ? "Entre com suas credenciais para acessar o conversor" 
                : "Registre-se para acessar todos os recursos do conversor"}
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      disabled={isLoading}
                      className="pl-10"
                    />
                  </div>
                </div>
              )}
              
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
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="password">Senha</Label>
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
              </div>
              
              {!isLoginMode && (
                <div className="space-y-2">
                  <Label htmlFor="confirmPassword">Confirmar Senha</Label>
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
              )}
              
              <Button
                type="submit"
                className="w-full py-6 font-medium transition-all duration-300 bg-primary hover:bg-primary/90 mt-4"
                disabled={isLoading}
              >
                {isLoading 
                  ? (isLoginMode ? "Entrando..." : "Registrando...") 
                  : (isLoginMode ? "Entrar" : "Criar conta")}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-12">
            <p className="text-center text-sm text-gray-600">
              {isLoginMode ? (
                <>
                  Novo cliente?{" "}
                  <button 
                    type="button" 
                    onClick={() => setIsLoginMode(false)}
                    className="text-primary font-medium hover:underline"
                  >
                    Crie sua conta
                  </button>
                </>
              ) : (
                <>
                  Já tem uma conta?{" "}
                  <button 
                    type="button" 
                    onClick={() => setIsLoginMode(true)}
                    className="text-primary font-medium hover:underline"
                  >
                    Faça login
                  </button>
                </>
              )}
            </p>
            <HowItWorksButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
