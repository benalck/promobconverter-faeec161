
import { useEffect } from 'react';

/**
 * Hook para configurar o timeout inicial
 */
export function useInitialTimeout(
  delay: number | null,
  isPaused: boolean,
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  savedCallback: React.MutableRefObject<() => void>,
  onComplete: (() => void) | undefined,
  clear: () => void,
  remainingTime: React.MutableRefObject<number | null>
) {
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
