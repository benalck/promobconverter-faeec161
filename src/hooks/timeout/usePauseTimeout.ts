
import { useCallback } from 'react';

/**
 * Hook para pausar o timeout
 */
export function usePauseTimeout(
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  isPaused: boolean,
  delay: number | null,
  clear: () => void,
  pausedAt: React.MutableRefObject<number | null>,
  setIsPaused: (isPaused: boolean) => void
) {
  return useCallback(() => {
    if (timeoutId.current && !isPaused && delay !== null) {
      clear();
      pausedAt.current = Date.now();
      setIsPaused(true);
    }
  }, [timeoutId, isPaused, delay, clear, pausedAt, setIsPaused]);
}
