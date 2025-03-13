
import React from 'react';
import { Button } from "@/components/ui/button";

interface NoCreditsWarningProps {
  onBuyCredits: () => void;
}

const NoCreditsWarning: React.FC<NoCreditsWarningProps> = React.memo(({ onBuyCredits }) => (
  <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-red-50 text-red-700 border border-red-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
    <p>Você não tem mais créditos!</p>
    <Button 
      size="sm" 
      className="bg-red-600 hover:bg-red-700"
      onClick={onBuyCredits}
    >
      Comprar créditos agora
    </Button>
  </div>
));

NoCreditsWarning.displayName = 'NoCreditsWarning';

export default NoCreditsWarning;
