
import React from "react";
import { 
  FileText, 
  Ruler, 
  Hammer, 
  PencilRuler, 
  CheckCircle, 
  Armchair,
  Palette
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
      title: "Envie seu projeto",
      description: "Faça upload do seu projeto ou planta baixa para começarmos a planejar seus móveis.",
      icon: <FileText className="h-8 w-8" />,
      color: "bg-amber-100 text-amber-600"
    },
    {
      title: "Defina as medidas",
      description: "Especifique as dimensões de cada ambiente onde serão instalados os móveis planejados.",
      icon: <Ruler className="h-8 w-8" />,
      color: "bg-orange-100 text-orange-600"
    },
    {
      title: "Escolha os materiais",
      description: "Selecione entre diversos tipos de madeira, acabamentos e acessórios para seus móveis.",
      icon: <Palette className="h-8 w-8" />,
      color: "bg-brown-100 text-amber-800"
    },
    {
      title: "Acompanhe a produção",
      description: "Visualize cada etapa da produção dos seus móveis planejados em nossa marcenaria.",
      icon: <Hammer className="h-8 w-8" />,
      color: "bg-yellow-100 text-yellow-700"
    },
    {
      title: "Visualize em 3D",
      description: "Veja como ficarão seus móveis antes mesmo da fabricação através de renderizações 3D.",
      icon: <PencilRuler className="h-8 w-8" />,
      color: "bg-emerald-100 text-emerald-600"
    },
    {
      title: "Instalação profissional",
      description: "Nossos especialistas instalam seus móveis planejados com precisão e acabamento perfeito.",
      icon: <Armchair className="h-8 w-8" />,
      color: "bg-blue-100 text-blue-600"
    }
  ];
};
