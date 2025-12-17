-- Remover sobrecarga que causa erro PGRST203 (ambiguidade no PostgREST)
DROP FUNCTION IF EXISTS public.track_conversion(uuid, boolean, bigint, integer, text, text, text);

-- Garantir assinatura única (p_file_size INTEGER) e preencher o campo obrigatório name
CREATE OR REPLACE FUNCTION public.track_conversion(
  p_user_id uuid,
  p_success boolean,
  p_file_size integer,
  p_conversion_time integer,
  p_error_message text DEFAULT NULL,
  p_input_format text DEFAULT 'unknown',
  p_output_format text DEFAULT 'unknown'
)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  v_conversion_id uuid;
BEGIN
  INSERT INTO public.conversions (
    user_id,
    name,
    success,
    file_size,
    conversion_time,
    error_message,
    input_format,
    output_format,
    timestamp
  ) VALUES (
    p_user_id,
    COALESCE(p_input_format, 'XML') || ' to ' || COALESCE(p_output_format, 'Excel'),
    p_success,
    p_file_size,
    p_conversion_time,
    p_error_message,
    p_input_format,
    p_output_format,
    timezone('utc'::text, now())
  )
  RETURNING id INTO v_conversion_id;

  RETURN v_conversion_id;
END;
$$;