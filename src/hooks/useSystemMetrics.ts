
import { useState, useCallback } from 'react';
import { supabase } from '@/integrations/supabase/client';

export interface SystemMetrics {
  totalConversions: number;
  successRate: number;
  totalUsers: number;
  activeUsers: number;
  averageConversionTime: number;
  conversionsByDate: {
    date: string;
    count: number;
  }[];
  conversionsByType: {
    type: string;
    count: number;
  }[];
}

export function useSystemMetrics() {
  const [metrics, setMetrics] = useState<SystemMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchSystemMetrics = useCallback(async (): Promise<SystemMetrics | null> => {
    setIsLoading(true);
    setError(null);

    try {
      // Type assert the RPC call result
      const { data, error } = await supabase.rpc('get_system_metrics') as unknown as { data: any, error: any };

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from system metrics');
      }

      // Map data to our expected format
      const systemMetrics: SystemMetrics = {
        totalConversions: data.total_conversions || 0,
        successRate: data.success_rate || 0,
        totalUsers: data.total_users || 0,
        activeUsers: data.active_users || 0,
        averageConversionTime: data.average_conversion_time || 0,
        conversionsByDate: data.conversions_by_date || [],
        conversionsByType: data.conversions_by_type || [],
      };

      setMetrics(systemMetrics);
      return systemMetrics;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching system metrics:', error);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchConversionsByDateRange = useCallback(async (
    startDate: string,
    endDate: string
  ): Promise<{ date: string; count: number }[] | null> => {
    try {
      // Type assert the RPC call result
      const { data, error } = await supabase.rpc(
        'get_conversions_by_date_range',
        { p_start_date: startDate, p_end_date: endDate }
      ) as unknown as { data: any, error: any };

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching conversions by date range:', error);
      return null;
    }
  }, []);

  const fetchConversionsByType = useCallback(async (): Promise<{ type: string; count: number }[] | null> => {
    try {
      // Type assert the RPC call result
      const { data, error } = await supabase.rpc('get_conversions_by_type') as unknown as { data: any, error: any };

      if (error) {
        throw new Error(error.message);
      }

      return data || [];
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching conversions by type:', error);
      return null;
    }
  }, []);

  return {
    metrics,
    isLoading,
    error,
    fetchSystemMetrics,
    fetchConversionsByDateRange,
    fetchConversionsByType,
  };
}
