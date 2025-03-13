
import React from "react";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";
import { format } from "date-fns";
import { ptBR } from "date-fns/locale";
import { User } from "@/contexts/auth/types";

interface UserCreditsInfoProps {
  user: User | null;
}

const UserCreditsInfo: React.FC<UserCreditsInfoProps> = ({ user }) => {
  const navigate = useNavigate();

  if (!user) return null;

  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não disponível";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
      <div className="flex flex-col md:flex-row justify-between items-center">
        <div>
          <h2 className="text-xl font-semibold mb-2">Seus créditos</h2>
          <p className="text-gray-600">
            Você possui atualmente <span className="font-bold text-primary">{user.credits}</span> créditos
          </p>
          {user.activePlan && user.planExpiryDate && (
            <div className="mt-2">
              <p className="text-sm text-gray-500">
                Plano ativo: <span className="font-medium">{user.activePlan.name}</span>
              </p>
              <p className="text-sm text-gray-500">
                Válido até: <span className="font-medium">{formatDate(user.planExpiryDate)}</span>
              </p>
            </div>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Button onClick={() => navigate("/")} className="bg-primary">
            Ir para conversões
          </Button>
        </div>
      </div>
    </div>
  );
};

export default UserCreditsInfo;
