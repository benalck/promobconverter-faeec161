
import { useRef, useEffect } from 'react';

/**
 * Custom hook to manage multiple timeouts with cleanup
 * @returns Object with functions to set and clear timeouts
 */
export function useMultipleTimeouts() {
  // Use a Map to store timeout IDs with their identifiers
  const timeoutsRef = useRef<Map<string, NodeJS.Timeout>>(new Map());

  // Clear a specific timeout by ID
  const clearTimeoutById = (id: string) => {
    const timeout = timeoutsRef.current.get(id);
    if (timeout) {
      clearTimeout(timeout);
      timeoutsRef.current.delete(id);
    }
  };

  // Set a new timeout with a specific ID
  const setTimeoutById = (id: string, callback: () => void, delay: number) => {
    // Clear any existing timeout with the same ID
    clearTimeoutById(id);
    
    // Create a new timeout and store it in the map
    // We need to use a type assertion here because setTimeout returns number in browsers
    // but TypeScript expects NodeJS.Timeout for the ref
    const timeoutId = setTimeout(callback, delay) as unknown as NodeJS.Timeout;
    timeoutsRef.current.set(id, timeoutId);
    
    return () => clearTimeoutById(id);
  };

  // Clean up all timeouts when component unmounts
  useEffect(() => {
    return () => {
      timeoutsRef.current.forEach((timeout) => {
        clearTimeout(timeout);
      });
      timeoutsRef.current.clear();
    };
  }, []);

  return { setTimeoutById, clearTimeoutById };
}
