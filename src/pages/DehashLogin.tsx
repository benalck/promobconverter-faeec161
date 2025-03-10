import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { getAdminConfig } from "@/utils/adminConfig";

export default function DehashLogin() {
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const navigate = useNavigate();
  const { toast } = useToast();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      const adminConfig = getAdminConfig();
      if (username === adminConfig.username && password === adminConfig.password) {
        // Salvar token de admin
        localStorage.setItem("adminToken", "true");
        toast({
          title: "Login realizado com sucesso!",
          description: "Bem-vindo ao painel administrativo.",
        });
        navigate("/dehash-admin");
      } else {
        throw new Error("Credenciais inválidas");
      }
    } catch (error) {
      toast({
        title: "Erro ao fazer login",
        description: "Credenciais de administrador inválidas.",
        variant: "destructive",
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-900">
      <Card className="w-full max-w-md mx-4 bg-gray-800 text-white border-gray-700">
        <CardHeader className="text-center space-y-2">
          <CardTitle className="text-2xl font-bold text-white">
            Acesso Administrativo
          </CardTitle>
          <CardDescription className="text-gray-400">
            Área restrita para administradores do sistema
          </CardDescription>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <Label htmlFor="username" className="text-gray-200">
                Usuário
              </Label>
              <Input
                id="username"
                value={username}
                onChange={(e) => setUsername(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="password" className="text-gray-200">
                Senha
              </Label>
              <Input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                className="bg-gray-700 border-gray-600 text-white"
                disabled={isLoading}
              />
            </div>
            <Button
              type="submit"
              className="w-full bg-red-600 hover:bg-red-700"
              disabled={isLoading}
            >
              {isLoading ? "Verificando..." : "Acessar"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
} 