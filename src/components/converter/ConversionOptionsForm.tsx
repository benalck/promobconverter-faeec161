
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import FileUpload from "../FileUpload";

interface ConversionOptionsFormProps {
  outputFileName: string;
  setOutputFileName: (name: string) => void;
  onFileSelect: (file: File) => void;
}

const ConversionOptionsForm: React.FC<ConversionOptionsFormProps> = ({
  outputFileName,
  setOutputFileName,
  onFileSelect,
}) => {
  return (
    <div className="space-y-6">
      <FileUpload
        onFileSelect={onFileSelect}
        acceptedFileTypes=".xml"
        fileType="XML"
        className="animate-scale-in"
      />

      <div className="space-y-2 animate-fade-in" style={{ animationDelay: "100ms" }}>
        <Label htmlFor="outputFileName">Nome do Arquivo de Saída</Label>
        <Input
          id="outputFileName"
          value={outputFileName}
          onChange={(e) => setOutputFileName(e.target.value)}
          className="transition-all duration-300 focus-visible:ring-offset-2 bg-white/50 backdrop-blur-sm focus:bg-white"
          placeholder="Digite o nome do arquivo sem extensão"
        />
      </div>
    </div>
  );
};

export default ConversionOptionsForm;
