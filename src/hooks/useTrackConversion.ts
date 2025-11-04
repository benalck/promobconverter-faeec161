
import { useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/integrations/supabase/client';

interface TrackConversionParams {
  success: boolean;
  fileSize: number;
  conversionTime: number;
  errorMessage?: string;
  inputFormat: string;
  outputFormat: string;
}

interface TrackConversionResponse {
  id: string;
}

export function useTrackConversion() {
  const { user } = useAuth();

  const trackConversion = useCallback(async ({
    success,
    fileSize,
    conversionTime,
    errorMessage,
    inputFormat,
    outputFormat
  }: TrackConversionParams) => {
    if (!user) return;

    try {
      // Define parameters with proper type for RPC
      const params = {
        p_user_id: user.id,
        p_success: success,
        p_file_size: fileSize,
        p_conversion_time: conversionTime,
        p_error_message: errorMessage || null,
        p_input_format: inputFormat,
        p_output_format: outputFormat
      };

      // Use track_conversion function which is defined in the database with proper type assertion
      const { data, error } = await supabase.rpc<'track_conversion', TrackConversionResponse>(
        'track_conversion', 
        params
      );

      if (error) {
        console.error('Error tracking conversion:', error);
      }

      return data;
    } catch (error) {
      console.error('Error tracking conversion:', error);
    }
  }, [user]);

  return { trackConversion };
}
