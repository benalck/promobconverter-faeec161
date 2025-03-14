
import { Link } from "react-router-dom";
import { Button } from "./button";
import { useAuth } from "@/contexts/AuthContext";
import UserCredits from "@/components/UserCredits";
import { LogOut, Settings, User } from "lucide-react";

export default function Navbar() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();

  const handleLogout = async () => {
    try {
      await logout();
    } catch (error) {
      console.error("Error during logout:", error);
    }
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between h-16">
          <div className="flex items-center">
            <Link to="/" className="text-xl font-bold text-gray-900">
              Conversor XML
            </Link>
          </div>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && <UserCredits />}
            
            <div className="flex items-center space-x-2">
              {isAuthenticated ? (
                <>
                  <div className="text-sm text-gray-600 mr-2">
                    Olá, {user?.name || user?.email?.split('@')[0] || 'Usuário'}
                  </div>
                  
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline" size="sm">
                        <Settings className="h-4 w-4 mr-2" />
                        Admin
                      </Button>
                    </Link>
                  )}
                  
                  <Link to="/profile">
                    <Button variant="outline" size="sm">
                      <User className="h-4 w-4 mr-2" />
                      Perfil
                    </Button>
                  </Link>
                  
                  <Button variant="destructive" size="sm" onClick={handleLogout}>
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/login">
                    <Button variant="outline">Entrar</Button>
                  </Link>
                  <Link to="/register">
                    <Button>Registrar</Button>
                  </Link>
                </>
              )}
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
}
