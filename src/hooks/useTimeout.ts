
import { useEffect, useRef, useState } from 'react';
import { 
  useCleanupTimeout,
  useCallbackExecution,
  useStartTimeout,
  usePauseTimeout,
  useResumeTimeout,
  useRestartTimeout,
  useUpdateDelay,
  useInitialTimeout,
  TimeoutOptions,
  UseTimeoutReturn
} from './timeout';

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
): UseTimeoutReturn {
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
