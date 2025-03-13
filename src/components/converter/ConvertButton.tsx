
import React from "react";
import { Button } from "@/components/ui/button";
import { FileDown, ArrowRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface ConvertButtonProps {
  onClick: () => void;
  disabled: boolean;
  isConverting: boolean;
}

const ConvertButton: React.FC<ConvertButtonProps> = ({
  onClick,
  disabled,
  isConverting,
}) => {
  return (
    <Button
      onClick={onClick}
      disabled={disabled}
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
  );
};

export default ConvertButton;
