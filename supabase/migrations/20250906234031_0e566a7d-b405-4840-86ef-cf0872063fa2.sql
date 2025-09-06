-- CORREÇÃO CRÍTICA DE SEGURANÇA - PHASE 2
-- Corrigir todas as funções com search_path para melhorar a segurança

-- 1. Corrigir funções existentes com search_path
CREATE OR REPLACE FUNCTION public.add_monthly_credits_for_user(user_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE profiles
  SET credits = COALESCE(credits, 0) + 10
  WHERE id = user_id AND is_banned = false;
  
  INSERT INTO credit_purchases (
    user_id, amount, credits, plan_id, purchase_date, expiry_date
  )
  VALUES (
    user_id, 0, 10, '00000000-0000-0000-0000-000000000000'::uuid, 
    now(), now() + interval '1 month'
  );
END;
$function$;

CREATE OR REPLACE FUNCTION public.add_monthly_credits()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE profiles
  SET credits = COALESCE(credits, 0) + 10
  WHERE is_banned = false;
  
  INSERT INTO credit_purchases (
    user_id, amount, credits, plan_id, purchase_date, expiry_date
  )
  SELECT 
    id, 0, 10, '00000000-0000-0000-0000-000000000000'::uuid,
    now(), now() + interval '1 month'
  FROM profiles
  WHERE is_banned = false;
END;
$function$;

CREATE OR REPLACE FUNCTION public.register_user(user_id uuid, user_name text, user_email text, user_role text DEFAULT 'user'::text)
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    success BOOLEAN;
BEGIN
    success := public.create_user_profile(user_id, user_name, user_email, user_role);
    
    IF success THEN
        RETURN json_build_object('success', TRUE, 'message', 'Perfil criado com sucesso');
    ELSE
        RETURN json_build_object('success', FALSE, 'message', 'Erro ao criar perfil');
    END IF;
END;
$function$;

CREATE OR REPLACE FUNCTION public.register_user_verified(user_id uuid, user_name text, user_email text, user_role text DEFAULT 'user'::text)
RETURNS jsonb
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_result JSONB;
BEGIN
  INSERT INTO public.profiles (
    id, name, email, role, created_at, last_login, email_verified, credits
  ) VALUES (
    user_id, user_name, user_email, user_role, NOW(), NOW(), TRUE, 0
  );
  
  v_result := jsonb_build_object(
    'success', true,
    'message', 'Perfil criado com sucesso e verificado automaticamente'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN others THEN
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Erro ao criar perfil: ' || SQLERRM,
      'error_code', SQLSTATE
    );
    
    RETURN v_result;
END;
$function$;

CREATE OR REPLACE FUNCTION public.track_conversion(p_user_id uuid, p_success boolean, p_file_size integer, p_conversion_time integer, p_error_message text DEFAULT NULL::text, p_input_format text DEFAULT 'unknown'::text, p_output_format text DEFAULT 'unknown'::text)
RETURNS uuid
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    v_conversion_id UUID;
BEGIN
    INSERT INTO public.conversions (
        user_id, success, file_size, conversion_time, error_message, input_format, output_format, timestamp
    ) VALUES (
        p_user_id, p_success, p_file_size, p_conversion_time, p_error_message, p_input_format, p_output_format, timezone('utc'::text, now())
    )
    RETURNING id INTO v_conversion_id;

    RETURN v_conversion_id;
END;
$function$;