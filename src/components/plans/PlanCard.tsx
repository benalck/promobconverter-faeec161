
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Check, Crown } from "lucide-react";

interface PlanProps {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
  formatCurrency: (value: number) => string;
  isPremium?: boolean;
}

const PlanCard: React.FC<PlanProps> = ({
  name,
  description,
  price,
  credits,
  duration_days,
  formatCurrency,
  isPremium = false,
}) => {
  return (
    <Card className={`border-2 ${isPremium ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
      <CardHeader className={`pb-6 ${isPremium ? 'bg-primary/5' : ''}`}>
        {isPremium && (
          <div className="absolute -top-3 left-0 right-0 flex justify-center">
            <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
              <Crown size={14} /> Mais popular
            </span>
          </div>
        )}
        <CardTitle className="text-2xl font-bold text-center">{name}</CardTitle>
        <CardDescription className="text-center">{description}</CardDescription>
        <div className="mt-4 text-center">
          <span className="text-4xl font-bold">{formatCurrency(price)}</span>
          <span className="text-gray-500">/mês</span>
        </div>
      </CardHeader>
      <CardContent className="pb-6">
        <ul className="space-y-3">
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span><strong>{credits}</strong> créditos</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span>Validade de <strong>{duration_days}</strong> dias</span>
          </li>
          <li className="flex items-start gap-2">
            <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
            <span>Suporte por email</span>
          </li>
        </ul>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-6">
        <Button 
          className="w-full py-6"
          disabled={true}
        >
          Compra temporariamente indisponível
        </Button>
      </CardFooter>
    </Card>
  );
};

export default PlanCard;
