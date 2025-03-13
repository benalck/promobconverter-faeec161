
import { useCallback } from 'react';

/**
 * Hook para reiniciar o timeout
 */
export function useRestartTimeout(
  delay: number | null,
  start: () => void,
  remainingTime: React.MutableRefObject<number | null>
) {
  return useCallback(() => {
    remainingTime.current = delay;
    start();
  }, [delay, start, remainingTime]);
}
