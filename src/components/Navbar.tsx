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
import { Badge } from "@/components/ui/badge"; // Importar Badge

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
      <div className="max-w-6xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <Link to="/" className="flex items-center">
              <h1 className="text-xl font-bold text-primary hover:text-primary/80 transition-colors">
                PromobConverter Pro
              </h1>
            </Link>
          </div>
          
          {/* Menu para desktop */}
          <div className="hidden md:flex items-center space-x-4">
            <Link to="/">
              <Button variant="ghost" size="sm" className="flex items-center gap-1">
                <Home className="h-4 w-4 mr-1" />
                <span>Início</span>
              </Button>
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
        
        {/* Menu mobile expandido */}
        {menuOpen && (
          <div className="md:hidden py-3 pt-4 border-t mt-3 animate-fade-in">
            <div className="flex flex-col space-y-3 items-center text-center">
              <div className="px-2 py-1 text-sm font-medium flex items-center justify-center">
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
      </div>
    </nav>
  );
}