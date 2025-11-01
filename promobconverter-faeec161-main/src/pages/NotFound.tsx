
import { useLocation } from "react-router-dom";
import { useEffect } from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

const NotFound = () => {
  const location = useLocation();

  useEffect(() => {
    console.error(
      "404 Error: User attempted to access non-existent route:",
      location.pathname
    );
  }, [location.pathname]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-background to-background/80 p-4">
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute top-0 left-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] -translate-y-1/2"></div>
        <div className="absolute bottom-0 right-1/4 w-1/2 h-1/2 bg-primary/5 rounded-full blur-[120px] translate-y-1/2"></div>
      </div>
      
      <div className="text-center max-w-md w-full backdrop-blur-sm bg-white/80 p-8 rounded-xl border border-white/40 shadow-glass animate-scale-in">
        <div className="w-24 h-24 flex items-center justify-center text-5xl font-bold text-primary/80 mx-auto mb-4 border-8 border-primary/10 rounded-full">
          404
        </div>
        <h1 className="text-3xl font-bold mb-4">Página não encontrada</h1>
        <p className="text-gray-600 mb-8">
          A página que você está procurando não existe ou foi movida.
        </p>
        <Button
          asChild
          className="group relative overflow-hidden transition-all duration-300"
          size="lg"
        >
          <a href="/">
            <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-300 ease-out group-hover:w-full"></span>
            <span className="relative flex items-center gap-2">
              Voltar para Home
              <ArrowRight className="h-4 w-4 opacity-0 -translate-x-4 transition-all duration-300 group-hover:opacity-100 group-hover:translate-x-0" />
            </span>
          </a>
        </Button>
      </div>
    </div>
  );
};

export default NotFound;
