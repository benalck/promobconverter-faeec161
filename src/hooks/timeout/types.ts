
/**
 * Opções para configuração do timeout.
 */
export interface TimeoutOptions {
  /** Inicia o timeout automaticamente */
  autoStart?: boolean;
  /** Callback a ser executado quando o timeout completa */
  onComplete?: () => void;
}

/**
 * Interface para o retorno do hook useTimeout
 */
export interface UseTimeoutReturn {
  /** Indica se o timeout está ativo */
  isActive: boolean;
  /** Indica se o timeout está pausado */
  isPaused: boolean;
  /** Inicia o timeout */
  start: () => void;
  /** Pausa o timeout */
  pause: () => void;
  /** Retoma o timeout do ponto onde foi pausado */
  resume: () => void;
  /** Reinicia o timeout */
  restart: () => void;
  /** Limpa o timeout */
  clear: () => void;
  /** Atualiza o tempo de espera */
  updateDelay: (newDelay: number | null) => void;
}
