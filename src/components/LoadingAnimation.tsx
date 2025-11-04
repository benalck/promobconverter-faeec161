import React from "react";
import { Ruler, Axe, Hammer, Drill } from "lucide-react";

const LoadingAnimation = () => {
  return (
    <div className="fixed inset-0 z-50 flex flex-col items-center justify-center bg-background/80 backdrop-blur-sm">
      <div className="relative w-32 h-32 mb-4">
        {/* Círculo de fundo com gradiente */}
        <div className="absolute w-32 h-32 border-4 border-blue-400 rounded-full opacity-20 animate-pulse"></div>
        
        {/* Ícones de ferramentas girando */}
        <div className="absolute inset-0 animate-spin" style={{ animationDuration: '8s' }}>
          <div className="absolute top-0 left-1/2 -ml-4 text-blue-600">
            <Ruler size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute bottom-0 left-1/2 -ml-4 text-blue-600">
            <Axe size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute left-0 top-1/2 -mt-4 text-blue-600">
            <Hammer size={24} strokeWidth={1.5} />
          </div>
          <div className="absolute right-0 top-1/2 -mt-4 text-blue-600">
            <Drill size={24} strokeWidth={1.5} />
          </div>
        </div>
        
        {/* Elemento central pulsante */}
        <div className="absolute inset-0 flex items-center justify-center">
          <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-blue-600 rounded-xl animate-pulse shadow-lg"></div>
        </div>
      </div>
      
      <h2 className="mt-4 text-xl font-medium text-blue-800">Carregando...</h2>
      <p className="mt-2 text-sm text-blue-600/80">Preparando seus móveis planejados</p>

      {/* Efeito de serragem */}
      <div className="absolute inset-x-0 top-0 h-full overflow-hidden pointer-events-none">
        {[...Array(8)].map((_, i) => (
          <div 
            key={i}
            className="absolute w-1 h-1 bg-blue-300 rounded-full"
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
      <style>{`
        @keyframes fall {
          from {
            transform: translateY(-10px) rotate(0deg);
            opacity: 0;
          }
          50% {
            opacity: 0.7;
          }
          to {
            transform: translateY(100vh) rotate(360deg);
            opacity: 0;
          }
        }
      `}</style>
    </div>
  );
};

export default LoadingAnimation;
