
import React from "react";
import { Ruler, Armchair, PencilRuler } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-32 h-32 mb-4">
        {/* Círculo de fundo */}
        <div className="absolute w-32 h-32 border-4 border-amber-200 rounded-full opacity-20"></div>
        
        {/* Ícones de marcenaria girando */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '3s' }}>
          <div className="absolute top-0 left-1/2 -ml-4 text-amber-700">
            <Ruler size={32} strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-0 left-1/2 -ml-4 text-amber-700">
            <PencilRuler size={32} strokeWidth={1.5} />
          </div>
          <div className="absolute left-0 top-1/2 -mt-4 text-amber-700">
            <Armchair size={32} strokeWidth={1.5} />
          </div>
          <div className="absolute right-0 top-1/2 -mt-4 text-amber-700">
            <Armchair size={32} strokeWidth={1.5} className="transform rotate-180" />
          </div>
        </div>
        
        {/* Elemento central estático */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-12 h-12 bg-amber-600 rounded-md animate-pulse"></div>
        </div>
      </div>
      
      <h2 className="mt-4 text-xl font-medium text-amber-800">Carregando...</h2>
      <p className="mt-2 text-sm text-muted-foreground">Preparando seus móveis planejados</p>
      
      {/* Serragem caindo - efeito decorativo */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
        {[...Array(10)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-amber-300 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `-5%`,
              opacity: 0.7,
              animationDelay: `${Math.random() * 2}s`,
              animation: `fall ${1 + Math.random() * 3}s linear infinite`
            }}
          />
        ))}
      </div>
      
      {/* Keyframes para efeito de queda da serragem */}
      <style jsx>{`
        @keyframes fall {
          from {
            transform: translateY(-10px);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          to {
            transform: translateY(100vh);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
