import React, { useState, useEffect, useCallback, useMemo } from "react"

// Breakpoint padrão para mobile - pode ser facilmente ajustado
const MOBILE_BREAKPOINT = 768;

/**
 * Hook otimizado para detectar dispositivos móveis com debounce para evitar múltiplas atualizações
 * 
 * @returns boolean - true se o dispositivo for mobile
 */
export function useIsMobile() {
  const [isMobile, setIsMobile] = useState<boolean | undefined>(undefined);
  const [windowWidth, setWindowWidth] = useState<number | undefined>(undefined);

  // Utiliza useCallback para não recriar a função em cada renderização
  const updateDimension = useCallback(() => {
    if (typeof window !== 'undefined') {
      const width = window.innerWidth;
      setWindowWidth(width);
      setIsMobile(width < MOBILE_BREAKPOINT);
    }
  }, []);

  // Função com debounce para evitar múltiplas chamadas durante o redimensionamento
  const debouncedUpdateDimension = useCallback(() => {
    let timeoutId: NodeJS.Timeout;
    return () => {
      clearTimeout(timeoutId);
      timeoutId = setTimeout(updateDimension, 150);
    }
  }, [updateDimension]);

  // Cria o handler de resize com debounce apenas uma vez
  const debouncedHandler = useMemo(() => debouncedUpdateDimension(), [debouncedUpdateDimension]);

  useEffect(() => {
    // Verificar se estamos no browser
    if (typeof window === 'undefined') return;

    // Inicialização com o valor atual
    updateDimension();

    // Adicionar listener para resize com debounce
    window.addEventListener('resize', debouncedHandler);
    
    // Cleanup
    return () => {
      window.removeEventListener('resize', debouncedHandler);
    };
  }, [updateDimension, debouncedHandler]);

  // Retornar valor com fallback para dispositivos desktop quando undefined
  return isMobile !== undefined ? isMobile : false;
}
