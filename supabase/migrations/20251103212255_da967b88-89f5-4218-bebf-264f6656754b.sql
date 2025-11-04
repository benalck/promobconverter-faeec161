-- Fix remaining SECURITY DEFINER functions missing fixed search_path

CREATE OR REPLACE FUNCTION public.get_system_metrics_secure()
RETURNS TABLE(total_users bigint, active_users bigint, total_conversions bigint, success_rate numeric, average_response_time numeric)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  RETURN QUERY
  SELECT 
    ((metrics ->> 'total_users'::text))::bigint,
    ((metrics ->> 'active_users'::text))::bigint,
    ((metrics ->> 'total_conversions'::text))::bigint,
    ((metrics ->> 'success_rate'::text))::numeric,
    ((metrics ->> 'average_response_time'::text))::numeric
  FROM (SELECT public.get_metrics_system() AS metrics) t;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_metrics_secure(target_user_id uuid DEFAULT NULL::uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS TABLE(user_id uuid, total_conversions bigint, success_rate numeric, average_response_time numeric, total_file_size bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  user_to_query UUID;
BEGIN
  user_to_query := COALESCE(target_user_id, auth.uid());

  IF user_to_query != auth.uid() AND NOT public.is_admin_or_ceo() THEN
    RAISE EXCEPTION 'Access denied. You can only view your own metrics or be an admin/CEO.';
  END IF;

  RETURN QUERY
  SELECT
    user_to_query,
    ((metrics ->> 'total_conversions')::TEXT)::BIGINT,
    ((metrics ->> 'success_rate')::TEXT)::NUMERIC,
    ((metrics ->> 'average_response_time')::TEXT)::NUMERIC,
    ((metrics ->> 'total_file_size')::TEXT)::BIGINT
  FROM (SELECT public.get_metrics_user(user_to_query, p_start_date, p_end_date) AS metrics) t;
END;
$function$;

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

CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid, user_name text, user_email text, user_role text DEFAULT 'user'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    success BOOLEAN;
BEGIN
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        UPDATE public.profiles
        SET 
            name = user_name,
            email = user_email,
            role = user_role,
            last_login = NOW()
        WHERE id = user_id;
        success := TRUE;
    ELSE
        BEGIN
            INSERT INTO public.profiles (
                id, name, email, role, created_at, last_login, is_banned, email_verified, credits
            ) VALUES (
                user_id, user_name, user_email, user_role, NOW(), NOW(), FALSE, FALSE, 0
            );
            success := TRUE;
        EXCEPTION WHEN OTHERS THEN
            success := FALSE;
        END;
    END IF;
    
    RETURN success;
EXCEPTION WHEN OTHERS THEN
    RETURN FALSE;
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

CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS TABLE(user_id uuid, email text, status text)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
  v_user RECORD;
BEGIN
  FOR v_user IN (
    SELECT 
      id, email, raw_user_meta_data->>'name' as name
    FROM auth.users
    WHERE id NOT IN (SELECT id FROM public.profiles)
  ) LOOP
    BEGIN
      INSERT INTO public.profiles (
        id, email, name, role, created_at, email_verified, credits
      ) VALUES (
        v_user.id, v_user.email,
        COALESCE(v_user.name, 'Usuário ' || substring(v_user.id::text, 1, 8)),
        'user', NOW(), TRUE, 0
      );
      
      user_id := v_user.id;
      email := v_user.email;
      status := 'Perfil criado com sucesso';
      RETURN NEXT;
    EXCEPTION
      WHEN OTHERS THEN
        user_id := v_user.id;
        email := v_user.email;
        status := 'Erro: ' || SQLERRM;
        RETURN NEXT;
    END;
  END LOOP;
  
  RETURN;
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