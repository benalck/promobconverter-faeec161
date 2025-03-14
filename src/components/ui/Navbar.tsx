
import { Link } from "react-router-dom";
import { Button } from "./button";
import { useAuth } from "@/contexts/AuthContext";
import UserCredits from "@/components/UserCredits";

export default function Navbar() {
  const { user, isAdmin, logout, isAuthenticated } = useAuth();

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
                  {isAdmin && (
                    <Link to="/admin">
                      <Button variant="outline">Administração</Button>
                    </Link>
                  )}
                  
                  <Link to="/creditos">
                    <Button variant="outline">Comprar Créditos</Button>
                  </Link>
                  
                  <Button variant="destructive" onClick={logout}>
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
