
import React, { useCallback } from "react";
import { Coins } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/contexts/AuthContext";
import { useUserCreditsMessages } from "@/hooks/useUserCreditsMessages";

// Componentes de mensagem
import WelcomeMessage from "./credits/WelcomeMessage";
import LowCreditsWarning from "./credits/LowCreditsWarning";
import NoCreditsWarning from "./credits/NoCreditsWarning";

/**
 * Componente para exibir os créditos do usuário e mensagens relacionadas
 */
const UserCredits: React.FC = React.memo(() => {
  const { user } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Usar o hook personalizado para gerenciar mensagens
  const { 
    showNewCreditsMessage, 
    showLowCreditsWarning, 
    hasNoCredits 
  } = useUserCreditsMessages(user);
  
  // Handler para comprar créditos com useCallback para evitar recriações desnecessárias
  const handleBuyCredits = useCallback(() => {
    toast({
      title: "Redirecionando",
      description: "Você será redirecionado para a página de compra de créditos.",
    });
    navigate("/plans");
  }, [toast, navigate]);

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{user.credits}</span>
        <span className="text-xs text-primary/80">créditos</span>
      </div>
      
      {/* Renderização condicional de mensagens usando componentes extraídos */}
      {showNewCreditsMessage && <WelcomeMessage />}
      {showLowCreditsWarning && <LowCreditsWarning onBuyCredits={handleBuyCredits} />}
      {hasNoCredits && <NoCreditsWarning onBuyCredits={handleBuyCredits} />}
    </div>
  );
});

UserCredits.displayName = 'UserCredits';

export default UserCredits;
