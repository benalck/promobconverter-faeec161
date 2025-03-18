
import React from "react";
import { Hammer } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-20 h-20">
        <div className="absolute w-20 h-20 border-4 border-amber-600 rounded-full opacity-20"></div>
        <div className="absolute w-20 h-20 border-4 border-t-amber-600 border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <Hammer className="absolute text-amber-600 h-8 w-8 opacity-80" />
      <h2 className="mt-6 text-xl font-medium text-amber-800">Carregando...</h2>
      <p className="mt-2 text-sm text-muted-foreground">Preparando seus móveis planejados</p>
    </div>
  );
};

export default LoadingAnimation;
