-- Add last_activity field to track online users
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS last_activity TIMESTAMP WITH TIME ZONE DEFAULT NOW();

-- Create index for fast online user queries
CREATE INDEX IF NOT EXISTS idx_profiles_last_activity ON public.profiles(last_activity);

-- Update existing users to have a last_activity timestamp
UPDATE public.profiles 
SET last_activity = COALESCE(last_login, created_at)
WHERE last_activity IS NULL;

-- Create function to update last activity
CREATE OR REPLACE FUNCTION public.update_user_activity()
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.profiles
  SET last_activity = NOW()
  WHERE id = auth.uid();
END;
$$;

-- Update get_metrics_system to count truly online users (active in last 5 minutes)
CREATE OR REPLACE FUNCTION public.get_metrics_system(
  p_start_date TIMESTAMP WITH TIME ZONE DEFAULT NULL,
  p_end_date TIMESTAMP WITH TIME ZONE DEFAULT NULL
)
RETURNS JSON
LANGUAGE sql
SECURITY DEFINER
SET search_path TO 'public'
AS $function$
    SELECT 
        json_build_object(
            'total_users', (SELECT COUNT(*)::INTEGER FROM auth.users),
            'active_users', (
              SELECT COUNT(*)::INTEGER 
              FROM public.profiles 
              WHERE last_activity >= NOW() - INTERVAL '5 minutes'
              AND is_banned = FALSE
            ),
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