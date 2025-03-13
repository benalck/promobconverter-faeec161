
import React from "react";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Check, Coins, Plus } from "lucide-react";

interface CustomCreditsCardProps {
  customCredits: number;
  setCustomCredits: (value: number) => void;
  formatCurrency: (value: number) => string;
  isUpdatingCredits: boolean;
  onBuyCredits: () => void;
  disabled: boolean;
}

const CustomCreditsCard: React.FC<CustomCreditsCardProps> = ({
  customCredits,
  setCustomCredits,
  formatCurrency,
  isUpdatingCredits,
  onBuyCredits,
  disabled
}) => {
  return (
    <Card className="border-2 border-primary shadow-lg max-w-md mx-auto">
      <CardHeader className="pb-6 bg-primary/5">
        <div className="absolute -top-3 left-0 right-0 flex justify-center">
          <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
            <Coins size={14} /> Créditos personalizados
          </span>
        </div>
        <CardTitle className="text-2xl font-bold text-center">Compre quanto quiser</CardTitle>
        <CardDescription className="text-center">Cada crédito custa R$ 1,00</CardDescription>
      </CardHeader>
      <CardContent className="space-y-4 pb-6">
        <div className="space-y-2">
          <Label htmlFor="creditAmount">Quantidade de créditos</Label>
          <div className="flex items-center gap-2">
            <Input
              id="creditAmount"
              type="number"
              min="1"
              max="1000"
              value={customCredits}
              onChange={(e) => setCustomCredits(parseInt(e.target.value) || 0)}
              className="text-lg"
            />
            <div className="text-lg font-bold">
              = {formatCurrency(customCredits)}
            </div>
          </div>
        </div>
        
        <div className="pt-4">
          <ul className="space-y-3">
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>1 crédito = 1 conversão XML para Excel</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Sem validade para expirar</span>
            </li>
            <li className="flex items-start gap-2">
              <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
              <span>Suporte por email</span>
            </li>
          </ul>
        </div>
      </CardContent>
      <CardFooter className="flex justify-center pt-2 pb-6">
        <Button 
          className="w-full py-6 text-lg gap-2"
          disabled={isUpdatingCredits || disabled}
          onClick={onBuyCredits}
        >
          {isUpdatingCredits ? (
            <>
              <div className="h-5 w-5 animate-spin rounded-full border-b-2 border-white"></div>
              <span>Processando...</span>
            </>
          ) : (
            <>
              <Plus className="h-5 w-5" />
              <span>Comprar {customCredits} créditos</span>
            </>
          )}
        </Button>
      </CardFooter>
    </Card>
  );
};

export default CustomCreditsCard;
