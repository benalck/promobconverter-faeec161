import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { LogOut, LayoutDashboard, User, Home, Menu, ChevronDown } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { ThemeToggle } from "./ThemeToggle";
import { motion } from "framer-motion";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();

  const handleLogout = async () => {
    await logout();
  };

  return (
    <nav className="bg-card/80 backdrop-blur-xl shadow-lg sticky top-0 z-50 border-b border-border">
      <div className="container mx-auto px-4">
        <div className="flex items-center justify-between h-14 md:h-16">
          <motion.div
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4 }}
          >
            <Link 
              to="/" 
              className="font-bold text-lg md:text-xl bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent hover:opacity-80 transition-opacity"
            >
              Promob Converter
            </Link>
          </motion.div>
          
          {/* Desktop Menu */}
          <motion.div 
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.4, delay: 0.1 }}
            className="hidden md:flex items-center gap-2 md:gap-3"
          >
            {user && (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/")}
                  className="flex items-center gap-2"
                >
                  <Home className="h-4 w-4" />
                  Início
                </Button>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => navigate("/dashboard")}
                  className="flex items-center gap-2"
                >
                  <LayoutDashboard className="h-4 w-4" />
                  Dashboard
                </Button>
              </>
            )}
            
            <div data-tour="theme-toggle">
              <ThemeToggle />
            </div>
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" size="sm" className="flex items-center gap-1">
                    <User className="h-4 w-4 mr-1" />
                    <span>{user?.name}</span>
                    <ChevronDown className="h-4 w-4 opacity-50" />
                  </Button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="w-48 bg-card border-border">
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
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </motion.div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button variant="ghost" size="sm" onClick={() => setMenuOpen(!menuOpen)}>
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu Expanded */}
        {menuOpen && (
          <div className="md:hidden py-3 pt-4 border-t mt-3 animate-fade-in">
            <div className="flex flex-col space-y-3 items-center text-center">
              {user && (
                <>
                  <div className="px-2 py-1 text-sm font-medium">
                    <span>Olá, {user?.name}</span>
                  </div>
                  
                  <Link 
                    to="/" 
                    className="flex items-center justify-center w-full px-2 py-1 hover:bg-accent rounded-md" 
                    onClick={() => setMenuOpen(false)}
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Link>
                  
                  <button
                    onClick={() => { navigate("/dashboard"); setMenuOpen(false); }}
                    className="flex items-center justify-center w-full px-2 py-1 hover:bg-accent rounded-md"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </button>
                  
                  {user?.role === 'admin' && (
                    <Link 
                      to="/admin" 
                      className="flex items-center justify-center w-full px-2 py-1 hover:bg-accent rounded-md" 
                      onClick={() => setMenuOpen(false)}
                    >
                      Painel Admin
                    </Link>
                  )}
                  
                  <button 
                    onClick={handleLogout}
                    className="flex items-center justify-center w-full px-2 py-1 text-center text-destructive hover:bg-destructive/10 rounded-md"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </button>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
