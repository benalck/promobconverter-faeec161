
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
  total_conversions: number;
  successful_conversions?: number;
  failed_conversions?: number;
  average_conversion_time?: number;
  last_conversion?: string;
  success_rate: number;
  average_response_time: number;
}

export function useUserMetrics() {
  const { user, users } = useAuth();
  const [metrics, setMetrics] = useState<UserMetricsCollection>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  // Função para buscar métricas de um único usuário
  const fetchUserMetric = useCallback(async (userId: string) => {
    try {
      console.log(`Buscando métricas para o usuário ${userId}...`);
      
      // Use type assertion for the RPC call
      const result = await supabase.rpc<'get_user_metrics', UserMetricResponse>(
        'get_user_metrics',
        {
          p_user_id: userId,
          p_start_date: null,
          p_end_date: null
        }
      );

      console.log(`Resultado para usuário ${userId}:`, result);

      if (result.error) {
        console.error(`Erro na função RPC para usuário ${userId}:`, result.error);
        throw new Error(result.error.message);
      }

      const data = result.data;
      if (!data) {
        console.warn(`Sem dados para o usuário ${userId}`);
        return null;
      }

      // Verificar se as propriedades esperadas existem
      if (typeof data.total_conversions === 'undefined') {
        console.error('Dados retornados em formato inesperado:', data);
        return null;
      }

      // Calcular conversões bem-sucedidas usando a taxa de sucesso
      const successfulConversions = data.successful_conversions !== undefined 
        ? data.successful_conversions 
        : Math.round(data.total_conversions * (data.success_rate || 0) / 100);
      
      // Calcular conversões com falha
      const failedConversions = data.failed_conversions !== undefined
        ? data.failed_conversions
        : (data.total_conversions - successfulConversions);

      // Usar o tempo médio de resposta se disponível
      const averageTime = data.average_conversion_time !== undefined
        ? data.average_conversion_time
        : (data.average_response_time || 0);

      const userMetrics = {
        totalConversions: data.total_conversions,
        successfulConversions: successfulConversions,
        failedConversions: failedConversions,
        averageConversionTime: averageTime,
        lastConversion: data.last_conversion || '-'
      };

      console.log(`Métricas mapeadas para usuário ${userId}:`, userMetrics);
      return userMetrics;
    } catch (err) {
      console.error(`Erro buscando métricas para ${userId}:`, err);
      return null;
    }
  }, []);

  const fetchUserMetrics = useCallback(async (): Promise<UserMetricsCollection> => {
    if (!user || !users || users.length === 0) return {};
    
    setIsLoading(true);
    setError(null);

    try {
      // Buscar métricas para todos os usuários
      const userMetricsPromises = users.map(async (u) => {
        const userData = await fetchUserMetric(u.id);
        return { userId: u.id, data: userData };
      });

      const results = await Promise.all(userMetricsPromises);
      
      // Montar o objeto de métricas
      const metricsCollection: UserMetricsCollection = {};
      
      results.forEach(result => {
        if (result.data) {
          metricsCollection[result.userId] = result.data;
        } else {
          // Adicionar valores vazios para evitar erros de renderização
          metricsCollection[result.userId] = {
            totalConversions: 0,
            successfulConversions: 0,
            failedConversions: 0,
            averageConversionTime: 0,
            lastConversion: '-'
          };
        }
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
  }, [user, users, fetchUserMetric]);

  // Efeito para buscar métricas automaticamente quando o componente montar
  useEffect(() => {
    if (users && users.length > 0) {
      fetchUserMetrics().catch(error => {
        console.error('Erro ao carregar métricas de usuários:', error);
      });
    }
  }, [users, fetchUserMetrics]);

  return {
    metrics,
    isLoading,
    error,
    fetchUserMetrics
  };
}
