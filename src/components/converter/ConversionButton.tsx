
import React from "react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { FileDown, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";

interface ConversionButtonProps {
  isConverting: boolean;
  onConvert: () => void;
  xmlFile: File | null;
}

const ConversionButton: React.FC<ConversionButtonProps> = ({
  isConverting,
  onConvert,
  xmlFile,
}) => {
  const { user } = useAuth();
  const navigate = useNavigate();

  return (
    <>
      <Button
        onClick={onConvert}
        disabled={!xmlFile || isConverting || !user || user.credits <= 0}
        className={cn(
          "w-full py-6 text-base font-medium transition-all duration-500 animate-fade-in",
          "bg-primary hover:bg-primary/90 text-white relative overflow-hidden group",
          "border border-primary/20"
        )}
        style={{ animationDelay: "200ms" }}
        size="lg"
      >
        <span className="absolute inset-0 w-0 bg-white/20 transition-all duration-500 ease-out group-hover:w-full"></span>
        <span className="relative flex items-center justify-center gap-2">
          {isConverting ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              <span>Convertendo...</span>
            </>
          ) : (
            <>
              <FileDown className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
              <span>Converter e Baixar</span>
              <ArrowRight className="h-5 w-5 opacity-0 -translate-x-4 transition-all duration-500 group-hover:opacity-100 group-hover:translate-x-0" />
            </>
          )}
        </span>
      </Button>
      
      {(!user) && (
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/register")}
            className="animate-pulse"
          >
            Criar conta para obter créditos
          </Button>
        </div>
      )}
      
      {(user && user.credits <= 0) && (
        <div className="text-center mt-4">
          <Button 
            variant="outline" 
            onClick={() => navigate("/creditos")}
            className="animate-pulse text-red-600 border-red-200 hover:bg-red-50"
          >
            Comprar créditos para continuar
          </Button>
        </div>
      )}
    </>
  );
};

export default ConversionButton;
