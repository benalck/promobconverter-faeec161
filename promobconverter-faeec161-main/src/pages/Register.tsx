import { useState, useEffect } from "react";
import { useNavigate, Link, useSearchParams } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { ShoppingBag, Lock, Mail, User, EyeOff, Eye, Phone } from "lucide-react";
import { formatPhoneNumber } from "@/lib/utils";
import { sendConfirmationEmail } from "@/lib/email";
import React from "react";

export default function Register() {
  const [isLoginMode, setIsLoginMode] = useState(false);
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [searchParams] = useSearchParams();
  const [hasEmailError, setHasEmailError] = useState(false);
  const { register, login } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  const loadingTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

  const clearLoadingTimeout = () => {
    if (loadingTimeoutRef.current) {
      clearTimeout(loadingTimeoutRef.current);
      loadingTimeoutRef.current = null;
    }
  };

  useEffect(() => {
    const loginModeParam = searchParams.get('isLoginMode');
    if (loginModeParam === 'true') {
      setIsLoginMode(true);
    }
    
    const errorCode = searchParams.get('error_code');
    const errorDescription = searchParams.get('error_description');
    
    if (errorCode === 'otp_expired' || (errorDescription && errorDescription.includes('link is invalid or has expired'))) {
      setHasEmailError(true);
      toast({
        title: "Link expirado",
        description: "O link de confirmação expirou ou é inválido. Por favor, faça login para receber um novo email.",
        variant: "destructive",
      });
      setIsLoginMode(true);
    }
  }, [searchParams, toast]);

  useEffect(() => {
    return () => {
      clearLoadingTimeout();
    };
  }, []);

  const validateName = (name: string) => {
    if (name.length < 3) return "Nome deve ter pelo menos 3 caracteres";
    if (!/^[A-Za-zÀ-ÖØ-öø-ÿ\s]+$/.test(name)) return "Nome deve conter apenas letras";
    if (name.split(' ').length < 2) return "Por favor, insira nome e sobrenome";
    return null;
  };

  const validateEmail = (email: string) => {
    const emailRegex = /^[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}$/;
    if (!emailRegex.test(email)) return "E-mail inválido";
    return null;
  };

  const validatePhone = (phone: string) => {
    const numbers = phone.replace(/\D/g, '');
    if (numbers.length !== 11) return "Telefone deve ter 11 números (DDD + 9 dígitos)";
    if (!/^[1-9]{2}9[0-9]{8}$/.test(numbers)) return "Formato de telefone inválido";
    return null;
  };

  const validatePassword = (password: string) => {
    if (password.length < 8) return "Senha deve ter pelo menos 8 caracteres";
    if (!/[A-Z]/.test(password)) return "Senha deve conter pelo menos uma letra maiúscula";
    if (!/[a-z]/.test(password)) return "Senha deve conter pelo menos uma letra minúscula";
    if (!/[0-9]/.test(password)) return "Senha deve conter pelo menos um número";
    if (!/[!@#$%^&*]/.test(password)) return "Senha deve conter pelo menos um caractere especial (!@#$%^&*)";
    return null;
  };

  const formatPhone = (value: string) => {
    let numbers = value.replace(/\D/g, '');
    
    numbers = numbers.slice(0, 11);
    
    let formatted = numbers;
    if (numbers.length > 0) formatted = '(' + formatted;
    if (numbers.length > 2) formatted = formatted.slice(0, 3) + ') ' + formatted.slice(3);
    if (numbers.length > 7) formatted = formatted.slice(0, 10) + '-' + formatted.slice(10);
    
    return formatted;
  };

  const handlePhoneChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const formatted = formatPhone(e.target.value);
    setPhone(formatted);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    clearLoadingTimeout();
    
    if (isLoginMode) {
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
      if (!name || !email || !phone || !password || !confirmPassword) {
        toast({
          title: "Campos obrigatórios",
          description: "Por favor, preencha todos os campos.",
          variant: "destructive",
        });
        return;
      }

      const nameError = validateName(name);
      if (nameError) {
        toast({
          title: "Nome inválido",
          description: nameError,
          variant: "destructive",
        });
        return;
      }

      const emailError = validateEmail(email);
      if (emailError) {
        toast({
          title: "E-mail inválido",
          description: emailError,
          variant: "destructive",
        });
        return;
      }

      const phoneError = validatePhone(phone);
      if (phoneError) {
        toast({
          title: "Telefone inválido",
          description: phoneError,
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

      try {
        setIsLoading(true);
        
        loadingTimeoutRef.current = setTimeout(() => {
          setIsLoading(false);
          toast({
            title: "Tempo limite excedido",
            description: "A operação está demorando mais do que o esperado. Por favor, tente novamente.",
            variant: "destructive",
          });
        }, 15000);
        
        const result = await register({
          name,
          email,
          phone,
          password
        });

        clearLoadingTimeout();

        if (result.success) {
          toast({
            title: "Conta criada com sucesso!",
            description: "Seu cadastro foi realizado com sucesso. Você já pode fazer login.",
            variant: "success",
          });

          setIsLoginMode(true);
          navigate("/register?isLoginMode=true");
        } else {
          toast({
            title: "Erro ao registrar",
            description: result.message || "Ocorreu um erro ao criar sua conta. Tente novamente.",
            variant: "destructive",
          });
        }
      } catch (error) {
        clearLoadingTimeout();
        
        console.error("Erro no registro:", error);
        toast({
          title: "Erro ao registrar",
          description: error instanceof Error ? error.message : "Ocorreu um erro ao criar sua conta. Tente novamente.",
          variant: "destructive",
        });
      } finally {
        clearLoadingTimeout();
        setIsLoading(false);
      }
    }
  };

  const togglePasswordVisibility = () => {
    setShowPassword(!showPassword);
  };

  const handleResendConfirmation = async () => {
    if (!email) {
      toast({
        title: "Email necessário",
        description: "Por favor, informe seu email para receber o link de confirmação.",
        variant: "destructive",
      });
      return;
    }

    setIsLoading(true);
    try {
      await sendConfirmationEmail(email, `${window.location.origin}/verify`);
      
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
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-5xl flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden">
        <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
          <div className="h-full flex flex-col justify-between">
            <div>
              <ShoppingBag className="h-12 w-12 mb-6" />
              <h1 className="text-3xl font-bold mb-2">XML Promob para Excel</h1>
              <p className="text-white/80 mb-8">Transforme arquivos XML Promob em planos de corte Excel com formatação profissional em segundos</p>
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
            
            {/* Mensagem de erro para link expirado */}
            {hasEmailError && (
              <div className="mt-4 p-3 bg-red-50 border border-red-100 rounded-md">
                <p className="text-sm text-red-800 mb-2">
                  O link de confirmação expirou ou é inválido.
                </p>
                <Button
                  variant="outline"
                  onClick={handleResendConfirmation}
                  disabled={isLoading}
                  className="w-full text-sm mt-2"
                >
                  {isLoading ? "Enviando..." : "Reenviar email de confirmação"}
                </Button>
              </div>
            )}
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {!isLoginMode && (
                <>
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

                  <div className="space-y-2">
                    <Label htmlFor="phone">Celular</Label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 h-4 w-4" />
                      <Input
                        id="phone"
                        placeholder="(99) 99999-9999"
                        value={phone}
                        onChange={handlePhoneChange}
                        disabled={isLoading}
                        className="pl-10"
                        maxLength={15}
                        type="tel"
                      />
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Digite seu número com DDD (Ex: 11999999999)
                    </p>
                  </div>
                </>
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
                {!isLoginMode && (
                  <p className="text-xs text-gray-500 mt-1">
                    A senha deve conter pelo menos 8 caracteres, incluindo maiúsculas, minúsculas, números e caracteres especiais.
                  </p>
                )}
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
              
              <div className="pt-2">
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
                      {isLoginMode ? "Entrando..." : "Registrando..."}
                    </>
                  ) : (
                    isLoginMode ? "Entrar" : "Registrar"
                  )}
                </Button>
              </div>
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
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
