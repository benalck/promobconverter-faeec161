import React from 'react';
import { XCircle, Wifi, Globe, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/button';

interface ErrorDisplayProps {
  title?: string;
  message: string;
  onRetry?: () => void;
}

const ErrorDisplay: React.FC<ErrorDisplayProps> = ({
  title = 'Erro ao processar pagamento',
  message,
  onRetry
}) => {
  // Determinar o tipo de erro para mostrar o ícone apropriado
  let Icon = XCircle;
  let errorType = 'generic';
  
  if (message.includes('fetch') || message.includes('network') || message.includes('Failed to fetch')) {
    Icon = Wifi;
    errorType = 'network';
  } else if (message.includes('timeout') || message.includes('Timeout')) {
    Icon = AlertTriangle;
    errorType = 'timeout';
  } else if (message.includes('URL') || message.includes('servidor')) {
    Icon = Globe;
    errorType = 'server';
  }
  
  // Mensagem de ajuda baseada no tipo de erro
  let helpMessage = 'Se o problema persistir, entre em contato com o suporte.';
  
  if (errorType === 'network') {
    helpMessage = 'Verifique sua conexão com a internet e tente novamente.';
  } else if (errorType === 'timeout') {
    helpMessage = 'O servidor está demorando para responder. Tente novamente em alguns instantes.';
  } else if (errorType === 'server') {
    helpMessage = 'Nosso servidor está com problemas. A equipe técnica já foi notificada.';
  }
  
  // Simplificar a mensagem de erro para o usuário
  let userFriendlyMessage = message;
  if (message === 'Failed to fetch') {
    userFriendlyMessage = 'Não foi possível conectar ao servidor de pagamentos.';
  }

  return (
    <div className="rounded-lg bg-red-100 p-4 border border-red-200 text-center">
      <div className="flex flex-col items-center justify-center">
        <Icon className="h-12 w-12 text-red-500 mb-2" />
        <h2 className="text-xl font-semibold text-red-700 mb-2">{title}</h2>
        <p className="text-red-600 mb-4">{userFriendlyMessage}</p>
        
        {onRetry && (
          <Button 
            onClick={onRetry}
            variant="destructive"
            className="mt-2"
          >
            Tentar novamente
          </Button>
        )}
        
        <p className="text-sm text-gray-600 mt-4">
          {helpMessage}
        </p>
      </div>
    </div>
  );
};

export default ErrorDisplay; 