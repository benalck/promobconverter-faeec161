
import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { useToast } from "@/hooks/use-toast";
import { Crown, Check, AlertCircle, Plus, Coins } from "lucide-react";
import { format, isAfter } from "date-fns";
import { ptBR } from "date-fns/locale";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
  const [customCredits, setCustomCredits] = useState(10);
  const [isUpdatingCredits, setIsUpdatingCredits] = useState(false);
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

  const handleBuyCredits = async () => {
    if (!user) {
      toast({
        title: "Usuário não autenticado",
        description: "Você precisa estar logado para comprar créditos.",
        variant: "destructive",
      });
      navigate("/register");
      return;
    }

    if (customCredits <= 0) {
      toast({
        title: "Quantidade inválida",
        description: "Por favor, insira uma quantidade válida de créditos para comprar.",
        variant: "destructive",
      });
      return;
    }

    try {
      setIsUpdatingCredits(true);
      
      // Simulação de compra (sem integração real com pagamento)
      // Em uma implementação real, aqui você chamaria sua API de pagamento
      
      // Atualiza os créditos do usuário diretamente
      const { error } = await supabase
        .from('profiles')
        .update({ credits: user.credits + customCredits })
        .eq('id', user.id);
        
      if (error) throw error;
      
      await refreshUserCredits();
      
      toast({
        title: "Compra realizada com sucesso!",
        description: `Você adquiriu ${customCredits} créditos para seu perfil.`,
        variant: "default",
      });
      
      // Redireciona para a página inicial após a compra
      navigate("/");
      
    } catch (error) {
      console.error('Erro ao comprar créditos:', error);
      toast({
        title: "Erro na compra",
        description: "Não foi possível completar a compra. Tente novamente mais tarde.",
        variant: "destructive",
      });
    } finally {
      setIsUpdatingCredits(false);
    }
  };

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Comprar Créditos</h1>
        <p className="text-lg text-gray-600">
          Adicione mais créditos à sua conta
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
        <>
          <div className="mb-12">
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
                  disabled={isUpdatingCredits || !user}
                  onClick={handleBuyCredits}
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
          </div>
          
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
                    disabled={true}
                  >
                    Compra temporariamente indisponível
                  </Button>
                </CardFooter>
              </Card>
            ))}
          </div>
        </>
      )}
      
      <div className="mt-12 bg-amber-50 border border-amber-200 rounded-lg p-6">
        <div className="flex gap-4">
          <AlertCircle className="h-6 w-6 text-amber-500 shrink-0" />
          <div>
            <h3 className="font-semibold mb-1">Informação sobre pagamentos</h3>
            <p className="text-sm text-gray-600">
              Esse é um sistema de demonstração. Em um ambiente de produção, aqui seria integrado um sistema de pagamento real como Stripe, PayPal ou mercado pago.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
