
import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

// Mock plans data
const MOCK_PLANS = [
  {
    id: "plan_basic",
    name: "Básico",
    description: "Ideal para uso ocasional",
    price: 29.90,
    credits: 10,
    duration_days: 30,
    is_active: true
  },
  {
    id: "plan_standard",
    name: "Padrão",
    description: "Para uso regular",
    price: 59.90,
    credits: 25,
    duration_days: 30,
    is_active: true
  },
  {
    id: "plan_premium",
    name: "Premium",
    description: "Para uso intensivo",
    price: 99.90,
    credits: 50,
    duration_days: 30,
    is_active: true
  }
];

export default function CreditPurchase() {
  const navigate = useNavigate();
  const { user, updateUser } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(false);
  
  const handleBuyCredits = async (planId: string) => {
    if (!user) {
      toast({
        title: "Você precisa estar logado",
        description: "Faça login para comprar créditos",
        variant: "destructive",
      });
      navigate("/login");
      return;
    }
    
    setIsProcessing(true);
    
    try {
      // In a real implementation, this would call a payment API
      // For now, we'll simulate a purchase
      setTimeout(() => {
        const plan = MOCK_PLANS.find(p => p.id === planId);
        
        if (plan) {
          // Update user credits
          const newCredits = (user.credits || 0) + plan.credits;
          updateUser(user.id, { credits: newCredits });
          
          toast({
            title: "Compra realizada com sucesso!",
            description: `Foram adicionados ${plan.credits} créditos à sua conta.`,
            variant: "default",
          });
        }
        
        setIsProcessing(false);
      }, 1500);
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: "Ocorreu um erro ao processar seu pagamento. Tente novamente mais tarde.",
        variant: "destructive",
      });
      setIsProcessing(false);
    }
  };

  return (
    <div className="container max-w-4xl py-10">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold tracking-tight">Compre Créditos</h1>
        <p className="text-muted-foreground mt-2">
          Escolha o plano que melhor se adapta às suas necessidades
        </p>
      </div>
      
      {user && (
        <div className="bg-primary/10 rounded-lg p-4 mb-8 text-center">
          <p className="text-primary font-medium">
            Você tem atualmente <span className="font-bold">{user.credits}</span> créditos
          </p>
        </div>
      )}
      
      <div className="grid md:grid-cols-3 gap-6">
        {MOCK_PLANS.map((plan) => (
          <Card key={plan.id} className="flex flex-col">
            <CardHeader>
              <CardTitle>{plan.name}</CardTitle>
              <CardDescription>{plan.description}</CardDescription>
            </CardHeader>
            <CardContent className="flex-grow">
              <div className="text-3xl font-bold">
                R$ {plan.price.toFixed(2).replace(".", ",")}
              </div>
              <p className="text-muted-foreground mt-1">Pagamento único</p>
              
              <Separator className="my-4" />
              
              <ul className="space-y-2">
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>{plan.credits} créditos</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Válido por {plan.duration_days} dias</span>
                </li>
                <li className="flex items-center">
                  <Check className="h-4 w-4 mr-2 text-primary" />
                  <span>Suporte por email</span>
                </li>
              </ul>
            </CardContent>
            <CardFooter>
              <Button 
                className="w-full" 
                onClick={() => handleBuyCredits(plan.id)}
                disabled={!user || isProcessing}
              >
                {isProcessing ? "Processando..." : "Comprar agora"}
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {!user && (
        <Alert className="mt-8">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Atenção</AlertTitle>
          <AlertDescription>
            Você precisa estar logado para comprar créditos.{" "}
            <Button 
              variant="link" 
              className="p-0 h-auto font-semibold" 
              onClick={() => navigate("/login")}
            >
              Faça login aqui
            </Button>
          </AlertDescription>
        </Alert>
      )}
    </div>
  );
}
