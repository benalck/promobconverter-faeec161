
import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  Upload, 
  FileSpreadsheet, 
  Settings, 
  Download, 
  CheckCircle, 
  ArrowRight,
  RefreshCw,
  FileCheck
} from "lucide-react";

interface TutorialStep {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

interface LoginTutorialProps {
  onClose: () => void;
}

const LoginTutorial: React.FC<LoginTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  
  const steps: TutorialStep[] = [
    {
      title: "Faça upload do arquivo XML",
      description: "Arraste e solte ou selecione seu arquivo XML para iniciar o processo de conversão.",
      icon: <Upload className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Visualize os dados",
      description: "Confira os dados extraídos do seu arquivo XML antes da conversão.",
      icon: <FileCheck className="h-8 w-8" />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Configure as opções",
      description: "Personalize o formato da planilha e escolha quais dados serão incluídos.",
      icon: <Settings className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Processar conversão",
      description: "Nossa aplicação processa rapidamente seus dados e prepara o arquivo Excel.",
      icon: <RefreshCw className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Baixe o resultado",
      description: "Faça download do arquivo Excel pronto para uso com todos os seus dados organizados.",
      icon: <Download className="h-8 w-8" />,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Pronto!",
      description: "Utilize sua planilha Excel com todos os dados convertidos de forma organizada.",
      icon: <CheckCircle className="h-8 w-8" />,
      color: "bg-emerald-100 text-emerald-600"
    }
  ];
  
  const nextStep = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    } else {
      onClose();
    }
  };
  
  const prevStep = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  return (
    <div className="py-4">
      {/* Progress bar */}
      <div className="flex justify-between mb-8 px-2">
        {steps.map((_, index) => (
          <div key={index} className="flex items-center">
            <div 
              className={`w-8 h-8 rounded-full flex items-center justify-center transition-colors duration-300
                ${index <= currentStep ? "bg-primary text-white" : "bg-gray-200 text-gray-500"}`}
            >
              {index < currentStep ? (
                <CheckCircle className="h-5 w-5" />
              ) : (
                <span>{index + 1}</span>
              )}
            </div>
            
            {index < steps.length - 1 && (
              <div 
                className={`h-1 w-12 sm:w-16 md:w-24 mx-1 
                  ${index < currentStep ? "bg-primary" : "bg-gray-200"}`}
              ></div>
            )}
          </div>
        ))}
      </div>

      {/* Current step content */}
      <div className="flex flex-col items-center justify-center p-6 mb-6">
        <div className={`rounded-full p-6 mb-6 ${steps[currentStep].color}`}>
          {steps[currentStep].icon}
        </div>
        <h3 className="text-xl font-semibold mb-3">{steps[currentStep].title}</h3>
        <p className="text-center text-gray-600 max-w-md">
          {steps[currentStep].description}
        </p>
      </div>

      {/* Screenshot or illustration */}
      <div className="w-full h-48 bg-gray-100 rounded-lg mb-6 flex items-center justify-center">
        <div className="text-center p-4">
          {currentStep === 0 && (
            <div className="border-2 border-dashed border-gray-300 rounded-lg p-8 flex flex-col items-center">
              <Upload className="h-8 w-8 text-gray-400 mb-2" />
              <p className="text-sm text-gray-500">Arraste seu arquivo XML aqui</p>
              <p className="text-xs text-gray-400 mt-1">ou clique para selecionar</p>
            </div>
          )}
          
          {currentStep === 1 && (
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
          
          {currentStep === 2 && (
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
          
          {currentStep === 3 && (
            <div className="flex flex-col items-center">
              <RefreshCw className="h-12 w-12 text-primary animate-spin mb-2" />
              <p className="text-sm text-gray-600">Processando dados...</p>
            </div>
          )}
          
          {currentStep === 4 && (
            <div className="flex flex-col items-center">
              <FileSpreadsheet className="h-12 w-12 text-green-600 mb-2" />
              <p className="text-sm font-medium">dados_convertidos.xlsx</p>
              <Button size="sm" variant="outline" className="mt-2 text-xs">
                <Download className="h-3 w-3 mr-1" /> Baixar
              </Button>
            </div>
          )}
          
          {currentStep === 5 && (
            <div className="flex flex-col items-center">
              <CheckCircle className="h-12 w-12 text-green-600 mb-2" />
              <p className="text-sm text-gray-600">Conversão concluída com sucesso!</p>
            </div>
          )}
        </div>
      </div>

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <Button 
          variant="outline" 
          onClick={prevStep}
          disabled={currentStep === 0}
        >
          Anterior
        </Button>
        
        <Button onClick={nextStep}>
          {currentStep === steps.length - 1 ? "Concluir" : "Próximo"}
          <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default LoginTutorial;
