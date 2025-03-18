
import React from "react";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-20 h-20">
        <div className="absolute w-20 h-20 border-4 border-primary rounded-full opacity-20"></div>
        <div className="absolute w-20 h-20 border-4 border-t-primary border-r-transparent border-b-transparent border-l-transparent rounded-full animate-spin"></div>
      </div>
      <h2 className="mt-6 text-xl font-medium text-primary">Carregando...</h2>
      <p className="mt-2 text-sm text-muted-foreground">Preparando o conversor para você</p>
    </div>
  );
};

export default LoadingAnimation;
