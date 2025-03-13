
import React from "react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen w-full flex flex-col bg-gradient-to-b from-background to-background/80 px-4 py-4 overflow-hidden">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>
      
      <div className="w-full max-w-6xl mx-auto relative z-10">
        <Navbar />
        
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
