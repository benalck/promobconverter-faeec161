
import React from "react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";
import UserCredits from "./UserCredits";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  const isMobile = useIsMobile();
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80 overflow-hidden">
      {/* Navbar fixo no topo */}
      <div className="w-full sticky top-0 z-50">
        <Navbar />
      </div>
      
      {/* Elementos de fundo */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>
      
      {/* Container principal centralizado */}
      <div className="flex-1 flex flex-col items-center justify-center w-full px-4 py-6 sm:py-8 md:py-12">
        {/* Conteúdo principal */}
        <div className="w-full max-w-4xl mx-auto relative z-10 animate-fade-in">
          <header className="text-center mb-6 md:mb-10">
            <h1 className={cn(
              "font-bold tracking-tight animate-slide-down",
              isMobile ? "text-2xl" : "text-3xl sm:text-4xl md:text-5xl"
            )}>
              XML Promob para Excel
            </h1>
            <p className="mt-2 text-muted-foreground max-w-lg mx-auto animate-slide-up text-sm sm:text-base">
              Transforme arquivos XML Promob em planos de corte Excel com formatação profissional em segundos
            </p>
            
            {/* Créditos do usuário */}
            <div className="mt-4 sm:mt-6 flex justify-center">
              <UserCredits />
            </div>
          </header>
          
          <main className={cn("w-full", className)}>
            {children}
          </main>
          
          <footer className="mt-auto pt-8 sm:pt-12 md:pt-16 text-center text-xs sm:text-sm text-muted-foreground">
            <p>© {new Date().getFullYear()} Arquivo XML Promob para Plano de corte Excel. Todos os direitos reservados.</p>
          </footer>
        </div>
      </div>
    </div>
  );
};

export default AppLayout;
