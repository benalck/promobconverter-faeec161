
import { useCallback } from 'react';

/**
 * Hook para iniciar o timeout
 */
export function useStartTimeout(
  clear: () => void,
  delay: number | null,
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  remainingTime: React.MutableRefObject<number | null>,
  executeCallback: () => void,
  setIsPaused: (isPaused: boolean) => void
) {
  return useCallback(() => {
    clear();
    setIsPaused(false);
    
    if (delay !== null) {
      const timeToUse = remainingTime.current !== null ? remainingTime.current : delay;
      timeoutId.current = setTimeout(executeCallback, timeToUse);
    }
  }, [clear, delay, timeoutId, remainingTime, executeCallback, setIsPaused]);
}
