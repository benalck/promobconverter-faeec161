
import { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import { supabase } from "@/integrations/supabase/client";
import { isAfter } from "date-fns";

export interface Plan {
  id: string;
  name: string;
  description: string | null;
  price: number;
  credits: number;
  duration_days: number;
  is_active: boolean;
  created_at: string;
}

export const usePlans = () => {
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

  return {
    plans,
    loading,
    customCredits,
    setCustomCredits,
    isUpdatingCredits,
    formatCurrency,
    isPlanActive,
    handleBuyCredits,
    user
  };
};
