
import { useRef, useEffect, useCallback } from 'react';

/**
 * Hook para gerenciar múltiplos timeouts simultaneamente
 */
export function useMultipleTimeouts() {
  // Usando Map com string como chave e NodeJS.Timeout como valor
  const timeouts = useRef<Map<string, NodeJS.Timeout>>(new Map());
  
  // Configura um novo timeout com um ID único
  const setTimeout = useCallback((id: string, callback: () => void, delay: number) => {
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
  const clearTimeout = useCallback((id: string) => {
    if (timeouts.current.has(id)) {
      global.clearTimeout(timeouts.current.get(id)!);
      timeouts.current.delete(id);
      return true;
    }
    return false;
  }, []);
  
  // Limpa todos os timeouts ativos
  const clearAll = useCallback(() => {
    timeouts.current.forEach((timeoutId) => {
      global.clearTimeout(timeoutId);
    });
    timeouts.current.clear();
  }, []);
  
  // Verifica se um timeout com determinado ID está ativo
  const isActive = useCallback((id: string) => {
    return timeouts.current.has(id);
  }, []);
  
  // Obtém uma lista de todos os IDs de timeout ativos
  const getActiveTimeouts = useCallback(() => {
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
