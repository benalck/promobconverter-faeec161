
import React, { useState } from "react";
import TutorialProgress from "./tutorial/TutorialProgress";
import TutorialStep from "./tutorial/TutorialStep";
import TutorialIllustration from "./tutorial/TutorialIllustration";
import TutorialNavigation from "./tutorial/TutorialNavigation";
import { getTutorialSteps } from "./tutorial/TutorialStepData";

interface LoginTutorialProps {
  onClose: () => void;
}

const LoginTutorial: React.FC<LoginTutorialProps> = ({ onClose }) => {
  const [currentStep, setCurrentStep] = useState(0);
  const steps = getTutorialSteps();
  
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
      <TutorialProgress steps={steps.length} currentStep={currentStep} />

      {/* Current step content */}
      <TutorialStep 
        title={steps[currentStep].title}
        description={steps[currentStep].description}
        icon={steps[currentStep].icon}
        color={steps[currentStep].color}
      />

      {/* Screenshot or illustration */}
      <TutorialIllustration step={currentStep} />

      {/* Navigation buttons */}
      <TutorialNavigation 
        currentStep={currentStep}
        totalSteps={steps.length}
        onPrevious={prevStep}
        onNext={nextStep}
      />
    </div>
  );
};

export default LoginTutorial;
