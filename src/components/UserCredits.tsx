
import { useAuth } from "@/contexts/AuthContext";
import { Coins } from "lucide-react";
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { Button } from "./ui/button";
import { useToast } from "@/hooks/use-toast";
import { useTimeout } from "@/hooks/useTimeout";

// Componente para mensagem de boas-vindas
const WelcomeMessage = () => (
  <div className="absolute -bottom-12 right-0 bg-primary/10 text-primary text-xs rounded-md px-3 py-2 whitespace-nowrap">
    Você recebeu 3 créditos gratuitos para começar!
  </div>
);

// Componente para aviso de créditos baixos
const LowCreditsWarning = ({ onBuyCredits }: { onBuyCredits: () => void }) => (
  <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
    <p>Seus créditos estão acabando!</p>
    <Button 
      size="sm" 
      variant="outline" 
      className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800"
      onClick={onBuyCredits}
    >
      Comprar mais créditos
    </Button>
  </div>
);

// Componente para aviso de créditos zerados
const NoCreditsWarning = ({ onBuyCredits }: { onBuyCredits: () => void }) => (
  <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-red-50 text-red-700 border border-red-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
    <p>Você não tem mais créditos!</p>
    <Button 
      size="sm" 
      className="bg-red-600 hover:bg-red-700"
      onClick={onBuyCredits}
    >
      Comprar créditos agora
    </Button>
  </div>
);

export default function UserCredits() {
  const { user } = useAuth();
  const [showNewCreditsMessage, setShowNewCreditsMessage] = useState(false);
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  const { toast } = useToast();
  const navigate = useNavigate();
  
  // Efeito para verificar a situação dos créditos
  useEffect(() => {
    if (!user) return;
    
    // Usuário com créditos iniciais (3)
    if (user.credits === 3) {
      setShowNewCreditsMessage(true);
    }
    
    // Usuário com poucos créditos (1-2)
    if (user.credits > 0 && user.credits < 3) {
      setShowLowCreditsWarning(true);
    }
  }, [user?.credits]);
  
  // Usar o hook personalizado para esconder a mensagem de boas-vindas
  useTimeout(
    () => setShowNewCreditsMessage(false),
    showNewCreditsMessage ? 5000 : null
  );
  
  // Usar o hook personalizado para esconder o aviso de poucos créditos
  useTimeout(
    () => setShowLowCreditsWarning(false),
    showLowCreditsWarning ? 8000 : null
  );

  const handleBuyCredits = () => {
    toast({
      title: "Redirecionando",
      description: "Você será redirecionado para a página de compra de créditos.",
    });
    navigate("/plans");
  };

  if (!user) return null;

  return (
    <div className="flex items-center gap-2 relative">
      <div className="flex items-center gap-1.5 bg-primary/10 text-primary rounded-md px-3 py-1.5">
        <Coins className="h-4 w-4" />
        <span className="font-medium">{user.credits}</span>
        <span className="text-xs text-primary/80">créditos</span>
      </div>
      
      {/* Renderização condicional de mensagens */}
      {showNewCreditsMessage && <WelcomeMessage />}
      {showLowCreditsWarning && <LowCreditsWarning onBuyCredits={handleBuyCredits} />}
      {user.credits === 0 && <NoCreditsWarning onBuyCredits={handleBuyCredits} />}
    </div>
  );
}
