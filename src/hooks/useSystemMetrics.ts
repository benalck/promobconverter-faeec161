import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';
import { subDays, startOfMonth, endOfMonth, startOfDay, endOfDay } from 'date-fns';

// Interface for manter compatibilidade com os componentes existentes
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

interface SystemMetricsResponse {
  total_users: number;
  active_users: number;
  total_conversions: number;
  success_rate: number;
  average_response_time: number;
}

export function useSystemMetrics() {
  const { user, isAdmin } = useAuth();
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<ConversionsByDate[] | null>(null);
  const [conversionsByType, setConversionsByType] = useState<ConversionsByType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSystemMetrics = useCallback(async (timeFilter: string = 'all'): Promise<SystemMetrics> => {
    setIsLoading(true);
    setError(null);

    try {
      // Verificar se o usuário está autenticado
      const { data: session } = await supabase.auth.getSession();
      if (!session?.session) {
        throw new Error('Usuário não autenticado');
      }
      
      // Verificar se o usuário é admin ou CEO
      if (!isAdmin) {
        throw new Error('Somente administradores podem acessar métricas do sistema');
      }

      let startDate: Date | null = null;
      let endDate: Date | null = null;
      const now = new Date();

      switch (timeFilter) {
        case 'today':
          startDate = startOfDay(now);
          endDate = endOfDay(now);
          break;
        case 'week':
          startDate = subDays(startOfDay(now), 7);
          endDate = endOfDay(now);
          break;
        case 'month':
          startDate = startOfMonth(now);
          endDate = endOfMonth(now);
          break;
        case 'all':
        default:
          startDate = null;
          endDate = null;
          break;
      }

      // Console log para debug
      console.log('Buscando métricas do sistema com filtro:', timeFilter, 'Start:', startDate, 'End:', endDate);

      // Use the secure RPC call
      const result = await supabase.rpc<'get_system_metrics_secure', SystemMetricsResponse>(
        'get_system_metrics_secure',
        { 
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null
        }
      );

      console.log('Resultado da função get_system_metrics_secure:', result);

      if (result.error) {
        console.error('Erro na função RPC:', result.error);
        
        // Verificar mensagens específicas do erro para dar feedback útil
        if (result.error.message.includes("Could not find the function") || 
            result.error.message.includes("function does not exist")) {
          throw new Error('Função de métricas não encontrada no banco de dados. Verifique se as migrações foram aplicadas.');
        }
        
        if (result.error.message.includes("Access denied")) {
          throw new Error('Permissão negada para acessar métricas. Verifique suas permissões.');
        }

        throw new Error(result.error.message);
      }

      const data = result.data;
      console.log('Dados retornados:', data);

      if (!data) {
        throw new Error('Nenhum dado retornado das métricas do sistema');
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

  const fetchConversionsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<ConversionsByDate[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use a type assertion for the RPC call
      const { data, error } = await supabase.rpc<'get_conversions_by_date_range', ConversionsByDate[]>(
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
      // Use a type assertion for the RPC call
      const { data, error } = await supabase.rpc<'get_conversions_by_type', ConversionsByType[]>(
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

  const refetch = useCallback(async (timeFilter?: string) => {
    return fetchSystemMetrics(timeFilter);
  }, [fetchSystemMetrics]);

  // Add effect to fetch metrics automatically
  useEffect(() => {
    // Only attempt to fetch metrics if user is admin
    if (isAdmin) {
      fetchSystemMetrics().catch((error) => {
        console.error('Error loading initial metrics:', error);
      });
    }
  }, [fetchSystemMetrics, isAdmin]);

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