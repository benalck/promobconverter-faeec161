import { useState, useCallback, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/contexts/AuthContext';

export interface UserMetrics {
  totalConversions: number;
  successRate: number;
  averageConversionTime: number;
  creditsUsed: number;
  creditsRemaining: number;
  conversionsByDate: {
    date: string;
    count: number;
  }[];
}

export interface UserMetricsCollection {
  [userId: string]: {
    totalConversions: number;
    successfulConversions: number;
    failedConversions: number;
    averageConversionTime: number;
    lastConversion: string;
  };
}

interface UserMetricResponse {
  user_id: string;
  total_conversions: number;
  success_rate: number;
  average_response_time: number;
  total_file_size: number;
}

export function useUserMetrics() {
  const { user, users, isAdmin } = useAuth(); // Added isAdmin
  const [metrics, setMetrics] = useState<UserMetricsCollection>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Função para buscar métricas de um único usuário
  const fetchUserMetric = useCallback(async (userId: string) => {
    try {
      console.log(`Buscando métricas para o usuário ${userId}...`);
      
      // Use type assertion for the RPC call
      const result = await supabase.rpc<'get_user_metrics_secure', UserMetricResponse[]>(
        'get_user_metrics_secure',
        {
          target_user_id: userId,
          p_start_date: null,
          p_end_date: null
        }
      );

      console.log(`Resultado para usuário ${userId}:`, result);

      if (result.error) {
        console.error(`Erro na função RPC para usuário ${userId}:`, result.error);
        throw new Error(result.error.message);
      }

      const data = result.data?.[0]; // get_user_metrics_secure returns a table, so take the first row
      if (!data) {
        console.warn(`Sem dados para o usuário ${userId}`);
        return null;
      }

      // Verificar se as propriedades esperadas existem
      if (typeof data.total_conversions === 'undefined') {
        console.error('Dados retornados em formato inesperado:', data);
        return null;
      }

      // Calculate successful conversions using the success rate
      const successfulConversions = Math.round(data.total_conversions * (data.success_rate || 0) / 100);
      
      // Calculate failed conversions
      const failedConversions = data.total_conversions - successfulConversions;

      const userMetrics = {
        totalConversions: data.total_conversions,
        successfulConversions: successfulConversions,
        failedConversions: failedConversions,
        averageConversionTime: data.average_response_time || 0,
        lastConversion: '-' // This RPC doesn't return last_conversion, so we'll keep it as '-'
      };

      console.log(`Métricas mapeadas para usuário ${userId}:`, userMetrics);
      return userMetrics;
    } catch (err) {
      console.error(`Erro buscando métricas para ${userId}:`, err);
      return null;
    }
  }, []);

  const fetchUserMetrics = useCallback(async (): Promise<UserMetricsCollection> => {
    // Only fetch if current user is admin/CEO
    if (!isAdmin || !user || !users || users.length === 0) return {};
    
    // Only show loading on first call
    if (Object.keys(metrics).length === 0) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Fetch all user metrics in parallel for better performance
      const results = await Promise.all(
        users.map(async (u) => {
          const userData = await fetchUserMetric(u.id);
          return { userId: u.id, data: userData };
        })
      );
      
      // Build metrics collection
      const metricsCollection: UserMetricsCollection = {};
      
      results.forEach(result => {
        metricsCollection[result.userId] = result.data || {
          totalConversions: 0,
          successfulConversions: 0,
          failedConversions: 0,
          averageConversionTime: 0,
          lastConversion: '-'
        };
      });

      setMetrics(metricsCollection);
      return metricsCollection;
    } catch (err) {
      const error = err as Error;
      console.error('Erro buscando métricas dos usuários:', error);
      setError(error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [user, users, fetchUserMetric, isAdmin, metrics]);

  // Efeito para buscar métricas automaticamente quando o componente montar
  useEffect(() => {
    if (isAdmin && users && users.length > 0) { // Only fetch if current user is admin/CEO
      fetchUserMetrics().catch(error => {
        console.error('Erro ao carregar métricas de usuários:', error);
      });
    }
  }, [users, fetchUserMetrics, isAdmin]);

  return {
    metrics,
    isLoading,
    error,
    fetchUserMetrics
  };
}