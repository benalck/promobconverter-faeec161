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
      // Define parameters for RPC
      const params = {
        p_user_id: user.id,
        p_success: success,
        p_file_size: fileSize,
        p_conversion_time: conversionTime,
        p_error_message: errorMessage || null,
        p_input_format: inputFormat,
        p_output_format: outputFormat
      };

      // Corrigido: Chama a função track_conversion sem o uso de generic types
      const { data, error } = await supabase.rpc('track_conversion', params);

      if (error) {
        console.error('Erro ao registrar conversão:', error);
      } else {
        console.log('Conversão registrada com sucesso:', data);
      }

      return data;
    } catch (error) {
      console.error('Erro ao registrar conversão:', error);
    }
  }, [user]);

  return { trackConversion };
}
