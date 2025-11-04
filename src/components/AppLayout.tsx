import React, { useMemo } from "react";
import Navbar from "./Navbar";
import UserCredits from "./UserCredits";
import HumanizedChat from "./HumanizedChat";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className, hideHeader = false }) => {
  const isMobile = useIsMobile();
  
  // Memoizando elementos que não mudam frequentemente para evitar re-renderizações desnecessárias
  const backgroundElements = useMemo(() => (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2"></div>
      <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>
    </div>
  ), []);
  
  const header = useMemo(() => (
    !hideHeader && (
      <header className="text-center mb-4 md:mb-8 animate-fade-in">
        <h1 className={cn(
          "font-bold tracking-tight animate-slide-down",
          isMobile ? "text-2xl" : "text-3xl sm:text-4xl md:text-5xl"
        )}>
          PromobConverter Pro
        </h1>
        <p className="mt-2 text-muted-foreground max-w-lg mx-auto animate-slide-up text-sm sm:text-base">
          Transforme arquivos XML Promob em planos de corte Excel com formatação profissional em segundos
        </p>
        
        {/* Créditos do usuário */}
        <div className="mt-4 sm:mt-6 flex justify-center">
          <UserCredits />
        </div>
      </header>
    )
  ), [hideHeader, isMobile]);
  
  const currentYear = useMemo(() => new Date().getFullYear(), []);
  
  const footer = useMemo(() => (
    <footer className="mt-auto pt-8 sm:pt-10 pb-4 text-center text-xs sm:text-sm text-muted-foreground">
      <p>© {currentYear} PromobConverter Pro. Todos os direitos reservados.</p>
    </footer>
  ), [currentYear]);
  
  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-b from-background to-background/80">
      {/* Navbar fixo no topo */}
      <div className="w-full sticky top-0 z-50">
        <Navbar />
      </div>
      
      {/* Elementos de fundo */}
      {backgroundElements}
      
      {/* Container principal centralizado */}
      <div className="flex-1 flex flex-col px-4 py-6 md:py-8">
        {/* Conteúdo principal */}
        <div className="w-full max-w-4xl mx-auto relative z-10 animate-fade-in">
          {header}
          
          <main className={cn("w-full", className)}>
            {children}
          </main>
          
          {footer}
        </div>
      </div>
      
      {/* Atendimento humanizado para suporte */}
      <HumanizedChat />
    </div>
  );
};

export default AppLayout;
