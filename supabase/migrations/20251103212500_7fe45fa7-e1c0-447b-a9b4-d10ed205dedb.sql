-- Fix final batch of SECURITY DEFINER functions missing fixed search_path

CREATE OR REPLACE FUNCTION public.get_users_without_profiles()
RETURNS TABLE(user_count integer, message text)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
  SELECT 
    COUNT(*)::INTEGER as user_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 'Existem usuários sem perfil cadastrado'
      ELSE 'Todos os usuários possuem perfil'
    END as message
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversions_by_type()
RETURNS TABLE(input_format text, output_format text, count integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT
        input_format,
        output_format,
        COUNT(*)::INTEGER as count
    FROM public.conversions
    GROUP BY input_format, output_format
    ORDER BY count DESC;
$function$;

CREATE OR REPLACE FUNCTION public.get_conversions_by_date_range(p_start_date timestamp with time zone, p_end_date timestamp with time zone)
RETURNS TABLE(date text, total integer, successful integer, failed integer)
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    WITH date_range AS (
        SELECT 
            date_trunc('day', dd)::date::text as date
        FROM generate_series(
            date_trunc('day', p_start_date), 
            date_trunc('day', p_end_date), 
            '1 day'::interval
        ) dd
    ),
    conversion_stats AS (
        SELECT 
            date_trunc('day', timestamp)::date::text as date,
            COUNT(*)::INTEGER as total,
            COUNT(*) FILTER (WHERE success = true)::INTEGER as successful,
            COUNT(*) FILTER (WHERE success = false)::INTEGER as failed
        FROM public.conversions
        WHERE timestamp >= p_start_date AND timestamp <= p_end_date
        GROUP BY date_trunc('day', timestamp)::date
    )
    SELECT 
        dr.date,
        COALESCE(cs.total, 0) as total,
        COALESCE(cs.successful, 0) as successful,
        COALESCE(cs.failed, 0) as failed
    FROM date_range dr
    LEFT JOIN conversion_stats cs ON dr.date = cs.date
    ORDER BY dr.date;
$function$;

CREATE OR REPLACE FUNCTION public.get_system_metrics(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        json_build_object(
            'total_users', (SELECT COUNT(*)::INTEGER FROM auth.users),
            'active_users', (SELECT COUNT(DISTINCT user_id)::INTEGER FROM public.conversions 
                            WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                            AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'total_conversions', (SELECT COUNT(*)::INTEGER FROM public.conversions 
                                WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'success_rate', (SELECT 
                            CASE 
                                WHEN COUNT(*) > 0 THEN 
                                    CAST((COUNT(*) FILTER (WHERE success = true)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0) * 100) AS FLOAT)
                                ELSE 0::FLOAT
                            END
                            FROM public.conversions
                            WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                            AND (p_end_date IS NULL OR timestamp <= p_end_date)),
            'average_response_time', (SELECT CAST(COALESCE(AVG(conversion_time), 0) AS FLOAT)
                                    FROM public.conversions
                                    WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                    AND (p_end_date IS NULL OR timestamp <= p_end_date))
        );
$function$;

CREATE OR REPLACE FUNCTION public.diagnose_registration_issues()
RETURNS TABLE(issue_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  issue_type := 'Usuários sem perfil';
  count := (
    SELECT COUNT(*) 
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  );
  RETURN NEXT;
  
  issue_type := 'Usuários sem email verificado';
  count := (SELECT COUNT(*) FROM public.profiles WHERE email_verified = FALSE OR email_verified IS NULL);
  RETURN NEXT;
  
  issue_type := 'Registros nas últimas 24h';
  count := (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '24 hours');
  RETURN NEXT;
  
  RETURN;
END;
$function$;

CREATE OR REPLACE FUNCTION public.get_user_metrics(p_user_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT 
        json_build_object(
            'total_conversions', COUNT(*)::INTEGER,
            'success_rate', CASE 
                            WHEN COUNT(*) > 0 THEN 
                                CAST((COUNT(*) FILTER (WHERE success = true)::FLOAT / NULLIF(COUNT(*)::FLOAT, 0) * 100) AS FLOAT)
                            ELSE 0::FLOAT
                        END,
            'average_response_time', CAST(COALESCE(AVG(conversion_time), 0) AS FLOAT),
            'total_file_size', COALESCE(SUM(file_size), 0)::INTEGER
        )
    FROM public.conversions
    WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date);
$function$;

CREATE OR REPLACE FUNCTION public.system_metrics_calc(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_users', (SELECT COUNT(DISTINCT user_id) FROM public.conversions 
                         WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                         AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'total_conversions', (SELECT COUNT(*) FROM public.conversions 
                             WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                             AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'success_rate', (SELECT 
                         CASE 
                             WHEN COUNT(*) > 0 THEN 
                                 (COUNT(*) FILTER (WHERE success = true)::float / NULLIF(COUNT(*)::float, 0) * 100)
                             ELSE 0
                         END
                        FROM public.conversions
                        WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                        AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'average_response_time', (SELECT COALESCE(AVG(conversion_time), 0)
                                 FROM public.conversions
                                 WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                 AND (p_end_date IS NULL OR timestamp <= p_end_date))
    );
$function$;

CREATE OR REPLACE FUNCTION public.user_metrics_calc(p_user_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT json_build_object(
        'total_conversions', COUNT(*),
        'success_rate', CASE 
                          WHEN COUNT(*) > 0 THEN 
                            (COUNT(*) FILTER (WHERE success = true)::float / NULLIF(COUNT(*)::float, 0) * 100)
                          ELSE 0
                        END,
        'average_response_time', COALESCE(AVG(conversion_time), 0),
        'total_file_size', COALESCE(SUM(file_size), 0)
    )
    FROM public.conversions
    WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date);
$function$;

CREATE OR REPLACE FUNCTION public.get_metrics_user(p_user_id uuid, p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT json_build_object(
        'total_conversions', COUNT(*),
        'success_rate', CASE 
                          WHEN COUNT(*) > 0 THEN 
                            (COUNT(*) FILTER (WHERE success = true)::float / NULLIF(COUNT(*)::float, 0) * 100)
                          ELSE 0
                        END,
        'average_response_time', COALESCE(AVG(conversion_time), 0),
        'total_file_size', COALESCE(SUM(file_size), 0)
    )
    FROM public.conversions
    WHERE user_id = p_user_id
    AND (p_start_date IS NULL OR timestamp >= p_start_date)
    AND (p_end_date IS NULL OR timestamp <= p_end_date);
$function$;

CREATE OR REPLACE FUNCTION public.get_metrics_system(p_start_date timestamp with time zone DEFAULT NULL::timestamp with time zone, p_end_date timestamp with time zone DEFAULT NULL::timestamp with time zone)
RETURNS json
LANGUAGE sql
SECURITY DEFINER
SET search_path = public
AS $function$
    SELECT json_build_object(
        'total_users', (SELECT COUNT(*) FROM auth.users),
        'active_users', (SELECT COUNT(DISTINCT user_id) FROM public.conversions 
                         WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                         AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'total_conversions', (SELECT COUNT(*) FROM public.conversions 
                             WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                             AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'success_rate', (SELECT 
                         CASE 
                             WHEN COUNT(*) > 0 THEN 
                                 (COUNT(*) FILTER (WHERE success = true)::float / NULLIF(COUNT(*)::float, 0) * 100)
                             ELSE 0
                         END
                        FROM public.conversions
                        WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                        AND (p_end_date IS NULL OR timestamp <= p_end_date)),
        'average_response_time', (SELECT COALESCE(AVG(conversion_time), 0)
                                 FROM public.conversions
                                 WHERE (p_start_date IS NULL OR timestamp >= p_start_date)
                                 AND (p_end_date IS NULL OR timestamp <= p_end_date))
    );
$function$;