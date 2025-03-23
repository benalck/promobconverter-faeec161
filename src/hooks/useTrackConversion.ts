
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

      // Call the track_conversion function
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

  // New function to track tool usage (for calculators and other tools)
  const trackToolUsage = useCallback(async ({
    toolName,
    success = true,
    duration = 0,
    errorMessage = null
  }: {
    toolName: string;
    success?: boolean;
    duration?: number;
    errorMessage?: string;
  }) => {
    if (!user) return;

    try {
      // Define parameters for RPC (using the same conversion tracking function)
      const params = {
        p_user_id: user.id,
        p_success: success,
        p_file_size: 0, // No file for tools
        p_conversion_time: duration,
        p_error_message: errorMessage,
        p_input_format: `tool_${toolName}`,  // Mark as tool usage in the input format
        p_output_format: 'calculation'       // Output is a calculation
      };

      // Call the track_conversion function
      const { data, error } = await supabase.rpc('track_conversion', params);

      if (error) {
        console.error(`Erro ao registrar uso da ferramenta ${toolName}:`, error);
      } else {
        console.log(`Uso da ferramenta ${toolName} registrado com sucesso:`, data);
      }

      return data;
    } catch (error) {
      console.error(`Erro ao registrar uso da ferramenta ${toolName}:`, error);
    }
  }, [user]);

  return { trackConversion, trackToolUsage };
}
