
import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { ArrowLeft, User, Mail, Lock, CheckCircle, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [validations, setValidations] = useState({
    minLength: false,
    hasNumber: false,
    hasSpecial: false
  });
  const navigate = useNavigate();
  const { register } = useAuth();
  const { toast } = useToast();

  // Validar a senha conforme o usuário digita
  const validatePassword = (pass: string) => {
    setValidations({
      minLength: pass.length >= 8,
      hasNumber: /\d/.test(pass),
      hasSpecial: /[!@#$%^&*(),.?":{}|<>]/.test(pass)
    });
  };

  const handlePasswordChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newPassword = e.target.value;
    setPassword(newPassword);
    validatePassword(newPassword);
  };

  const handleRegister = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (password !== confirmPassword) {
      setError("As senhas não coincidem");
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: "As senhas não coincidem. Verifique e tente novamente."
      });
      return;
    }

    if (!validations.minLength || !validations.hasNumber || !validations.hasSpecial) {
      setError("A senha não atende aos requisitos mínimos de segurança");
      toast({
        variant: "destructive",
        title: "Senha fraca",
        description: "A senha não atende aos requisitos mínimos de segurança."
      });
      return;
    }

    setIsLoading(true);

    try {
      await register(email, password, name);
      toast({
        title: "Cadastro realizado com sucesso!",
        description: "Seja bem-vindo ao PromobConverter. Verifique seu email para confirmar sua conta."
      });
      navigate("/verify");
    } catch (err) {
      console.error("Erro no registro:", err);
      setError(
        err instanceof Error
          ? err.message
          : "Ocorreu um erro durante o cadastro. Tente novamente mais tarde."
      );
      toast({
        variant: "destructive",
        title: "Erro no cadastro",
        description: err instanceof Error ? err.message : "Erro ao criar conta. Tente novamente mais tarde."
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-blue-50 to-white dark:from-gray-900 dark:to-gray-950 p-4">
      <div className="absolute inset-0 pointer-events-none overflow-hidden">
        <div className="absolute top-0 left-0 w-[500px] h-[500px] bg-blue-500/10 blur-[120px] -translate-x-1/2 -translate-y-1/2 rounded-full"></div>
        <div className="absolute bottom-0 right-0 w-[500px] h-[500px] bg-indigo-500/10 blur-[120px] translate-x-1/3 translate-y-1/3 rounded-full"></div>
      </div>
      
      <div className="w-full max-w-md animate-fade-in">
        <Link to="/" className="inline-flex items-center text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 mb-6 transition-colors">
          <ArrowLeft className="mr-2 h-4 w-4" />
          Voltar para a página inicial
        </Link>
        
        <Card className="border border-gray-200 dark:border-gray-800 shadow-xl">
          <CardHeader className="space-y-1">
            <div className="flex items-center justify-center mb-2">
              <div className="w-12 h-12 rounded-full bg-blue-100 dark:bg-blue-900/50 flex items-center justify-center">
                <User className="h-6 w-6 text-blue-600 dark:text-blue-400" />
              </div>
            </div>
            <CardTitle className="text-2xl font-bold text-center">Criar conta</CardTitle>
            <CardDescription className="text-center">
              Crie sua conta gratuita para acessar a plataforma
            </CardDescription>
          </CardHeader>
          
          <CardContent>
            {error && (
              <Alert variant="destructive" className="mb-6">
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}
            
            <form onSubmit={handleRegister}>
              <div className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="name">Nome completo</Label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="name"
                      placeholder="Seu nome completo"
                      className="pl-10 bg-white dark:bg-gray-900"
                      value={name}
                      onChange={(e) => setName(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="name"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <div className="relative">
                    <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="email"
                      type="email"
                      placeholder="seu@email.com"
                      className="pl-10 bg-white dark:bg-gray-900"
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      required
                      disabled={isLoading}
                      autoComplete="email"
                    />
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="password">Senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="password"
                      type="password"
                      placeholder="••••••••"
                      className="pl-10 bg-white dark:bg-gray-900"
                      value={password}
                      onChange={handlePasswordChange}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  <div className="pt-2">
                    <ul className="space-y-1 text-xs">
                      <li className="flex items-center">
                        {validations.minLength ? (
                          <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        )}
                        <span className={validations.minLength ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                          Mínimo de 8 caracteres
                        </span>
                      </li>
                      <li className="flex items-center">
                        {validations.hasNumber ? (
                          <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        )}
                        <span className={validations.hasNumber ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                          Ao menos um número
                        </span>
                      </li>
                      <li className="flex items-center">
                        {validations.hasSpecial ? (
                          <CheckCircle className="h-3.5 w-3.5 mr-2 text-green-500" />
                        ) : (
                          <AlertCircle className="h-3.5 w-3.5 mr-2 text-gray-400" />
                        )}
                        <span className={validations.hasSpecial ? "text-green-600 dark:text-green-400" : "text-gray-500"}>
                          Ao menos um caractere especial
                        </span>
                      </li>
                    </ul>
                  </div>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Confirme sua senha</Label>
                  <div className="relative">
                    <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400" />
                    <Input
                      id="confirm-password"
                      type="password"
                      placeholder="••••••••"
                      className={`
                        pl-10 bg-white dark:bg-gray-900
                        ${confirmPassword && password !== confirmPassword ? "border-red-500 dark:border-red-700" : ""}
                      `}
                      value={confirmPassword}
                      onChange={(e) => setConfirmPassword(e.target.value)}
                      required
                      disabled={isLoading}
                    />
                  </div>
                  {confirmPassword && password !== confirmPassword && (
                    <p className="text-xs text-red-500 mt-1">As senhas não coincidem</p>
                  )}
                </div>
                
                <Button 
                  type="submit" 
                  className="w-full gradient-cta font-medium"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Criando conta...
                    </>
                  ) : (
                    <>Criar conta</>
                  )}
                </Button>
              </div>
            </form>
          </CardContent>
          
          <CardFooter className="flex justify-center">
            <div className="text-center text-sm">
              <span className="text-gray-500 dark:text-gray-400">
                Já tem uma conta?{" "}
              </span>
              <Link 
                to="/login"
                className="text-blue-600 dark:text-blue-400 hover:text-blue-700 dark:hover:text-blue-300 font-medium"
              >
                Fazer login
              </Link>
            </div>
          </CardFooter>
        </Card>
      </div>
    </div>
  );
};

export default Register;
