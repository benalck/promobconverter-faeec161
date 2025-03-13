
import { useEffect, useRef, useCallback, useState } from 'react';

/**
 * Opções para configuração do timeout.
 */
interface TimeoutOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

/**
 * Hook personalizado para gerenciar timeouts com funcionalidades avançadas.
 * @param callback A função a ser executada após o timeout
 * @param delay Tempo em milissegundos para o timeout, null desativa o timeout
 * @param options Opções de configuração do timeout
 */
export function useTimeout(
  callback: () => void, 
  delay: number | null, 
  options: TimeoutOptions = {}
) {
  // Estado para controlar se o timer está ativo ou pausado
  const [isPaused, setIsPaused] = useState(!options.autoStart);
  
  // Referências para callback e ID do timeout
  const savedCallback = useRef<() => void>(callback);
  const timeoutId = useRef<NodeJS.Timeout | null>(null);
  
  // Tempo restante quando pausado
  const remainingTime = useRef<number | null>(delay);
  
  // Timestamp de quando o timeout foi pausado
  const pausedAt = useRef<number | null>(null);
  
  // Atualiza a referência do callback quando ele muda
  useEffect(() => {
    savedCallback.current = callback;
  }, [callback]);
  
  // Função para limpar o timeout atual
  const clear = useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, []);
  
  // Função para iniciar/reiniciar o timeout
  const start = useCallback(() => {
    clear();
    setIsPaused(false);
    
    if (delay !== null) {
      const timeToUse = remainingTime.current !== null ? remainingTime.current : delay;
      timeoutId.current = setTimeout(() => {
        savedCallback.current();
        if (options.onComplete) {
          options.onComplete();
        }
        remainingTime.current = delay; // Reseta para o valor original após completar
      }, timeToUse);
    }
  }, [clear, delay, options.onComplete]);
  
  // Função para pausar o timeout
  const pause = useCallback(() => {
    if (timeoutId.current && !isPaused && delay !== null) {
      clear();
      pausedAt.current = Date.now();
      setIsPaused(true);
    }
  }, [clear, isPaused, delay]);
  
  // Função para retomar o timeout de onde parou
  const resume = useCallback(() => {
    if (isPaused && pausedAt.current && delay !== null) {
      const elapsedTime = Date.now() - pausedAt.current;
      const newRemainingTime = Math.max(0, (remainingTime.current || delay) - elapsedTime);
      remainingTime.current = newRemainingTime;
      pausedAt.current = null;
      start();
    }
  }, [isPaused, delay, start]);
  
  // Função para reiniciar o timeout com o valor original
  const restart = useCallback(() => {
    remainingTime.current = delay;
    start();
  }, [delay, start]);
  
  // Função para atualizar o delay dinamicamente
  const updateDelay = useCallback((newDelay: number | null) => {
    remainingTime.current = newDelay;
    if (!isPaused) {
      clear();
      if (newDelay !== null) {
        timeoutId.current = setTimeout(() => {
          savedCallback.current();
          if (options.onComplete) {
            options.onComplete();
          }
        }, newDelay);
      }
    }
  }, [clear, isPaused, options.onComplete]);
  
  // Configura o timeout inicialmente
  useEffect(() => {
    remainingTime.current = delay;
    
    if (!isPaused && delay !== null) {
      timeoutId.current = setTimeout(() => {
        savedCallback.current();
        if (options.onComplete) {
          options.onComplete();
        }
      }, delay);
    }
    
    return clear;
  }, [delay, isPaused, clear, options.onComplete]);
  
  return {
    isActive: !isPaused && timeoutId.current !== null,
    isPaused,
    start,
    pause,
    resume,
    restart,
    clear,
    updateDelay
  };
}
