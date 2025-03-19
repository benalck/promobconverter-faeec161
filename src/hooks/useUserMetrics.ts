
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface UserMetrics {
  totalConversions: number;
  successfulConversions: number;
  failedConversions: number;
  averageConversionTime: number;
  lastConversion: string;
}

interface UseUserMetricsReturn {
  metrics: Record<string, UserMetrics>;
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useUserMetrics(userIds: string[], timeFilter: string): UseUserMetricsReturn {
  const [metrics, setMetrics] = useState<Record<string, UserMetrics>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<Error | null>(null);

  const getDateRange = () => {
    const now = new Date();
    const startDate = new Date();

    switch (timeFilter) {
      case 'today':
        startDate.setHours(0, 0, 0, 0);
        break;
      case 'week':
        startDate.setDate(now.getDate() - 7);
        break;
      case 'month':
        startDate.setMonth(now.getMonth() - 1);
        break;
      default:
        return { startDate: null, endDate: null };
    }

    return { startDate, endDate: now };
  };

  const fetchMetrics = async () => {
    try {
      setIsLoading(true);
      setError(null);

      const { startDate, endDate } = getDateRange();
      const metricsData: Record<string, UserMetrics> = {};

      // Fetch metrics for each user
      await Promise.all(
        userIds.map(async (userId) => {
          const { data, error } = await supabase.rpc('get_user_metrics', {
            p_user_id: userId,
            p_start_date: startDate?.toISOString() || null,
            p_end_date: endDate?.toISOString() || null
          });

          if (error) throw error;

          if (data && data.length > 0) {
            metricsData[userId] = {
              totalConversions: data[0].total_conversions || 0,
              successfulConversions: data[0].successful_conversions || 0,
              failedConversions: data[0].failed_conversions || 0,
              averageConversionTime: data[0].average_conversion_time || 0,
              lastConversion: data[0].last_conversion || '-'
            };
          } else {
            // Default metrics if no data found
            metricsData[userId] = {
              totalConversions: 0,
              successfulConversions: 0,
              failedConversions: 0,
              averageConversionTime: 0,
              lastConversion: '-'
            };
          }
        })
      );

      setMetrics(metricsData);
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Erro ao buscar métricas dos usuários'));
      console.error('Erro ao buscar métricas dos usuários:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userIds.length > 0) {
      fetchMetrics();
    }
  }, [userIds.join(','), timeFilter]);

  return {
    metrics,
    isLoading,
    error,
    refetch: fetchMetrics
  };
}
