
import { useRef, useEffect, useCallback } from 'react';

/**
 * Interface para o retorno do hook useMultipleTimeouts
 */
export interface UseMultipleTimeoutsReturn {
  setTimeout: (id: string, callback: () => void, delay: number) => string;
  clearTimeout: (id: string) => boolean;
  clearAll: () => void;
  isActive: (id: string) => boolean;
  getActiveTimeouts: () => string[];
  count: number;
}

/**
 * Hook para gerenciar múltiplos timeouts simultaneamente
 * @returns {UseMultipleTimeoutsReturn} Objeto com métodos para gerenciar timeouts
 */
export function useMultipleTimeouts(): UseMultipleTimeoutsReturn {
  // Usando Map com string como chave e NodeJS.Timeout como valor
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Configura um novo timeout com um ID único
  const setTimeout = useCallback((id: string, callback: () => void, delay: number): string => {
    // Limpa qualquer timeout existente com o mesmo ID
    if (timeouts.current.has(id)) {
      clearTimeout(timeouts.current.get(id)!);
    }
    
    // Configura o novo timeout
    const timeoutId = global.setTimeout(() => {
      callback();
      timeouts.current.delete(id);
    }, delay);
    
    // Armazena o ID do timeout
    // O retorno de setTimeout é um number no browser e um Timeout objeto no Node
    // Precisamos garantir que seja tratado corretamente como NodeJS.Timeout
    timeouts.current.set(id, timeoutId as unknown as NodeJS.Timeout);
    
    return id;
  }, []);
  
  // Limpa um timeout específico por ID
  const clearTimeout = useCallback((id: string): boolean => {
    if (timeouts.current.has(id)) {
      global.clearTimeout(timeouts.current.get(id)!);
      timeouts.current.delete(id);
      return true;
    }
    return false;
  }, []);
  
  // Limpa todos os timeouts ativos
  const clearAll = useCallback((): void => {
    timeouts.current.forEach((timeoutId) => {
      global.clearTimeout(timeoutId);
    });
    timeouts.current.clear();
  }, []);
  
  // Verifica se um timeout com determinado ID está ativo
  const isActive = useCallback((id: string): boolean => {
    return timeouts.current.has(id);
  }, []);
  
  // Obtém uma lista de todos os IDs de timeout ativos
  const getActiveTimeouts = useCallback((): string[] => {
    return Array.from(timeouts.current.keys());
  }, []);
  
  // Limpa todos os timeouts ao desmontar o componente
  useEffect(() => {
    return () => {
      clearAll();
    };
  }, [clearAll]);
  
  return {
    setTimeout,
    clearTimeout,
    clearAll,
    isActive,
    getActiveTimeouts,
    count: timeouts.current.size
  };
}
