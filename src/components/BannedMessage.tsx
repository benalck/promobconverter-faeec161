
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";

export default function BannedMessage() {
  const { logout } = useAuth();
  const navigate = useNavigate();
  
  const handleLogout = async () => {
    await logout();
    navigate("/login");
  };
  
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center space-y-6">
        <h2 className="text-2xl font-bold text-red-600">Conta Suspensa</h2>
        <div className="space-y-4">
          <p className="text-gray-700">
            Sua conta foi suspensa pelo administrador do sistema.
          </p>
          <p className="text-gray-700">
            Se acredita que isso é um erro, entre em contato com o suporte.
          </p>
        </div>
        <Button 
          onClick={handleLogout}
          className="w-full"
        >
          Voltar para Login
        </Button>
      </div>
    </div>
  );
}
