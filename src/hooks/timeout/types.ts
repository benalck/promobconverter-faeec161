
/**
 * Opções para configuração do timeout.
 */
export interface TimeoutOptions {
  autoStart?: boolean;
  onComplete?: () => void;
}

/**
 * Interface para o retorno do hook useTimeout
 */
export interface UseTimeoutReturn {
  isActive: boolean;
  isPaused: boolean;
  start: () => void;
  pause: () => void;
  resume: () => void;
  restart: () => void;
  clear: () => void;
  updateDelay: (newDelay: number | null) => void;
}
