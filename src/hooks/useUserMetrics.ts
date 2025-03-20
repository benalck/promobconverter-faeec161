
import { useState, useCallback } from 'react';
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

export function useUserMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<UserMetricsCollection>({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserMetrics = useCallback(async (): Promise<UserMetricsCollection> => {
    if (!user) return {};
    
    setIsLoading(true);
    setError(null);

    try {
      // Use proper type assertion for the specific function
      const { data, error } = await supabase.rpc(
        'get_user_metrics'
      ) as { data: UserMetricsCollection | null; error: any };

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from user metrics');
      }

      setMetrics(data);
      return data;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching user metrics:', error);
      setError(error);
      return {};
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    metrics,
    isLoading,
    error,
    fetchUserMetrics
  };
}
