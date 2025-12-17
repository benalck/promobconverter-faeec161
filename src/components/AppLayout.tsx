import React, { useMemo } from "react";
import Navbar from "./Navbar";
import Footer from "./Footer";
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
  
  const backgroundElements = useMemo(() => (
    <div className="fixed inset-0 overflow-hidden pointer-events-none -z-10">
      <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-[120px]"></div>
      <div className="absolute bottom-0 right-1/4 w-96 h-96 bg-secondary/5 rounded-full blur-[120px]"></div>
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-gradient-to-b from-accent/5 to-transparent"></div>
    </div>
  ), []);
  
  return (
    <div className="min-h-screen flex flex-col relative">
      <Navbar />
      {backgroundElements}
      
      <div className="flex-1 flex flex-col">
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
        
        <main className={cn("flex-1 w-full", className)}>
          {children}
        </main>
        
        <Footer />
      </div>
      
      <HumanizedChat />
    </div>
  );
};

export default AppLayout;