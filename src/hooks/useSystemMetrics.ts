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
    // Only set loading on first call
    if (!metrics) {
      setIsLoading(true);
    }
    setError(null);

    try {
      // Check auth - optimized to avoid unnecessary calls
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

      // Use the secure RPC call with optimized params
      const result = await supabase.rpc<'get_system_metrics_secure', SystemMetricsResponse>(
        'get_system_metrics_secure',
        { 
          p_start_date: startDate?.toISOString() || null,
          p_end_date: endDate?.toISOString() || null
        }
      );

      if (result.error) {
        throw new Error(result.error.message);
      }

      const data = result.data;

      if (!data || !Array.isArray(data) || data.length === 0) {
        throw new Error('Nenhum dado retornado das métricas do sistema');
      }

      const metricsData = data[0];

      // Map to interface format
      const mappedData: SystemMetrics = {
        totalUsers: metricsData.total_users || 0,
        activeUsers: metricsData.active_users || 0,
        totalConversions: metricsData.total_conversions || 0,
        successfulConversions: Math.round((metricsData.total_conversions || 0) * ((metricsData.success_rate || 0) / 100)),
        failedConversions: 0,
        successRate: metricsData.success_rate || 0,
        averageConversionTime: metricsData.average_response_time || 0
      };

      mappedData.failedConversions = mappedData.totalConversions - mappedData.successfulConversions;

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
  }, [isAdmin, metrics]);

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

  // Removed automatic fetch - let parent component control when to fetch
  
  // Refetch function for manual refresh
  const refetch = useCallback(async (timeFilter?: string) => {
    return fetchSystemMetrics(timeFilter);
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