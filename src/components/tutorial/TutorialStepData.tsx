
import React from "react";
import { 
  Upload, 
  FileSpreadsheet, 
  Settings, 
  Download, 
  CheckCircle, 
  RefreshCw,
  FileCheck
} from "lucide-react";

export interface TutorialStepType {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

export const getTutorialSteps = (): TutorialStepType[] => {
  return [
    {
      title: "Faça upload do arquivo XML Promob",
      description: "Arraste e solte ou selecione seu arquivo XML Promob para iniciar o processo de conversão.",
      icon: <Upload className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    },
    {
      title: "Visualize os dados",
      description: "Confira os dados extraídos do seu arquivo XML Promob antes da conversão.",
      icon: <FileCheck className="h-8 w-8" />,
      color: "bg-green-100 text-green-600"
    },
    {
      title: "Configure as opções",
      description: "Personalize o formato do plano de corte e escolha quais dados serão incluídos.",
      icon: <Settings className="h-8 w-8" />,
      color: "bg-purple-100 text-purple-600"
    },
    {
      title: "Processar conversão",
      description: "Nossa aplicação processa rapidamente seus dados e prepara o plano de corte Excel.",
      icon: <RefreshCw className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Baixe o resultado",
      description: "Faça download do plano de corte Excel pronto para uso com todos os seus dados organizados.",
      icon: <Download className="h-8 w-8" />,
      color: "bg-indigo-100 text-indigo-600"
    },
    {
      title: "Pronto!",
      description: "Utilize seu plano de corte Excel com todos os dados convertidos de forma organizada.",
      icon: <CheckCircle className="h-8 w-8" />,
      color: "bg-emerald-100 text-emerald-600"
    }
  ];
};
