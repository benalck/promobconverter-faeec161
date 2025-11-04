
import { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SystemMetrics, ConversionsByDate, ConversionsByType } from '@/hooks/useSystemMetrics';
import { UserMetricsCollection } from '@/hooks/useUserMetrics';

// Extending the Supabase client interface to add our RPC functions
declare module '@supabase/supabase-js' {
  interface SupabaseClient<T extends Database = any> {
    rpc<
      Schema extends keyof Database['public']['Functions'] | string = string,
      Result = unknown
    >(
      fn: Schema,
      params?: Record<string, any>,
      options?: { count?: null | 'exact' | 'planned' | 'estimated' }
    ): Promise<{ data: Result; error: null } | { data: null; error: any }>;
  }
} 
