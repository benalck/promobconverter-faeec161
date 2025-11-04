
import { CheckCircle } from "lucide-react";

interface TutorialProgressProps {
  steps: number;
  currentStep: number;
}

const TutorialProgress = ({ steps, currentStep }: TutorialProgressProps) => {
  return (
    <div className="flex justify-between mb-8 px-2">
      {Array.from({ length: steps }).map((_, index) => (
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
          
          {index < steps - 1 && (
            <div 
              className={`h-1 w-12 sm:w-16 md:w-24 mx-1 
                ${index < currentStep ? "bg-primary" : "bg-gray-200"}`}
            ></div>
          )}
        </div>
      ))}
    </div>
  );
};

export default TutorialProgress;
