
import React from 'react';
import { Button } from "@/components/ui/button";

interface LowCreditsWarningProps {
  onBuyCredits: () => void;
}

/**
 * Componente para exibir aviso de que o usuário está com poucos créditos
 */
const LowCreditsWarning: React.FC<LowCreditsWarningProps> = React.memo(({ onBuyCredits }) => (
  <div className="absolute -bottom-20 right-0 flex flex-col gap-2 bg-amber-50 text-amber-700 border border-amber-200 text-xs rounded-md px-3 py-2 whitespace-nowrap">
    <p>Seus créditos estão acabando!</p>
    <Button 
      size="sm" 
      variant="outline" 
      className="bg-amber-100 hover:bg-amber-200 border-amber-300 text-amber-800"
      onClick={onBuyCredits}
    >
      Comprar mais créditos
    </Button>
  </div>
));

LowCreditsWarning.displayName = 'LowCreditsWarning';

export default LowCreditsWarning;
