import React, { useEffect, useState } from "react";
import { useNavigate, useSearchParams } from "react-router-dom";
import { CheckCircle, Loader2, XCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";

const PaymentSuccess: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { user, refreshUserCredits } = useAuth();
  const { toast } = useToast();
  const [isProcessing, setIsProcessing] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const processPayment = async () => {
      try {
        setIsProcessing(true);
        
        // Obter o ID da sessão da URL
        const sessionId = searchParams.get('session_id');
        
        if (!sessionId) {
          throw new Error('ID da sessão não encontrado');
        }
        
        if (!user) {
          throw new Error('Usuário não autenticado');
        }
        
        // O webhook já deve ter processado o pagamento
        // Aqui apenas atualizamos a UI
        await new Promise(resolve => setTimeout(resolve, 1500));
        
        // Atualizar os créditos na sessão
        await refreshUserCredits();
        
        // Limpar URL para evitar reprocessamento
        window.history.replaceState({}, document.title, '/payment/success');
        
        toast({
          title: "Pagamento confirmado!",
          description: "Seus créditos foram adicionados à sua conta.",
        });
      } catch (err: any) {
        console.error('Erro ao processar pagamento:', err);
        setError(err.message || 'Erro desconhecido');
        
        toast({
          title: "Erro no processamento",
          description: "Não foi possível processar seu pagamento.",
          variant: "destructive",
        });
      } finally {
        setIsProcessing(false);
      }
    };
    
    processPayment();
  }, []);

  return (
    <div className="container max-w-md mx-auto py-16 px-4">
      <div className="bg-white rounded-lg shadow-md p-8 border border-gray-200">
        <div className="flex flex-col items-center justify-center text-center">
          {isProcessing ? (
            <>
              <Loader2 className="h-16 w-16 text-blue-500 animate-spin mb-4" />
              <h1 className="text-2xl font-bold mb-2">Processando pagamento...</h1>
              <p className="text-gray-600 mb-6">
                Estamos confirmando seu pagamento. Por favor, aguarde.
              </p>
            </>
          ) : error ? (
            <>
              <XCircle className="h-16 w-16 text-red-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2 text-red-600">Erro no pagamento</h1>
              <p className="text-gray-600 mb-6">
                {error}. Entre em contato com o suporte.
              </p>
            </>
          ) : (
            <>
              <CheckCircle className="h-16 w-16 text-green-500 mb-4" />
              <h1 className="text-2xl font-bold mb-2">Pagamento confirmado!</h1>
              <p className="text-gray-600 mb-6">
                Seus créditos foram adicionados à sua conta com sucesso.
              </p>
            </>
          )}
          
          <div className="flex gap-4 w-full">
            <Button
              onClick={() => navigate("/")}
              className="flex-1"
            >
              Começar a usar
            </Button>
            <Button
              onClick={() => navigate("/plans")}
              variant="outline"
              className="flex-1"
            >
              Ver mais planos
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PaymentSuccess; 