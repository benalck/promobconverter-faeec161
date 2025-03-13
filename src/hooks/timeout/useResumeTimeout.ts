
import { useCallback } from 'react';

/**
 * Hook para retomar o timeout
 */
export function useResumeTimeout(
  isPaused: boolean,
  pausedAt: React.MutableRefObject<number | null>,
  delay: number | null,
  remainingTime: React.MutableRefObject<number | null>,
  start: () => void
) {
  return useCallback(() => {
    if (isPaused && pausedAt.current && delay !== null) {
      const elapsedTime = Date.now() - pausedAt.current;
      const newRemainingTime = Math.max(0, (remainingTime.current || delay) - elapsedTime);
      remainingTime.current = newRemainingTime;
      pausedAt.current = null;
      start();
    }
  }, [isPaused, pausedAt, delay, remainingTime, start]);
}
