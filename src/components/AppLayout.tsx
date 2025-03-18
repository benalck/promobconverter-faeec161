
import React from "react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import UserCredits from "./UserCredits";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-amber-50 to-white overflow-hidden">
      {/* Navbar fixo no topo */}
      <div className="w-full sticky top-0 z-50">
        <Navbar />
      </div>
      
      {/* Elementos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-amber-200/20 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-amber-500/10 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>
      
      {/* Container principal centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-8 sm:py-12 md:py-16">
        {/* Conteúdo principal */}
        <div className="w-full max-w-4xl mx-auto relative z-10 animate-fade-in">
          <header className="text-center mb-8 md:mb-12">
            <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight animate-slide-down text-amber-900">
              Móveis Planejados
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto animate-slide-up">
              Transforme seus espaços com móveis sob medida criados por nossos mestres marceneiros
            </p>
            
            {/* Créditos do usuário */}
            <div className="mt-6 flex justify-center">
              <UserCredits />
            </div>
          </header>
          
          <main className={cn("w-full", className)}>
            {children}
          </main>
          
          <footer className="mt-auto pt-16 text-center text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Marcenaria Móveis Planejados. Todos os direitos reservados.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
