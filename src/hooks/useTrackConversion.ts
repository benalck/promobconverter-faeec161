
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
      const { data, error } = await supabase.rpc('track_conversion', {
        p_user_id: user.id,
        p_success: success,
        p_file_size: fileSize,
        p_conversion_time: conversionTime,
        p_error_message: errorMessage,
        p_input_format: inputFormat,
        p_output_format: outputFormat
      });

      if (error) {
        console.error('Erro ao rastrear conversão:', error);
      }

      return data;
    } catch (error) {
      console.error('Erro ao rastrear conversão:', error);
    }
  }, [user]);

  return { trackConversion };
}
