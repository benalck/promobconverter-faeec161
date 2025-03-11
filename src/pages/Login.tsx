import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BannedMessage from "@/components/BannedMessage";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const { login, user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    // Garantir que a página só renderize após carregar o contexto de autenticação
    setPageLoaded(true);
  }, []);

  useEffect(() => {
    // Se o usuário já estiver logado, redirecionar para o conversor
    if (user && pageLoaded) {
      if (user.isBanned) {
        setIsBanned(true);
      } else {
        navigate("/converter");
      }
    }
  }, [user, pageLoaded, navigate]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
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
        description: "Bem-vindo ao sistema de conversão.",
      });
      navigate("/converter");
    } catch (error) {
      if (error instanceof Error && error.message.includes('banida')) {
        setIsBanned(true);
      } else {
        toast({
          title: "Erro ao fazer login",
          description: error instanceof Error ? error.message : "Verifique suas credenciais e tente novamente.",
          variant: "destructive",
        });
      }
      setIsLoading(false);
    }
  };

  if (!pageLoaded) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <p>Carregando...</p>
      </div>
    );
  }

  if (isBanned) {
    return <BannedMessage />;
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold">Login</CardTitle>
          <CardDescription>
            Entre com suas credenciais para acessar o sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="email">E-mail</Label>
              <Input
                id="email"
                type="email"
                placeholder="seu@email.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password">Senha</Label>
              <Input
                id="password"
                type="password"
                placeholder="••••••••"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full"
              disabled={isLoading}
            >
              {isLoading ? "Entrando..." : "Entrar"}
            </Button>
            <p className="text-center text-sm text-gray-600">
              Não tem uma conta?{" "}
              <Link to="/registro" className="text-primary hover:underline">
                Registre-se
              </Link>
            </p>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 