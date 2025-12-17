import React, { useState } from "react";
import { Link, useLocation } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { ThemeToggle } from "@/components/ThemeToggle";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { 
  ChevronDown, 
  LogOut, 
  Menu, 
  User, 
  Home, 
  Sparkles, 
  LayoutDashboard,
  History,
  Settings,
  CreditCard,
  X,
  LogIn,
  UserPlus
} from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);
  const location = useLocation();

  const handleLogout = async () => {
    await logout();
  };

  const isActive = (path: string) => location.pathname === path;

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b glass-premium sticky top-0 z-50 shadow-soft"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to={user ? "/dashboard" : "/"} className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-primary-foreground" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PromobConverter
            </h1>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <ThemeToggle />
            {user ? (
              <>
                {/* Dashboard Link - Sempre visível para usuários logados */}
                <Link to="/dashboard">
                  <Button 
                    variant={isActive("/dashboard") ? "default" : "ghost"}
                    className="rounded-full"
                  >
                    <LayoutDashboard className="h-4 w-4 mr-2" />
                    Dashboard
                  </Button>
                </Link>

                <Link to="/">
                  <Button 
                    variant={isActive("/") ? "default" : "ghost"}
                    className="rounded-full"
                  >
                    <Home className="h-4 w-4 mr-2" />
                    Início
                  </Button>
                </Link>

                {/* Menu de Perfil */}
                <DropdownMenu>
                  <DropdownMenuTrigger asChild>
                    <Button 
                      variant="outline" 
                      className="rounded-full border-primary/20 hover:bg-primary/10"
                    >
                      <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2">
                        <User className="h-3 w-3 text-primary-foreground" />
                      </div>
                      {user.name?.split(' ')[0]}
                      <ChevronDown className="h-4 w-4 ml-2 opacity-50" />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent 
                    align="end" 
                    className="w-56 glass-premium border-primary/20"
                  >
                    <DropdownMenuLabel className="text-sm">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                          <User className="h-4 w-4 text-primary-foreground" />
                        </div>
                        <div>
                          <p className="font-medium">{user.name}</p>
                          <p className="text-xs text-muted-foreground">{user.email}</p>
                        </div>
                      </div>
                    </DropdownMenuLabel>
                    <DropdownMenuSeparator />
                    
                    <DropdownMenuItem asChild>
                      <Link to="/settings" className="w-full cursor-pointer">
                        <Settings className="h-4 w-4 mr-2" />
                        Perfil / Configurações
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/settings#credits" className="w-full cursor-pointer">
                        <CreditCard className="h-4 w-4 mr-2" />
                        Créditos ({user.credits || 0})
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link to="/history" className="w-full cursor-pointer">
                        <History className="h-4 w-4 mr-2" />
                        Histórico de Conversões
                      </Link>
                    </DropdownMenuItem>
                    
                    {(user.role === 'admin' || user.role === 'ceo') && (
                      <>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem asChild>
                          <Link to="/admin" className="w-full cursor-pointer">
                            <Sparkles className="h-4 w-4 mr-2" />
                            Painel Admin
                          </Link>
                        </DropdownMenuItem>
                      </>
                    )}
                    
                    <DropdownMenuSeparator />
                    <DropdownMenuItem 
                      onClick={handleLogout} 
                      className="text-destructive focus:text-destructive cursor-pointer"
                    >
                      <LogOut className="h-4 w-4 mr-2" />
                      Sair
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </>
            ) : (
              <>
                {/* Usuário não logado */}
                <Link to="/register">
                  <Button variant="ghost" className="rounded-full">
                    <LogIn className="h-4 w-4 mr-2" />
                    Login
                  </Button>
                </Link>
                <Link to="/register">
                  <Button className="rounded-full">
                    <UserPlus className="h-4 w-4 mr-2" />
                    Criar conta
                  </Button>
                </Link>
              </>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden flex items-center gap-2">
            <ThemeToggle />
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full"
            >
              {menuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        <AnimatePresence>
          {menuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden mt-4 pt-4 border-t space-y-2"
            >
              {user ? (
                <>
                  <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                      <User className="h-5 w-5 text-primary-foreground" />
                    </div>
                    <div>
                      <p className="font-medium">{user.name}</p>
                      <p className="text-xs text-muted-foreground">{user.email}</p>
                    </div>
                  </div>
                  
                  <Link to="/dashboard" onClick={() => setMenuOpen(false)}>
                    <Button variant={isActive("/dashboard") ? "secondary" : "ghost"} className="w-full justify-start rounded-lg">
                      <LayoutDashboard className="h-4 w-4 mr-2" />
                      Dashboard
                    </Button>
                  </Link>
                  
                  <Link to="/" onClick={() => setMenuOpen(false)}>
                    <Button variant={isActive("/") ? "secondary" : "ghost"} className="w-full justify-start rounded-lg">
                      <Home className="h-4 w-4 mr-2" />
                      Início
                    </Button>
                  </Link>
                  
                  <Link to="/history" onClick={() => setMenuOpen(false)}>
                    <Button variant={isActive("/history") ? "secondary" : "ghost"} className="w-full justify-start rounded-lg">
                      <History className="h-4 w-4 mr-2" />
                      Histórico
                    </Button>
                  </Link>
                  
                  <Link to="/settings" onClick={() => setMenuOpen(false)}>
                    <Button variant={isActive("/settings") ? "secondary" : "ghost"} className="w-full justify-start rounded-lg">
                      <Settings className="h-4 w-4 mr-2" />
                      Configurações
                    </Button>
                  </Link>
                  
                  {(user.role === 'admin' || user.role === 'ceo') && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)}>
                      <Button variant="ghost" className="w-full justify-start rounded-lg">
                        <Sparkles className="h-4 w-4 mr-2" />
                        Painel Admin
                      </Button>
                    </Link>
                  )}
                  
                  <Button 
                    variant="ghost" 
                    onClick={handleLogout}
                    className="w-full justify-start text-destructive hover:text-destructive hover:bg-destructive/10 rounded-lg"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </Button>
                </>
              ) : (
                <>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button variant="ghost" className="w-full justify-start rounded-lg">
                      <LogIn className="h-4 w-4 mr-2" />
                      Login
                    </Button>
                  </Link>
                  <Link to="/register" onClick={() => setMenuOpen(false)}>
                    <Button className="w-full justify-start rounded-lg">
                      <UserPlus className="h-4 w-4 mr-2" />
                      Criar conta
                    </Button>
                  </Link>
                </>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </motion.nav>
  );
}
