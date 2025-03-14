
import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Separator } from "@/components/ui/separator";
import { AlertCircle, Check, Loader2 } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";
import { useQuery } from "@tanstack/react-query";

interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export default function CreditPurchase() {
  const navigate = useNavigate();
  const location = useLocation();
  const { user, refreshUserCredits } = useAuth();
  const { toast } = useToast();
  const [processingSessionId, setProcessingSessionId] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  
  // Get query params
  const searchParams = new URLSearchParams(location.search);
  const sessionId = searchParams.get("session_id");
  const planId = searchParams.get("plan_id");
  
  const { data: plans, isLoading, error } = useQuery({
    queryKey: ["plans"],
    queryFn: async () => {
      const { data, error } = await supabase
        .from("plans")
        .select("*")
        .eq("is_active", true)
        .order("price", { ascending: true });
        
      if (error) throw error;
      return data as Plan[];
    },
  });
  
  useEffect(() => {
    // Check if user is coming back from successful payment
    if (sessionId && planId && !processingSessionId) {
      handlePaymentSuccess(sessionId, planId);
    }
  }, [sessionId, planId]);
  
  const handlePaymentSuccess = async (sessionId: string, planId: string) => {
    setProcessingSessionId(sessionId);
    setIsProcessing(true);
    
    try {
      const { data, error } = await supabase.functions.invoke("process-payment", {
        body: { sessionId },
      });
      
      if (error) throw error;
      
      if (data.success) {
        await refreshUserCredits();
        
        toast({
          title: "Pagamento processado com sucesso!",
          description: `Seus créditos foram adicionados. Você agora tem ${data.credits} créditos.`,
          variant: "default",
        });
        
        // Clear query params
        window.history.replaceState({}, document.title, window.location.pathname);
      } else {
        throw new Error(data.error || "Erro ao processar o pagamento");
      }
    } catch (error) {
      console.error("Erro ao processar pagamento:", error);
      toast({
        title: "Erro ao processar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao processar seu pagamento",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };
  
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
    
    try {
      const origin = window.location.origin;
      const successUrl = `${origin}/creditos`;
      const cancelUrl = `${origin}/creditos`;
      
      const { data, error } = await supabase.functions.invoke("create-checkout", {
        body: {
          planId,
          userId: user.id,
          successUrl,
          cancelUrl,
        },
      });
      
      if (error) throw error;
      
      if (data.url) {
        window.location.href = data.url;
      } else {
        throw new Error("Não foi possível criar a sessão de checkout");
      }
    } catch (error) {
      console.error("Erro ao criar sessão de checkout:", error);
      toast({
        title: "Erro ao iniciar pagamento",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao iniciar o pagamento",
        variant: "destructive",
      });
    }
  };
  
  if (isLoading) {
    return (
      <div className="container max-w-4xl py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Carregando planos...</p>
      </div>
    );
  }
  
  if (error) {
    return (
      <div className="container max-w-4xl py-10">
        <Alert variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Erro</AlertTitle>
          <AlertDescription>
            Ocorreu um erro ao carregar os planos de créditos. Por favor, tente novamente mais tarde.
          </AlertDescription>
        </Alert>
      </div>
    );
  }
  
  if (isProcessing) {
    return (
      <div className="container max-w-4xl py-10 flex flex-col items-center justify-center min-h-[50vh]">
        <Loader2 className="h-10 w-10 animate-spin text-primary" />
        <p className="mt-4 text-muted-foreground">Processando seu pagamento...</p>
      </div>
    );
  }

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
        {plans?.map((plan) => (
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
                disabled={!user}
              >
                Comprar agora
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
