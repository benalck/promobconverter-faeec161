
import React from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import UserCredits from "./UserCredits";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout, isAdmin, isAuthenticated } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    try {
      console.log("Starting logout");
      await logout();
      console.log("Logout complete, redirecting");
      navigate("/login");
    } catch (error) {
      console.error("Error logging out:", error);
    }
  };

  return (
    <nav className="border-b mb-6 py-3">
      <div className="max-w-6xl mx-auto px-4">
        <div className="flex items-center justify-between">
          <Link to="/" className="text-xl font-semibold text-gray-800">
            Conversor XML
          </Link>
          
          <div className="flex items-center space-x-4">
            {isAuthenticated && user && (
              <>
                <UserCredits />
                <span className="text-sm text-gray-600">
                  Olá, {user.name || user.email?.split('@')[0] || 'Usuário'}
                </span>
                
                {isAdmin && (
                  <Link to="/adminaccess">
                    <Button variant="outline" size="sm" className="font-bold text-blue-600 border-blue-600">
                      Administração
                    </Button>
                  </Link>
                )}
                
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                  className="flex items-center"
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
            
            {!isAuthenticated && (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => navigate("/login")}
                >
                  Entrar
                </Button>
                <Button
                  variant="default"
                  size="sm"
                  onClick={() => navigate("/register")}
                >
                  Registrar
                </Button>
              </>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
