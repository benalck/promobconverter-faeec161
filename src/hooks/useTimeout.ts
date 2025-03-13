
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
  const clear = useCleanupTimeout(timeoutId);
  
  // Função para executar o callback e lidar com a conclusão
  const executeCallback = useCallbackExecution(savedCallback, remainingTime, delay, options.onComplete);
  
  // Função para iniciar/reiniciar o timeout
  const start = useStartTimeout(clear, delay, timeoutId, remainingTime, executeCallback, setIsPaused);
  
  // Função para pausar o timeout
  const pause = usePauseTimeout(timeoutId, isPaused, delay, clear, pausedAt, setIsPaused);
  
  // Função para retomar o timeout de onde parou
  const resume = useResumeTimeout(isPaused, pausedAt, delay, remainingTime, start);
  
  // Função para reiniciar o timeout com o valor original
  const restart = useRestartTimeout(delay, start, remainingTime);
  
  // Função para atualizar o delay dinamicamente
  const updateDelay = useUpdateDelay(remainingTime, isPaused, clear, timeoutId, savedCallback, options.onComplete);
  
  // Configura o timeout inicialmente
  useInitialTimeout(delay, isPaused, timeoutId, savedCallback, options.onComplete, clear, remainingTime);
  
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

// Hook para gerenciar a limpeza do timeout
function useCleanupTimeout(
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>
) {
  return useCallback(() => {
    if (timeoutId.current) {
      clearTimeout(timeoutId.current);
      timeoutId.current = null;
    }
  }, [timeoutId]);
}

// Hook para gerenciar a execução do callback
function useCallbackExecution(
  savedCallback: React.MutableRefObject<() => void>,
  remainingTime: React.MutableRefObject<number | null>,
  delay: number | null,
  onComplete?: () => void
) {
  return useCallback(() => {
    savedCallback.current();
    if (onComplete) {
      onComplete();
    }
    remainingTime.current = delay; // Reseta para o valor original após completar
  }, [savedCallback, remainingTime, delay, onComplete]);
}

// Hook para iniciar o timeout
function useStartTimeout(
  clear: () => void,
  delay: number | null,
  timeoutId: React.MutableRefObject<NodeJS.Timeout | null>,
  remainingTime: React.MutableRefObject<number | null>,
  executeCallback: () => void,
  setIsPaused: (isPaused: boolean) => void
) {
  return useCallback(() => {
    clear();
    setIsPaused(false);
    
    if (delay !== null) {
      const timeToUse = remainingTime.current !== null ? remainingTime.current : delay;
      timeoutId.current = setTimeout(executeCallback, timeToUse);
    }
  }, [clear, delay, timeoutId, remainingTime, executeCallback, setIsPaused]);
}

// Hook para pausar o timeout
function usePauseTimeout(
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

// Hook para retomar o timeout
function useResumeTimeout(
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

// Hook para reiniciar o timeout
function useRestartTimeout(
  delay: number | null,
  start: () => void,
  remainingTime: React.MutableRefObject<number | null>
) {
  return useCallback(() => {
    remainingTime.current = delay;
    start();
  }, [delay, start, remainingTime]);
}

// Hook para atualizar o delay
function useUpdateDelay(
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

// Hook para configurar o timeout inicial
function useInitialTimeout(
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
