
import React from "react";
import { cn } from "@/lib/utils";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen w-full flex flex-col items-center justify-center bg-gradient-to-b from-background to-background/80 px-4 py-8 sm:py-12 md:py-16 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>
      
      <div className="w-full max-w-6xl mx-auto relative z-10 animate-fade-in">
        <header className="text-center mb-8 md:mb-12">
          <h1 className="text-3xl sm:text-4xl md:text-5xl font-bold tracking-tight animate-slide-down">
            XML para Excel
          </h1>
          <p className="mt-2 text-muted-foreground max-w-lg mx-auto animate-slide-up">
            Transforme arquivos XML em planilhas Excel com formatação profissional em segundos
          </p>
        </header>
        
        <main className={cn("w-full", className)}>
          {children}
        </main>
        
        <footer className="mt-16 text-center text-sm text-muted-foreground">
          <p>© {new Date().getFullYear()} XML para Excel Conversor. Todos os direitos reservados.</p>
        </footer>
      </div>
    </div>
  );
};

export default AppLayout;
