
import { useCallback } from 'react';

/**
 * Hook para gerenciar a limpeza do timeout
 */
export function useCleanupTimeout(
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>
) {
  return useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, [timeoutId]);
}
