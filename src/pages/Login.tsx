
import { useState, useEffect } from "react";
import { useNavigate, Link } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { Card, CardContent, CardDescription, CardHeader, CardTitle, CardFooter } from "@/components/ui/card";
import BannedMessage from "@/components/BannedMessage";
import LoginForm from "@/components/LoginForm";
import LoginSidebar from "@/components/LoginSidebar";
import HowItWorksButton from "@/components/HowItWorksButton";

export default function Login() {
  const [pageLoaded, setPageLoaded] = useState(false);
  const [isBanned, setIsBanned] = useState(false);
  const { user } = useAuth();
  const navigate = useNavigate();

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
        navigate("/");
      }
    }
  }, [user, pageLoaded, navigate]);

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
      <div className="w-full max-w-5xl mx-auto flex flex-col md:flex-row shadow-xl rounded-xl overflow-hidden my-8">
        {/* Banner lateral */}
        <LoginSidebar />
        
        {/* Formulário de login */}
        <Card className="md:w-1/2 border-0 rounded-none shadow-none">
          <CardHeader className="pt-12 pb-6 text-center">
            <CardTitle className="text-2xl font-bold">Acesse sua conta</CardTitle>
            <CardDescription>
              Entre com suas credenciais para acessar o conversor
            </CardDescription>
          </CardHeader>
          <CardContent>
            <LoginForm />
          </CardContent>
          <CardFooter className="flex flex-col space-y-4 pb-12">
            <p className="text-center text-sm text-gray-600">
              Novo cliente?{" "}
              <Link to="/register" className="text-primary font-medium hover:underline">
                Crie sua conta
              </Link>
            </p>
            <HowItWorksButton />
          </CardFooter>
        </Card>
      </div>
    </div>
  );
}
