
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

  return (
    <div className="container mx-auto py-8 px-4">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold mb-2">Nossos planos</h1>
        <p className="text-lg text-gray-600">
          Em breve você poderá adquirir créditos para converter seus arquivos XML
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
                  disabled={true}
                >
                  Em breve disponível
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
            <h3 className="font-semibold mb-1">Informação sobre pagamentos</h3>
            <p className="text-sm text-gray-600">
              Estamos trabalhando na integração de pagamentos. Em breve você poderá adquirir créditos para suas conversões.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
