
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

export function useUserMetrics() {
  const { user } = useAuth();
  const [metrics, setMetrics] = useState<UserMetrics | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const fetchUserMetrics = useCallback(async (): Promise<UserMetrics | null> => {
    if (!user) return null;
    
    setIsLoading(true);
    setError(null);

    try {
      // Type assert the RPC call result
      const { data, error } = await supabase.rpc(
        'get_user_metrics', 
        { p_user_id: user.id }
      ) as unknown as { data: any, error: any };

      if (error) {
        throw new Error(error.message);
      }

      if (!data) {
        throw new Error('No data returned from user metrics');
      }

      // Map data to our expected format
      const userMetrics: UserMetrics = {
        totalConversions: data.total_conversions || 0,
        successRate: data.success_rate || 0,
        averageConversionTime: data.average_conversion_time || 0,
        creditsUsed: data.credits_used || 0,
        creditsRemaining: user.credits || 0,
        conversionsByDate: data.conversions_by_date || [],
      };

      setMetrics(userMetrics);
      return userMetrics;
    } catch (err) {
      const error = err as Error;
      console.error('Error fetching user metrics:', error);
      setError(error);
      return null;
    } finally {
      setIsLoading(false);
    }
  }, [user]);

  return {
    metrics,
    isLoading,
    error,
    fetchUserMetrics,
  };
}
