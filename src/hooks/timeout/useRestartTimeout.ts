
import { useCallback } from 'react';

/**
 * Hook para reiniciar o timeout
 * @param delay - O tempo de espera em milissegundos
 * @param start - Função para iniciar o timeout
 * @param remainingTime - Referência para o tempo restante
 * @returns Função para reiniciar o timeout
 */
export function useRestartTimeout(
  delay: number | null,
  start: () => void,
  remainingTime: React.MutableRefObject<number | null>
): () => void {
  return useCallback(() => {
    remainingTime.current = delay;
    start();
  }, [delay, start, remainingTime]);
}
