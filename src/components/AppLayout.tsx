
import React from "react";
import { cn } from "@/lib/utils";
import Navbar from "./Navbar";

interface AppLayoutProps {
  children: React.ReactNode;
  className?: string;
}

const AppLayout: React.FC<AppLayoutProps> = ({ children, className }) => {
  return (
    <div className="min-h-screen w-full bg-white">
      <Navbar />
      
      <main className={cn("w-full max-w-6xl mx-auto px-4 py-4", className)}>
        {children}
      </main>
      
      <footer className="mt-16 text-center text-sm text-muted-foreground max-w-6xl mx-auto px-4">
        <p>© {new Date().getFullYear()} XML para Excel Conversor. Todos os direitos reservados.</p>
      </footer>
    </div>
  );
};

export default AppLayout;
