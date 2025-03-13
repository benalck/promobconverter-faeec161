
import { useCallback } from 'react';

/**
 * Hook para atualizar o delay
 */
export function useUpdateDelay(
  remainingTime: React.MutableRefObject<number | null>,
  isPaused: boolean,
  clear: () => void,
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  savedCallback: React.MutableRefObject<() => void>,
  onComplete?: () => void
) {
  return useCallback((newDelay: number | null) => {
    remainingTime.current = newDelay;
    if (!isPaused) {
      clear();
      if (newDelay !== null) {
        timeoutId.current = setTimeout(() => {
          savedCallback.current();
          if (onComplete) {
            onComplete();
          }
        }, newDelay);
      }
    }
  }, [remainingTime, isPaused, clear, timeoutId, savedCallback, onComplete]);
}
