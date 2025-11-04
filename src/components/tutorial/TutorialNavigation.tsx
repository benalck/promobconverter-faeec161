
import React from "react";
import { Button } from "@/components/ui/button";
import { ArrowRight } from "lucide-react";

interface TutorialNavigationProps {
  currentStep: number;
  totalSteps: number;
  onPrevious: () => void;
  onNext: () => void;
}

const TutorialNavigation = ({ 
  currentStep, 
  totalSteps, 
  onPrevious, 
  onNext 
}: TutorialNavigationProps) => {
  return (
    <div className="flex justify-between mt-6">
      <Button 
        variant="outline" 
        onClick={onPrevious}
        disabled={currentStep === 0}
      >
        Anterior
      </Button>
      
      <Button onClick={onNext}>
        {currentStep === totalSteps - 1 ? "Concluir" : "Próximo"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </Button>
    </div>
  );
};

export default TutorialNavigation;
