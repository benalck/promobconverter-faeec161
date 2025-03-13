
import React, { useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import UserCredits from "./UserCredits";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    console.log("Navbar mounted, user:", user ? "Exists" : "Not exists");
    return () => console.log("Navbar unmounted");
  }, [user]);

  const handleLogout = async () => {
    try {
      console.log("Starting logout");
      await logout();
      console.log("Logout complete, redirecting");
      navigate("/register");
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
            {user && (
              <>
                <UserCredits />
                <span className="text-sm text-gray-600">
                  Olá, {user.name || user.email?.split('@')[0] || 'Usuário'}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleLogout}
                >
                  <LogOut className="h-4 w-4 mr-2" />
                  Sair
                </Button>
              </>
            )}
            
            {!user && (
              <Button
                variant="default"
                size="sm"
                onClick={() => navigate("/register")}
              >
                Entrar
              </Button>
            )}
          </div>
        </div>
      </div>
    </nav>
  );
}
