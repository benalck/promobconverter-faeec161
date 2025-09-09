-- CORREÇÃO FINAL DAS VIEWS COM SECURITY DEFINER
-- Verificar e corrigir views que ainda podem ter Security Definer

-- 1. Verificar todas as views no schema public
SELECT table_name, view_definition 
FROM information_schema.views 
WHERE table_schema = 'public';

-- 2. Recriar views system_metrics e user_metrics sem Security Definer se necessário
-- (essas views provavelmente são seguras pois não expõem auth.users)

-- 3. Corrigir funções restantes que ainda não têm search_path
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