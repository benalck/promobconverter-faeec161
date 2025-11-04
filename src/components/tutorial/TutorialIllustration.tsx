import React from "react";
import { Upload, RefreshCw, FileSpreadsheet, CheckCircle, Download } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialIllustrationProps {
  step: number;
}

const TutorialIllustration = ({ step }: TutorialIllustrationProps) => {
  return (
    <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
      <div className="text-center p-4">
        {step === 0 && (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center">
            <Upload className="h-8 w-8 text-gray-400 mb-2" />
            <p className="text-sm text-gray-500">Arraste seu arquivo XML aqui</p>
            <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
          </div>
        )}
        
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded border border-gray-200 p-2 mb-2">
              <div className="flex items-center justify-between border-b pb-1 mb-1">
                <div className="font-medium text-sm">Nome</div>
                <div className="font-medium text-sm">Valor</div>
              </div>
              <div className="text-xs text-left">
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div>Cliente</div>
                  <div>Empresa XYZ</div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div>Identificador</div>
                  <div>123456</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="flex flex-col items-center">
            <div className="flex space-x-4">
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-gray-300"></div>
                <span className="text-xs">Selecionar tudo</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-4 h-4 rounded bg-primary"></div>
                <span className="text-xs">Cabeçalhos formatados</span>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="flex flex-col items-center">
            <RefreshCw className="h-12 w-12 text-primary animate-spin mb-2" />
            <p className="text-sm text-gray-600">Processando dados...</p>
          </div>
        )}
        
        {step === 4 && (
          <div className="flex flex-col items-center">
            <FileSpreadsheet className="h-12 w-12 text-green-600 mb-2" />
            <p className="text-sm font-medium">dados_convertidos.xls</p>
            <Button size="sm" variant="outline" className="mt-2 text-xs">
              <Download className="h-3 w-3 mr-1" /> Baixar
            </Button>
          </div>
        )}
        
        {step === 5 && (
          <div className="flex flex-col items-center">
            <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
            <p className="text-sm text-gray-600">Conversão concluída com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialIllustration;
