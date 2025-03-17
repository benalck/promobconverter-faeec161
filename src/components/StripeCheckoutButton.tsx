import React, { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { buyCredits, buyPlan } from '@/integrations/stripe';
import { Loader2, Mail } from 'lucide-react';
import ErrorDisplay from './ErrorDisplay';

interface StripeCheckoutButtonProps {
  mode: 'credits' | 'subscription';
  amount?: 10 | 50 | 100;
  planType?: 'monthly' | 'annual';
  label?: string;
  variant?: 'default' | 'outline' | 'secondary' | 'destructive' | 'ghost' | 'link';
  size?: 'default' | 'sm' | 'lg' | 'icon';
  className?: string;
  children?: React.ReactNode;
}

const StripeCheckoutButton: React.FC<StripeCheckoutButtonProps> = ({
  mode,
  amount,
  planType,
  label,
  variant = 'default',
  size = 'default',
  className,
  children,
}) => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const { toast } = useToast();
  const { user } = useAuth();

  const handleCheckout = async () => {
    if (!user || !user.id || !user.email) {
      toast({
        title: 'Erro',
        description: 'Você precisa estar logado para fazer uma compra',
        variant: 'destructive',
      });
      return;
    }

    // Limpar erro anterior
    setError(null);
    setIsLoading(true);

    try {
      if (mode === 'credits' && amount) {
        console.log('Iniciando compra de créditos:', { amount, userId: user.id });
        await buyCredits(user.id, user.email, amount);
      } else if (mode === 'subscription' && planType) {
        console.log('Iniciando assinatura:', { planType, userId: user.id });
        await buyPlan(user.id, user.email, planType);
      } else {
        throw new Error('Configuração inválida');
      }
    } catch (error: any) {
      const errorMessage = error?.message || 'Erro desconhecido';
      console.error('Erro detalhado ao iniciar checkout:', error);
      
      // Incrementar contador de tentativas
      setRetryCount(prev => prev + 1);
      
      // Definir a mensagem de erro para exibição
      setError(errorMessage);
      
      toast({
        title: 'Erro ao processar pagamento',
        description: 'Não foi possível iniciar o processo de pagamento. Tente novamente.',
        variant: 'destructive',
      });
      
      setIsLoading(false);
    }
  };

  // Função para contatar o suporte
  const handleContactSupport = () => {
    // Preparar dados para o email
    const subject = encodeURIComponent('Problema com pagamento');
    const body = encodeURIComponent(`
      Olá, estou tendo problemas para realizar um pagamento.
      
      Detalhes:
      - Usuário: ${user?.email || 'Não disponível'}
      - ID: ${user?.id || 'Não disponível'}
      - Produto: ${mode === 'credits' ? `${amount} créditos` : `Plano ${planType}`}
      - Erro: ${error || 'Não disponível'}
      
      Por favor, me ajudem a resolver este problema.
    `);
    
    // Abrir cliente de email
    window.open(`mailto:suporte@promobconverter.com.br?subject=${subject}&body=${body}`);
    
    toast({
      title: 'Contato com suporte',
      description: 'Abrindo seu cliente de email para contatar o suporte.',
    });
  };

  // Determinar o texto do botão
  const buttonText = label || (
    mode === 'credits' 
      ? `Comprar ${amount} créditos` 
      : `Assinar plano ${planType === 'monthly' ? 'mensal' : 'anual'}`
  );

  // Se houver erro, mostrar o componente de erro
  if (error) {
    return (
      <div className="space-y-4">
        <ErrorDisplay 
          message={error}
          onRetry={() => {
            setError(null);
            handleCheckout();
          }}
        />
        
        {/* Mostrar botão de contato com suporte após múltiplas tentativas */}
        {retryCount >= 2 && (
          <div className="text-center">
            <Button
              variant="outline"
              onClick={handleContactSupport}
              className="flex items-center gap-2"
            >
              <Mail className="h-4 w-4" />
              Contatar suporte
            </Button>
          </div>
        )}
      </div>
    );
  }

  return (
    <Button
      variant={variant}
      size={size}
      className={className}
      onClick={handleCheckout}
      disabled={isLoading}
    >
      {isLoading ? (
        <>
          <Loader2 className="mr-2 h-4 w-4 animate-spin" />
          Processando...
        </>
      ) : children || buttonText}
    </Button>
  );
};

export default StripeCheckoutButton; 