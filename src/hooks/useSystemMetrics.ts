
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

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
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [dailyStats, setDailyStats] = useState<ConversionsByDate[] | null>(null);
  const [conversionsByType, setConversionsByType] = useState<ConversionsByType[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSystemMetrics = useCallback(async (): Promise<SystemMetrics> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use explicit type casting for RPC function
      const { data, error } = await supabase.rpc(
        'get_system_metrics'
      ) as { data: SystemMetrics | null; error: any };

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from system metrics');
      }

      setMetrics(data);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching system metrics:', error);
      setError(error);
      throw error;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConversionsByDateRange = useCallback(async (startDate: string, endDate: string): Promise<ConversionsByDate[]> => {
    setIsLoading(true);
    setError(null);

    try {
      // Use explicit type casting for RPC function
      const { data, error } = await supabase.rpc(
        'get_conversions_by_date_range',
        { p_start_date: startDate, p_end_date: endDate }
      ) as { data: ConversionsByDate[] | null; error: any };

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
      // Use explicit type casting for RPC function
      const { data, error } = await supabase.rpc(
        'get_conversions_by_type'
      ) as { data: ConversionsByType[] | null; error: any };

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
    refetch: refetch
  };
}
