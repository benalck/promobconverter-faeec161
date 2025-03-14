
import { useAuth } from "@/contexts/AuthContext";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";

export default function UserCredits() {
  const { user } = useAuth();
  const [showNewCreditsMessage, setShowNewCreditsMessage] = useState(false);
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  useEffect(() => {
    // Se usuário tem exatamente 3 créditos (quantidade inicial), mostrar mensagem de boas-vindas
    if (user && user.credits === 3) {
      setShowNewCreditsMessage(true);
      
      // Esconder a mensagem após 5 segundos
      const timer = setTimeout(() => {
        setShowNewCreditsMessage(false);
      }, 5000);
      
      return () => clearTimeout(timer);
    }
    
    // Se usuário tem menos de 3 créditos, mostrar aviso de créditos baixos
    if (user && user.credits > 0 && user.credits < 3) {
      setShowLowCreditsWarning(true);
      
      // Esconder a mensagem após 5 segundos
      const timer = setTimeout(() => {
        setShowLowCreditsWarning(false);
      }, 8000);
      
      return () => clearTimeout(timer);
    }
  }, [user?.credits]);

  const handleBuyCredits = () => {
    navigate("/creditos");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{user.credits}</span>
        <span className="text-xs text-primary/80">créditos</span>
      </div>
      {showNewCreditsMessage && (
        <div className="absolute -bottom-12 right-0 bg-primary/10 text-primary text-xs rounded-md px-3 py-2 whitespace-nowrap">
          Você recebeu 3 créditos gratuitos para começar!
        </div>
      )}
      {showLowCreditsWarning && (
        <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
          <p>Seus créditos estão acabando!</p>
          <Button 
            size="sm" 
            variant="outline" 
            className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800"
            onClick={handleBuyCredits}
          >
            Comprar mais créditos
          </Button>
        </div>
      )}
      {user.credits === 0 && (
        <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-red-50 text-red-700 border border-red-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
          <p>Você não tem mais créditos!</p>
          <Button 
            size="sm" 
            className="bg-red-600 hover:bg-red-700"
            onClick={handleBuyCredits}
          >
            Comprar créditos agora
          </Button>
        </div>
      )}
    </div>
  );
}
