import { Database } from '@/integrations/supabase/types';
import { SupabaseClient } from '@supabase/supabase-js';
import { SystemMetrics, ConversionsByDate, ConversionsByType } from '@/hooks/useSystemMetrics';
import { UserMetricsCollection } from '@/hooks/useUserMetrics';

// Estendendo a interface do cliente Supabase para adicionar nossas funções RPC
declare module '@supabase/supabase-js' {
  interface SupabaseClient<T extends Database = any> {
    rpc<
      Schema extends keyof Database['public']['Functions'] = keyof Database['public']['Functions'],
      Result = Schema extends keyof Database['public']['Functions']
        ? ReturnType<Database['public']['Functions'][Schema]>
        : unknown
    >(
      fn: Schema,
      params?: Schema extends keyof Database['public']['Functions']
        ? Parameters<Database['public']['Functions'][Schema]>[0]
        : Record<string, any>
    ): Promise<{ data: Result; error: null } | { data: null; error: any }>;
  }
} 