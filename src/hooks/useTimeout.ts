
import { useEffect, useRef } from 'react';

/**
 * Hook personalizado para gerenciar timeouts
 * @param callback A função a ser executada após o timeout
 * @param delay Tempo em milissegundos para o timeout, null desativa o timeout
 */
export function useTimeout(callback: () => void, delay: number | null) {
  const savedCallback = useRef<() => void>(callback);
  
  // Atualiza a referência do callback quando ele muda
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Configura o timeout
  useEffect(() => {
    // Não configura o timeout se o delay for null
    if (delay === null) return;
    
    const id = setTimeout(() => savedCallback.current(), delay);
    
    // Limpa o timeout ao desmontar ou quando delay mudar
    return () => clearTimeout(id);
  }, [delay]);
}
