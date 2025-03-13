
import { useAuth } from "@/contexts/AuthContext";
import { Coins } from "lucide-react";
import { useEffect, useState } from "react";

export default function UserCredits() {
  const { user } = useAuth();
  const [showNewCreditsMessage, setShowNewCreditsMessage] = useState(false);
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  
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

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="hidden md:flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
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
        <div className="absolute -bottom-12 right-0 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
          Seus créditos estão acabando!
        </div>
      )}
    </div>
  );
}
