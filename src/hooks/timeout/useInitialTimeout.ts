
import { useEffect } from 'react';

/**
 * Hook para configurar o timeout inicial
 * @param delay - O tempo de espera em milissegundos
 * @param isPaused - Estado de pausa do timeout
 * @param timeoutId - Referência para o ID do timeout
 * @param savedCallback - Referência para o callback a ser executado
 * @param onComplete - Callback opcional a ser executado após a conclusão
 * @param clear - Função para limpar o timeout
 * @param remainingTime - Referência para o tempo restante
 */
export function useInitialTimeout(
  delay: number | null,
  isPaused: boolean,
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  savedCallback: React.MutableRefObject<() => void>,
  onComplete: (() => void) | undefined,
  clear: () => void,
  remainingTime: React.MutableRefObject<number | null>
): void {
  useEffect(() => {
    remainingTime.current = delay;
    
    if (!isPaused && delay !== null) {
      timeoutId.current = setTimeout(() => {
        savedCallback.current();
        if (onComplete) {
          onComplete();
        }
      }, delay);
    }
    
    return clear;
  }, [delay, isPaused, timeoutId, savedCallback, onComplete, clear, remainingTime]);
}
