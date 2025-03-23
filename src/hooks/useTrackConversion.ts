
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

// Simple response type for the track_conversion function
type TrackConversionResponse = {
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
        p_output_format: outputFormat,
        p_name: `${inputFormat}_to_${outputFormat}` // Adicionando p_name para resolver o erro
      };

      // Call the track_conversion function with simple string type annotation
      const { data, error } = await supabase.rpc('track_conversion', params);

      if (error) {
        console.error('Erro ao registrar conversão:', error);
      } else {
        console.log('Conversão registrada com sucesso:', data);
      }

      return data as TrackConversionResponse;
    } catch (error) {
      console.error('Erro ao registrar conversão:', error);
    }
  }, [user]);

  // Simplified function to track tool usage
  const trackToolUsage = useCallback(async (toolName: string) => {
    if (!user) return;

    try {
      // Simplify parameters for better maintainability
      const params = {
        p_user_id: user.id,
        p_success: true,
        p_file_size: 0,
        p_conversion_time: 0,
        p_error_message: null,
        p_input_format: `tool_${toolName}`,
        p_output_format: 'calculation',
        p_name: toolName // Adicionando p_name para resolver o erro
      };

      // Call the track_conversion function
      const { data, error } = await supabase.rpc('track_conversion', params);

      if (error) {
        console.error(`Erro ao registrar uso da ferramenta ${toolName}:`, error);
      } else {
        console.log(`Uso da ferramenta ${toolName} registrado com sucesso:`, data);
      }

      return data as TrackConversionResponse;
    } catch (error) {
      console.error(`Erro ao registrar uso da ferramenta ${toolName}:`, error);
    }
  }, [user]);

  return { trackConversion, trackToolUsage };
}
