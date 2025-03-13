
import { useState, useEffect, useCallback } from 'react';
import { useTimeout } from './useTimeout';
import { User } from '@/contexts/auth/types';

/**
 * Hook personalizado para gerenciar as mensagens de créditos do usuário
 */
export function useUserCreditsMessages(user: User | null) {
  const [showNewCreditsMessage, setShowNewCreditsMessage] = useState(false);
  const [showLowCreditsWarning, setShowLowCreditsWarning] = useState(false);
  
  // Usando o hook customizado useTimeout para os timers
  const newCreditsTimeout = useTimeout(
    useCallback(() => setShowNewCreditsMessage(false), []),
    showNewCreditsMessage ? 5000 : null
  );
  
  const lowCreditsTimeout = useTimeout(
    useCallback(() => setShowLowCreditsWarning(false), []),
    showLowCreditsWarning ? 8000 : null
  );
  
  // Verificar situação dos créditos
  useEffect(() => {
    if (!user) return;
    
    // Usuário com créditos iniciais (3)
    if (user.credits === 3) {
      setShowNewCreditsMessage(true);
    }
    
    // Usuário com poucos créditos (1-2)
    if (user.credits > 0 && user.credits < 3) {
      setShowLowCreditsWarning(true);
    }
  }, [user?.credits]);
  
  return {
    showNewCreditsMessage,
    showLowCreditsWarning,
    hasNoCredits: user?.credits === 0
  };
}
