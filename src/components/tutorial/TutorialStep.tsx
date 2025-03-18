
import React from "react";

interface TutorialStepProps {
  title: string;
  description: string;
  icon: React.ReactNode;
  color: string;
}

const TutorialStep = ({ title, description, icon, color }: TutorialStepProps) => {
  return (
    <div className="flex flex-col items-center justify-center p-6 mb-6">
      <div className={`rounded-full p-6 mb-6 ${color}`}>
        {icon}
      </div>
      <h3 className="text-xl font-semibold mb-3">{title}</h3>
      <p className="text-center text-gray-600 max-w-md">
        {description}
      </p>
    </div>
  );
};

export default TutorialStep;
