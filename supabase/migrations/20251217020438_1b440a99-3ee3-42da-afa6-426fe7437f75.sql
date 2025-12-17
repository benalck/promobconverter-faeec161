-- Atualizar a função track_conversion para incluir o campo name
CREATE OR REPLACE FUNCTION public.track_conversion(
    p_user_id UUID,
    p_success BOOLEAN,
    p_file_size BIGINT,
    p_conversion_time INTEGER,
    p_error_message TEXT DEFAULT NULL,
    p_input_format TEXT DEFAULT 'unknown',
    p_output_format TEXT DEFAULT 'unknown'
)
RETURNS UUID
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
    v_conversion_id UUID;
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