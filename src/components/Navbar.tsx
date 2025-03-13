
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";
import UserCredits from "./UserCredits";
import { LogOut } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
    navigate("/register");
  };

  return (
    <nav className="bg-white shadow-sm border-b mb-10">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/">
              <h1 className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors">
                Conversor XML para Excel
              </h1>
            </Link>
          </div>
          <div className="flex items-center space-x-4">
            <UserCredits />
            <span className="text-sm text-gray-600">
              Olá, {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
              className="flex items-center gap-1"
            >
              <LogOut className="h-4 w-4" />
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
}
