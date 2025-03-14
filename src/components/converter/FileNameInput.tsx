
import React from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface FileNameInputProps {
  outputFileName: string;
  setOutputFileName: (name: string) => void;
}

const FileNameInput: React.FC<FileNameInputProps> = ({ 
  outputFileName, 
  setOutputFileName 
}) => {
  return (
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
  );
};

export default FileNameInput;
