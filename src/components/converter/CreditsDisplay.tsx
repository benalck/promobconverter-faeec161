
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { User } from "@/contexts/auth/types";

interface CreditsDisplayProps {
  user: User | null;
}

const CreditsDisplay: React.FC<CreditsDisplayProps> = ({ user }) => {
  const navigate = useNavigate();
  
  if (!user) {
    return (
      <div className="text-center mt-4">
        <Button 
          variant="outline" 
          onClick={() => navigate("/register")}
          className="animate-pulse"
        >
          Criar conta para obter créditos
        </Button>
      </div>
    );
  }

  return (
    <div className="text-center text-sm bg-primary/10 py-2 px-4 rounded-md animate-fade-in">
      <p>Você possui <span className="font-bold">{user.credits}</span> créditos disponíveis</p>
      <p>Cada conversão utiliza 1 crédito</p>
    </div>
  );
};

export default CreditsDisplay;
