
import { useCallback } from 'react';

/**
 * Hook para gerenciar a execução do callback
 */
export function useCallbackExecution(
  savedCallback: React.MutableRefObject<() => void>,
  remainingTime: React.MutableRefObject<number | null>,
  delay: number | null,
  onComplete?: () => void
) {
  return useCallback(() => {
    savedCallback.current();
    if (onComplete) {
      onComplete();
    }
    remainingTime.current = delay; // Reseta para o valor original após completar
  }, [savedCallback, remainingTime, delay, onComplete]);
}
