
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, AlertCircle } from "lucide-react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";

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

export default function Plans() {
  const [plans, setPlans] = useState<Plan[]>([]);
  const [loading, setLoading] = useState(true);
  const [purchasingPlanId, setPurchasingPlanId] = useState<string | null>(null);
  const { user, refreshUserCredits } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();

  useEffect(() => {
    const fetchPlans = async () => {
      try {
        setLoading(true);
        const { data, error } = await supabase
          .from('plans')
          .select('*')
          .eq('is_active', true)
          .order('price', { ascending: true });
          
        if (error) throw error;
        setPlans(data || []);
      } catch (error) {
        console.error('Erro ao buscar planos:', error);
        toast({
          title: "Erro ao carregar planos",
          description: "Não foi possível carregar os planos disponíveis. Tente novamente mais tarde.",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    };
    
    fetchPlans();
  }, []);

  const handlePurchase = async (planId: string) => {
    if (!user) {
      toast({
        title: "Faça login para continuar",
        description: "Você precisa estar logado para adquirir um plano.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }
    
    try {
      setPurchasingPlanId(planId);
      
      // Buscar detalhes do plano
      const { data: plan, error: planError } = await supabase
        .from('plans')
        .select('*')
        .eq('id', planId)
        .single();
        
      if (planError) throw planError;
      
      // Calcular data de expiração
      const expiryDate = new Date();
      expiryDate.setDate(expiryDate.getDate() + plan.duration_days);
      
      // Registrar a compra
      const { error: purchaseError } = await supabase
        .from('credit_purchases')
        .insert([
          {
            user_id: user.id,
            plan_id: planId,
            amount: plan.price,
            credits: plan.credits,
            expiry_date: expiryDate.toISOString()
          }
        ]);
        
      if (purchaseError) throw purchaseError;
      
      // Atualizar os créditos e o plano ativo do usuário
      const { error: profileError } = await supabase
        .from('profiles')
        .update({
          credits: (user.credits || 0) + plan.credits,
          active_plan: planId,
          plan_expiry_date: expiryDate.toISOString()
        })
        .eq('id', user.id);
        
      if (profileError) throw profileError;
      
      // Atualizar o contexto de usuário
      await refreshUserCredits();
      
      toast({
        title: "Plano adquirido com sucesso!",
        description: `Você adquiriu o plano ${plan.name} e recebeu ${plan.credits} créditos.`,
      });
      
      // Em um ambiente real, você redirecionaria para um gateway de pagamento
      // Por agora, vamos apenas simular uma compra bem-sucedida
      
    } catch (error) {
      console.error('Erro ao adquirir plano:', error);
      toast({
        title: "Erro ao adquirir plano",
        description: "Não foi possível processar sua compra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setPurchasingPlanId(null);
    }
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', { 
      style: 'currency', 
      currency: 'BRL' 
    }).format(value);
  };
  
  const isPlanActive = () => {
    if (!user?.planExpiryDate) return false;
    
    try {
      const expiryDate = new Date(user.planExpiryDate);
      return isAfter(expiryDate, new Date());
    } catch (error) {
      return false;
    }
  };
  
  const formatDate = (dateString: string | null | undefined) => {
    if (!dateString) return "Não disponível";
    try {
      return format(new Date(dateString), "dd 'de' MMMM 'de' yyyy", { locale: ptBR });
    } catch (error) {
      return "Data inválida";
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Escolha seu plano</h1>
        <p className="text-lg text-gray-600">
          Adquira créditos para converter seus arquivos XML
        </p>
      </div>
      
      {user && (
        <div className="bg-gray-50 rounded-lg p-6 mb-8 border border-gray-200">
          <div className="flex flex-col md:flex-row justify-between items-center">
            <div>
              <h2 className="text-xl font-semibold mb-2">Seus créditos</h2>
              <p className="text-gray-600">
                Você possui atualmente <span className="font-bold text-primary">{user.credits}</span> créditos
              </p>
              {user.activePlan && user.planExpiryDate && (
                <div className="mt-2">
                  <p className="text-sm text-gray-500">
                    Plano ativo: <span className="font-medium">{user.activePlan.name}</span>
                  </p>
                  <p className="text-sm text-gray-500">
                    Válido até: <span className="font-medium">{formatDate(user.planExpiryDate)}</span>
                  </p>
                </div>
              )}
            </div>
            <div className="mt-4 md:mt-0">
              <Button onClick={() => navigate("/")} className="bg-primary">
                Ir para conversões
              </Button>
            </div>
          </div>
        </div>
      )}
      
      {loading ? (
        <div className="flex justify-center my-12">
          <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-primary"></div>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {plans.map((plan) => (
            <Card key={plan.id} className={`border-2 ${plan.name === 'Profissional' ? 'border-primary shadow-lg' : 'border-gray-200'}`}>
              <CardHeader className={`pb-6 ${plan.name === 'Profissional' ? 'bg-primary/5' : ''}`}>
                {plan.name === 'Profissional' && (
                  <div className="absolute -top-3 left-0 right-0 flex justify-center">
                    <span className="bg-primary text-white text-xs px-3 py-1 rounded-full font-medium flex items-center gap-1">
                      <Crown size={14} /> Mais popular
                    </span>
                  </div>
                )}
                <CardTitle className="text-2xl font-bold text-center">{plan.name}</CardTitle>
                <CardDescription className="text-center">{plan.description}</CardDescription>
                <div className="mt-4 text-center">
                  <span className="text-4xl font-bold">{formatCurrency(plan.price)}</span>
                  <span className="text-gray-500">/mês</span>
                </div>
              </CardHeader>
              <CardContent className="pb-6">
                <ul className="space-y-3">
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span><strong>{plan.credits}</strong> créditos</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <Check className="h-5 w-5 text-green-500 shrink-0 mt-0.5" />
                    <span>Validade de <strong>{plan.duration_days}</strong> dias</span>
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
                  onClick={() => handlePurchase(plan.id)} 
                  disabled={purchasingPlanId === plan.id}
                >
                  {purchasingPlanId === plan.id ? (
                    <div className="flex items-center gap-2">
                      <div className="h-4 w-4 border-2 border-current border-t-transparent animate-spin rounded-full"></div>
                      Processando...
                    </div>
                  ) : (
                    'Adquirir plano'
                  )}
                </Button>
              </CardFooter>
            </Card>
          ))}
        </div>
      )}
      
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Aviso</h3>
            <p className="text-sm text-gray-600">
              Esta é uma simulação. Em um ambiente real, você seria redirecionado para um gateway de pagamento.
              Para o propósito desta demonstração, as "compras" são processadas automaticamente.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
