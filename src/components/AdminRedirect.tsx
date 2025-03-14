
import { useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

export default function AdminRedirect() {
  const { isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();

  useEffect(() => {
    if (!isAuthenticated) {
      toast({
        title: "Acesso negado",
        description: "Você precisa estar logado para acessar esta página.",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }

    if (!isAdmin) {
      toast({
        title: "Acesso restrito",
        description: "Esta página é restrita para administradores.",
        variant: "destructive",
      });
      navigate("/");
      return;
    }

    navigate("/admin");
  }, [isAuthenticated, isAdmin, navigate, toast]);

  return (
    <div className="flex justify-center items-center h-40">
      <p className="text-gray-500">Redirecionando para a área administrativa...</p>
    </div>
  );
}
