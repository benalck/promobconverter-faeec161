
import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { useFileConversion } from "@/hooks/useFileConversion";
import ConversionOptionsForm from "./converter/ConversionOptionsForm";
import ConvertButton from "./converter/ConvertButton";
import CreditsDisplay from "./converter/CreditsDisplay";
import BannedMessage from "./BannedMessage";

interface ConverterFormProps {
  className?: string;
}

const ConverterForm: React.FC<ConverterFormProps> = ({ className }) => {
  const {
    xmlFile,
    outputFileName,
    isConverting,
    handleFileSelect,
    setOutputFileName,
    handleConvert,
    user
  } = useFileConversion();

  if (user?.isBanned) {
    return <BannedMessage />;
  }

  return (
    <Card
      className={cn(
        "w-full max-w-3xl mx-auto transition-all duration-500 hover:shadow-glass relative overflow-hidden",
        "backdrop-blur-sm bg-white/90 border border-white/40",
        className
      )}
    >
      <CardHeader className="text-center pb-4">
        <div className="absolute top-0 right-0 left-0 h-1 bg-gradient-to-r from-primary/30 via-primary to-primary/30"></div>
        <CardTitle className="text-2xl sm:text-3xl tracking-tight mt-2 animate-slide-down">
          XML para Excel
        </CardTitle>
        <CardDescription className="text-lg animate-slide-up">
          Converta seus arquivos XML para planilhas Excel formatadas
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-8 pb-8">
        <div className="space-y-6">
          <ConversionOptionsForm 
            outputFileName={outputFileName} 
            setOutputFileName={setOutputFileName} 
            onFileSelect={handleFileSelect} 
          />

          <CreditsDisplay user={user} />

          <ConvertButton 
            onClick={handleConvert}
            disabled={!xmlFile || isConverting || !user || user.credits <= 0}
            isConverting={isConverting}
          />
        </div>
      </CardContent>
    </Card>
  );
};

export default ConverterForm;
