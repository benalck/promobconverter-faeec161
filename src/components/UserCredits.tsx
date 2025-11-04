
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate } from "react-router-dom";

export default function UserCredits() {
  const { user } = useAuth();
  const navigate = useNavigate();

  if (!user) {
    return (
      <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
        <h2 className="text-xl font-semibold">Faça login para continuar</h2>
        <Button onClick={() => navigate("/register")}>
          Login / Cadastro
        </Button>
      </div>
    );
  }

  return (
    <div className="flex flex-col items-center justify-center p-4 space-y-4 text-center">
      <h2 className="text-xl font-semibold">Bem-vindo, {user.name}!</h2>
      <p className="text-gray-600">
        Você pode converter arquivos XML do Promob para Excel.
      </p>
    </div>
  );
}
