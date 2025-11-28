import React, { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
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
import { ChevronDown, LogOut, Menu, User, Home, Sparkles, Wand2, History } from "lucide-react";

export default function Navbar() {
  const { user, logout } = useAuth();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = async () => {
    await logout();
  };

  return (
    <motion.nav
      initial={{ y: -100 }}
      animate={{ y: 0 }}
      className="border-b glass-premium sticky top-0 z-50 shadow-soft"
    >
      <div className="max-w-7xl mx-auto px-4 py-4">
        <div className="flex items-center justify-between">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 group">
            <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-primary to-secondary flex items-center justify-center shadow-glow group-hover:scale-110 transition-transform">
              <Sparkles className="w-5 h-5 text-white" />
            </div>
            <h1 className="text-xl font-bold bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
              PromobConverter Pro
            </h1>
          </Link>
          
          {/* Desktop Menu */}
          <div className="hidden md:flex items-center gap-3">
            <Link to="/">
              <Button 
                variant="ghost" 
                className="rounded-full hover:bg-primary/10"
              >
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            </Link>
            
            {user && (
              <>
                <Link to="/render-ia">
                  <Button 
                    variant="ghost" 
                    className="rounded-full hover:bg-primary/10"
                  >
                    <Wand2 className="h-4 w-4 mr-2" />
                    Render IA
                  </Button>
                </Link>
                <Link to="/render-ia/historico">
                  <Button 
                    variant="ghost" 
                    size="sm"
                    className="rounded-full hover:bg-primary/10 text-xs"
                  >
                    Histórico
                  </Button>
                </Link>
              </>
            )}
            
            {user && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button 
                    variant="outline" 
                    className="rounded-full border-primary/20 hover:bg-primary/10"
                  >
                    <div className="w-6 h-6 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center mr-2">
                      <User className="h-3 w-3 text-white" />
                    </div>
                    {user.name}
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
                        <User className="h-4 w-4 text-white" />
                      </div>
                      <div>
                        <p className="font-medium">{user.name}</p>
                        <p className="text-xs text-muted-foreground">{user.email}</p>
                      </div>
                    </div>
                  </DropdownMenuLabel>
                  <DropdownMenuSeparator />
                  {user.role === 'admin' && (
                    <>
                      <DropdownMenuItem asChild>
                        <Link to="/admin" className="w-full cursor-pointer">
                          <Sparkles className="h-4 w-4 mr-2" />
                          Painel Admin
                        </Link>
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                    </>
                  )}
                  <DropdownMenuItem 
                    onClick={handleLogout} 
                    className="text-red-600 focus:text-red-600 cursor-pointer"
                  >
                    <LogOut className="h-4 w-4 mr-2" />
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>
          
          {/* Mobile Menu Button */}
          <div className="md:hidden">
            <Button 
              variant="ghost" 
              size="icon"
              onClick={() => setMenuOpen(!menuOpen)}
              className="rounded-full"
            >
              <Menu className="h-5 w-5" />
            </Button>
          </div>
        </div>
        
        {/* Mobile Menu */}
        {menuOpen && user && (
          <motion.div
            initial={{ opacity: 0, height: 0 }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{ opacity: 0, height: 0 }}
            className="md:hidden mt-4 pt-4 border-t space-y-2"
          >
            <div className="flex items-center gap-3 px-3 py-2 rounded-lg bg-muted/50">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary to-secondary flex items-center justify-center">
                <User className="h-5 w-5 text-white" />
              </div>
              <div>
                <p className="font-medium">{user.name}</p>
                <p className="text-xs text-muted-foreground">{user.email}</p>
              </div>
            </div>
            
            <Link to="/" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-lg">
                <Home className="h-4 w-4 mr-2" />
                Início
              </Button>
            </Link>
            
            <Link to="/render-ia" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-lg">
                <Wand2 className="h-4 w-4 mr-2" />
                Render IA
              </Button>
            </Link>
            
            <Link to="/render-ia/historico" onClick={() => setMenuOpen(false)}>
              <Button variant="ghost" className="w-full justify-start rounded-lg pl-10">
                <span className="text-sm">↳ Histórico</span>
              </Button>
            </Link>
            
            {user.role === 'admin' && (
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
              className="w-full justify-start text-red-600 hover:text-red-600 hover:bg-red-50 rounded-lg"
            >
              <LogOut className="h-4 w-4 mr-2" />
              Sair
            </Button>
          </motion.div>
        )}
      </div>
    </motion.nav>
  );
}
