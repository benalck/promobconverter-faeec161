
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import BannedMessage from "@/components/BannedMessage";
import { ShoppingBag, Lock, Mail, FileText, CheckCircle, DragDropIcon, Download, Shield, Settings } from "lucide-react";

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
        description: "Bem-vindo à nossa loja de conversão.",
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
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <p>Carregando...</p>
      </div>
    );
  }

  if (isBanned) {
    return <BannedMessage />;
  }

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="w-full max-w-7xl mx-auto flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden my-8">
        {/* Banner lateral */}
        <div className="hidden md:block md:w-1/2 bg-primary/90 p-12 text-white relative">
          <div className="h-full flex flex-col justify-between">
            <div>
              <ShoppingBag className="h-12 w-12 mb-6" />
              <h1 className="text-3xl font-bold mb-2">Conversor XML para Excel</h1>
              <p className="text-white/80 mb-8">Transforme seus arquivos XML em planilhas Excel profissionais com apenas alguns cliques.</p>
            </div>
            
            <div className="space-y-4">
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <ShoppingBag className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Simples e Rápido</h3>
                  <p className="text-sm text-white/70">Interface intuitiva para conversão em segundos</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <div className="bg-white/20 p-2 rounded-full">
                  <Lock className="h-5 w-5" />
                </div>
                <div>
                  <h3 className="font-medium">Seguro</h3>
                  <p className="text-sm text-white/70">Seus dados são processados localmente</p>
                </div>
              </div>
            </div>
            
            <div className="mt-12 text-sm text-white/60">
              © 2023 XML Excel Wizard. Todos os direitos reservados.
            </div>
          </div>
        </div>
        
        {/* Formulário de login */}
        <Card className="md:w-1/2 border-0 rounded-none shadow-none">
          <CardHeader className="pt-12 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o conversor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
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
                    type="password"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    disabled={isLoading}
                    className="pl-10"
                  />
                </div>
              </div>
              <Button
                type="submit"
                className="w-full py-6 font-medium transition-all duration-300 bg-primary hover:bg-primary/90"
                disabled={isLoading}
              >
                {isLoading ? "Entrando..." : "Entrar"}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-6">
            <p className="text-center text-sm text-gray-600">
              Novo cliente?{" "}
              <Link to="/registro" className="text-primary font-medium hover:underline">
                Crie sua conta
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>

      {/* Seção de recursos */}
      <div className="w-full max-w-7xl mx-auto px-4 py-12">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-800 mb-4">Conversão Simples, Resultados Perfeitos</h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Nossa interface intuitiva torna a transformação de dados XML em planilhas Excel formatadas simples e eficiente.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {/* Recurso 1 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <FileText className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Processamento XML</h3>
            <p className="text-gray-600">
              Analise estruturas XML complexas com extração precisa de elementos e atributos.
            </p>
          </div>
          
          {/* Recurso 2 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <CheckCircle className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Formatação Excel</h3>
            <p className="text-gray-600">
              Gere planilhas Excel perfeitamente formatadas com layouts de colunas personalizados.
            </p>
          </div>
          
          {/* Recurso 3 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <ShoppingBag className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Arrastar e Soltar</h3>
            <p className="text-gray-600">
              Simplesmente arraste e solte seus arquivos XML para conversão instantânea.
            </p>
          </div>
          
          {/* Recurso 4 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Download className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Download com Um Clique</h3>
            <p className="text-gray-600">
              Baixe seus arquivos XLSX convertidos instantaneamente com um único clique.
            </p>
          </div>
          
          {/* Recurso 5 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Shield className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Integridade de Dados</h3>
            <p className="text-gray-600">
              Mantenha a integridade completa dos dados durante todo o processo de conversão.
            </p>
          </div>
          
          {/* Recurso 6 */}
          <div className="bg-white p-6 rounded-xl shadow-md hover:shadow-lg transition-shadow duration-300">
            <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center mb-4">
              <Settings className="h-6 w-6 text-primary" />
            </div>
            <h3 className="text-xl font-semibold mb-2">Personalizável</h3>
            <p className="text-gray-600">
              Configure mapeamentos de colunas e formatação para atender às suas necessidades específicas.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
