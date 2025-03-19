
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';

interface SystemMetrics {
  totalUsers: number;
  activeUsers: number;
  totalConversions: number;
  successRate: number;
  averageResponseTime: number;
}

interface DailyStats {
  date: string;
  totalConversions: number;
  successRate: number;
  averageTime: number;
}

interface UseSystemMetricsReturn {
  metrics: SystemMetrics;
  dailyStats: DailyStats[];
  isLoading: boolean;
  error: Error | null;
  refetch: () => Promise<void>;
}

export function useSystemMetrics(timeFilter: string): UseSystemMetricsReturn {
  const [metrics, setMetrics] = useState<SystemMetrics>({
    totalUsers: 0,
    activeUsers: 0,
    totalConversions: 0,
    successRate: 0,
    averageResponseTime: 0
  });
  const [dailyStats, setDailyStats] = useState<DailyStats[]>([]);
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
      
      // Define parameters with proper typing for RPC
      const params = {
        p_start_date: startDate?.toISOString() || null,
        p_end_date: endDate?.toISOString() || null
      };

      // Fetch system metrics with explicit type for data
      const { data: metricsData, error: metricsError } = await supabase.rpc(
        'get_system_metrics',
        params
      ) as { data: any, error: any };

      if (metricsError) throw metricsError;

      // Fetch daily statistics with explicit type for data
      const { data: statsData, error: statsError } = await supabase.rpc(
        'get_daily_conversion_stats',
        params
      ) as { data: any, error: any };

      if (statsError) throw statsError;

      // Safely handle metricsData
      if (metricsData && Array.isArray(metricsData) && metricsData.length > 0) {
        setMetrics(metricsData[0] as SystemMetrics);
      }
      
      // Safely handle statsData
      if (statsData && Array.isArray(statsData)) {
        setDailyStats(statsData as DailyStats[]);
      } else {
        setDailyStats([]);
      }
    } catch (err) {
      setError(err instanceof Error ? err : new Error('Error fetching metrics'));
      console.error('Error fetching metrics:', err);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchMetrics();
  }, [timeFilter]);

  return {
    metrics,
    dailyStats,
    isLoading,
    error,
    refetch: fetchMetrics
  };
}
