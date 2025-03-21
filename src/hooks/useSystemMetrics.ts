import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

// Interface para manter compatibilidade com os componentes existentes
export interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  successRate: number;
  averageConversionTime: number;
}

export interface ConversionsByDate {
  date: string;
  total: number;
  successful: number;
  failed: number;
}

export interface ConversionsByType {
  input_format: string;
  output_format: string;
  count: number;
  success_rate: number;
}

export function useSystemMetrics() {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<ConversionsByDate[] | null>(null);
  const [conversionsByType, setConversionsByType] = useState<ConversionsByType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSystemMetrics = useCallback(async (): Promise<SystemMetrics> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se o usuário está autenticado
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se o usuário é admin
      if (!isAdmin) {
        throw new Error('Somente administradores podem acessar métricas do sistema');
      }

      // Console log para debug
      console.log('Buscando métricas do sistema...');

      // Corrigindo para passar parâmetros para a função get_system_metrics
      const result = await supabase.rpc(
        'get_system_metrics',
        { 
          p_start_date: null,
          p_end_date: null
        }
      );

      console.log('Resultado da função get_system_metrics:', result);

      if (result.error) {
        console.error('Erro na função RPC:', result.error);
        
        // Verificar mensagens específicas do erro para dar feedback útil
        if (result.error.message.includes("Could not find the function") || 
            result.error.message.includes("function does not exist")) {
          throw new Error('Função de métricas não encontrada no banco de dados. Verifique se as migrações foram aplicadas.');
        }
        
        if (result.error.message.includes("permission denied")) {
          throw new Error('Permissão negada para acessar métricas. Verifique suas permissões.');
        }

        throw new Error(result.error.message);
      }

      const data = result.data;
      console.log('Dados retornados:', data);

      if (!data) {
        throw new Error('Nenhum dado retornado das métricas do sistema');
      }

      // Verificar se as propriedades esperadas existem
      if (typeof data.total_users === 'undefined' || 
          typeof data.active_users === 'undefined' || 
          typeof data.total_conversions === 'undefined') {
        console.error('Dados retornados em formato inesperado:', data);
        throw new Error('Formato de dados inesperado nas métricas do sistema');
      }

      // Mapear os dados da resposta SQL para nosso formato da interface
      const mappedData: SystemMetrics = {
        totalUsers: data.total_users || 0,
        activeUsers: data.active_users || 0,
        totalConversions: data.total_conversions || 0,
        successfulConversions: 0, // Calcular abaixo
        failedConversions: 0, // Calcular abaixo
        successRate: data.success_rate || 0,
        averageConversionTime: data.average_response_time || 0
      };

      // Calcular valores derivados
      mappedData.successfulConversions = Math.round(mappedData.totalConversions * (mappedData.successRate / 100));
      mappedData.failedConversions = mappedData.totalConversions - mappedData.successfulConversions;

      console.log('Métricas mapeadas:', mappedData);
      setMetrics(mappedData);
      return mappedData;
    } catch (err) {
      const error = err as Error;
      console.error('Erro ao buscar métricas do sistema:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, [isAdmin]);

  // Adicionar efeito para buscar métricas automaticamente
  useEffect(() => {
    // Só tenta buscar métricas se o usuário for admin
    if (isAdmin) {
      fetchSystemMetrics().catch((error) => {
        console.error('Erro ao carregar métricas iniciais:', error);
      });
    }
  }, [fetchSystemMetrics, isAdmin]);

  const fetchConversionsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<ConversionsByDate[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Agora com os tipos definidos corretamente
      const { data, error } = await supabase.rpc(
        'get_conversions_by_date_range',
        { p_start_date: startDate, p_end_date: endDate }
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from conversions by date');
      }

      setDailyStats(data);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching conversions by date:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConversionsByType = useCallback(async (): Promise<ConversionsByType[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Agora com os tipos definidos corretamente
      const { data, error } = await supabase.rpc(
        'get_conversions_by_type'
      );

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from conversions by type');
      }

      setConversionsByType(data);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching conversions by type:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const refetch = useCallback(async () => {
    return fetchSystemMetrics();
  }, [fetchSystemMetrics]);

  return {
    metrics,
    dailyStats,
    conversionsByType,
    isLoading,
    error,
    fetchSystemMetrics,
    fetchConversionsByDateRange,
    fetchConversionsByType,
    refetch
  };
}
