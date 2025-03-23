import React, { useState } from "react";
import { Link } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ChevronDown, LogOut, Menu, User, Home } from "lucide-react";

const Navbar: React.FC = () => {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <div className="container mx-auto px-4 py-2 flex justify-between items-center">
        <div className="flex items-center space-x-4">
          <Link to="/" className="flex items-center">
            <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
              PromobConverter Pro
            </h1>
          </Link>
        </div>

        <div className="hidden md:flex items-center space-x-6">
          <Link 
            to="/" 
            className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            Início
          </Link>
          <Link 
            to="/cut-optimizer" 
            className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            Otimizador de Corte
          </Link>
          <Link 
            to="/edge-calculator" 
            className="text-gray-700 hover:text-blue-600 font-medium text-sm transition-colors"
          >
            Calculadora de Fita
          </Link>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <User className="h-4 w-4 mr-1" />
                <span>{user?.name}</span>
                <ChevronDown className="h-4 w-4 opacity-50" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-48">
              <DropdownMenuLabel>Minha Conta</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {user?.role === 'admin' && (
                <DropdownMenuItem asChild>
                  <Link to="/admin" className="w-full cursor-pointer">
                    Painel Admin
                  </Link>
                </DropdownMenuItem>
              )}
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={handleLogout} className="text-red-600 focus:text-red-600 cursor-pointer">
                <LogOut className="h-4 w-4 mr-2" />
                Sair
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>

        <div className="md:hidden">
          <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
            <Menu className="h-5 w-5" />
          </Button>
        </div>
      </div>

      {menuOpen && (
        <div className="md:hidden py-3 pt-4 border-t mt-3 animate-fade-in">
          <div className="flex flex-col space-y-3 items-center text-center">
            <div className="px-2 py-1 text-sm font-medium">
              <span>Olá, {user?.name}</span>
            </div>
            
            <Link to="/" className="flex items-center justify-center w-full px-2 py-1 hover:bg-gray-100 rounded-md" onClick={() => setMenuOpen(false)}>
              <Home className="h-4 w-4 mr-2" />
              Início
            </Link>
            
            {user?.role === 'admin' && (
              <Link to="/admin" className="flex items-center justify-center w-full px-2 py-1 hover:bg-gray-100 rounded-md" onClick={() => setMenuOpen(false)}>
                Painel Admin
              </Link>
            )}
            
            <button 
              onClick={handleLogout}
              className="flex items-center justify-center w-full px-2 py-1 text-center text-red-600 hover:bg-red-50 rounded-md"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </button>
          </div>
        </div>
      )}

      <div
        className={`fixed inset-0 z-50 bg-white transform ${
          isMobileMenuOpen ? "translate-x-0" : "translate-x-full"
        } transition-transform duration-300 ease-in-out md:hidden`}
      >
        <button
          className="fixed top-4 right-4 z-50 p-2 rounded-full bg-white shadow-md"
          onClick={() => setIsMobileMenuOpen(false)}
        >
          <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="h-6 w-6">
            <path d="M6 18L18 6M6 6l12 12" />
          </svg>
        </button>

        <div className="flex flex-col space-y-4 mt-8 px-4">
          <Link
            to="/"
            className="text-gray-800 hover:text-blue-600 py-3 border-b border-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Início
          </Link>
          <Link
            to="/cut-optimizer"
            className="text-gray-800 hover:text-blue-600 py-3 border-b border-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Otimizador de Corte
          </Link>
          <Link
            to="/edge-calculator"
            className="text-gray-800 hover:text-blue-600 py-3 border-b border-gray-100"
            onClick={() => setIsMobileMenuOpen(false)}
          >
            Calculadora de Fita
          </Link>
          {user?.role === 'admin' && (
            <Link
              to="/admin"
              className="text-gray-800 hover:text-blue-600 py-3 border-b border-gray-100"
              onClick={() => setIsMobileMenuOpen(false)}
            >
              Painel Admin
            </Link>
          )}
        </div>
      </div>
    </header>
  );
};

export default Navbar;
