import React, { useMemo } from "react";
import Navbar from "./Navbar";
import UserCredits from "./UserCredits";
import HumanizedChat from "./HumanizedChat";
import { cn } from "@/lib/utils";
import { useIsMobile } from "@/hooks/use-mobile";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
  hideHeader?: boolean; // Nova prop
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className, hideHeader = false }) => {
  const isMobile = useIsMobile();
  
  const backgroundElements = useMemo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-accent/5 to-transparent"></div>
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
    <div className="min-h-screen flex flex-col relative">
      {/* Navbar */}
      <Navbar />
      
      {/* Background elements */}
      {backgroundElements}
      
      {/* Main content */}
      <div className="flex-1 flex flex-col">
        {/* Header (optional) */}
        {!hideHeader && (
          <header className="text-center py-8 md:py-12 px-4">
            <h1 className="text-3xl md:text-4xl lg:text-5xl font-bold mb-4 bg-gradient-to-r from-primary via-secondary to-accent bg-clip-text text-transparent">
              PromobConverter Pro
            </h1>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto mb-6">
              Transforme arquivos XML Promob em planos de corte Excel profissionais
            </p>
            <UserCredits />
          </header>
        )}
        
        {/* Page content */}
        <main className={cn("flex-1 w-full", className)}>
          {children}
        </main>
        
        {/* Footer */}
        <footer className="py-8 text-center text-sm text-muted-foreground border-t mt-auto">
          <p>© {new Date().getFullYear()} PromobConverter Pro. Todos os direitos reservados.</p>
        </footer>
      </div>
      
      {/* Support chat */}
      <HumanizedChat />
    </div>
  );
};

export default AppLayout;