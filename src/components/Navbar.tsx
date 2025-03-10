import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { useNavigate, Link } from "react-router-dom";

export default function Navbar() {
  const { user, logout, isAdmin } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <nav className="bg-white shadow-sm border-b">
      <div className="container mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/converter">
              <h1 className="text-xl font-semibold text-gray-800 hover:text-gray-600 transition-colors">
                Conversor XML para Excel
              </h1>
            </Link>
            {isAdmin && (
              <Link to="/admin">
                <Button variant="ghost" size="sm">
                  Administração
                </Button>
              </Link>
            )}
          </div>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-600">
              Olá, {user?.name}
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLogout}
            >
              Sair
            </Button>
          </div>
        </div>
      </div>
    </nav>
  );
} 