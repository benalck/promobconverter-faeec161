
import React from "react";
import { FileText, Ruler, Hammer, PencilRuler, CheckCircle, Armchair } from "lucide-react";
import { Button } from "@/components/ui/button";

interface TutorialIllustrationProps {
  step: number;
}

const TutorialIllustration = ({ step }: TutorialIllustrationProps) => {
  return (
    <div className="w-full h-48 bg-white/60 backdrop-blur-sm rounded-lg mb-6 flex items-center justify-center shadow-sm border border-amber-100">
      <div className="text-center p-4">
        {step === 0 && (
          <div className="border-2 border-dashed border-amber-300 rounded-lg p-8 flex flex-col items-center">
            <FileText className="h-8 w-8 text-amber-600 mb-2" />
            <p className="text-sm text-gray-700">Envie seu projeto ou planta baixa</p>
            <p className="text-xs text-gray-500 mt-1">formatos PDF, DWG ou JPG</p>
          </div>
        )}
        
        {step === 1 && (
          <div className="flex flex-col items-center">
            <div className="w-full bg-white rounded border border-gray-200 p-2 mb-2">
              <div className="flex items-center justify-between border-b pb-1 mb-1">
                <div className="font-medium text-sm">Ambiente</div>
                <div className="font-medium text-sm">Dimensões</div>
              </div>
              <div className="text-xs text-left">
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div>Cozinha</div>
                  <div>3.5m x 2.8m</div>
                </div>
                <div className="grid grid-cols-2 gap-2 py-1">
                  <div>Sala de Estar</div>
                  <div>4.2m x 3.5m</div>
                </div>
              </div>
            </div>
          </div>
        )}
        
        {step === 2 && (
          <div className="flex flex-col items-center">
            <div className="flex space-x-8">
              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-lg bg-amber-800"></div>
                <span className="text-xs">Madeira Nogueira</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-lg bg-gray-200"></div>
                <span className="text-xs">MDF Branco</span>
              </div>
              <div className="flex flex-col items-center space-y-1">
                <div className="w-10 h-10 rounded-lg bg-stone-700"></div>
                <span className="text-xs">Carvalho Escuro</span>
              </div>
            </div>
          </div>
        )}
        
        {step === 3 && (
          <div className="flex flex-col items-center">
            <Hammer className="h-12 w-12 text-amber-600 animate-bounce mb-2" />
            <div className="w-full bg-gray-200 h-2 rounded-full mt-2">
              <div className="bg-amber-600 h-2 rounded-full w-2/3"></div>
            </div>
            <p className="text-sm text-gray-600 mt-2">Produção: 65% concluída</p>
          </div>
        )}
        
        {step === 4 && (
          <div className="flex flex-col items-center">
            <div className="relative h-24 w-32 border-2 border-gray-300 rounded-lg overflow-hidden">
              <div className="absolute bottom-0 w-full h-10 bg-amber-700"></div>
              <div className="absolute bottom-10 w-20 h-14 left-6 bg-amber-900"></div>
            </div>
            <p className="text-sm mt-2">Visualização 3D do seu armário</p>
          </div>
        )}
        
        {step === 5 && (
          <div className="flex flex-col items-center">
            <Armchair className="h-12 w-12 text-amber-600 mb-2" />
            <CheckCircle className="h-6 w-6 text-green-600 mb-2 absolute top-2 right-2" />
            <p className="text-sm text-gray-600">Móveis instalados com sucesso!</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default TutorialIllustration;
