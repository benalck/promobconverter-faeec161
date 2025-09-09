-- Fix Security Definer View issue by replacing views with secure functions

-- Drop the existing views that cause security issues
DROP VIEW IF EXISTS public.system_metrics;
DROP VIEW IF EXISTS public.user_metrics;

-- Create secure function to replace system_metrics view (admin-only)
CREATE OR REPLACE FUNCTION public.get_system_metrics_secure()
RETURNS TABLE(
  total_users bigint,
  active_users bigint,
  total_conversions bigint,
  success_rate numeric,
  average_response_time numeric
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  -- Check if user is admin
  IF NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. Admin privileges required.';
  END IF;
  
  -- Return system metrics data
  RETURN QUERY
  SELECT 
    ((metrics ->> 'total_users'::text))::bigint,
    ((metrics ->> 'active_users'::text))::bigint,
    ((metrics ->> 'total_conversions'::text))::bigint,
    ((metrics ->> 'success_rate'::text))::numeric,
    ((metrics ->> 'average_response_time'::text))::numeric
  FROM (SELECT public.get_metrics_system() AS metrics) t;
END;
$$;

-- Create secure function to replace user_metrics view (user's own data + admin access)
CREATE OR REPLACE FUNCTION public.get_user_metrics_secure(target_user_id uuid DEFAULT NULL)
RETURNS TABLE(
  user_id uuid,
  total_conversions bigint,
  success_rate numeric,
  average_response_time numeric,
  total_file_size bigint
)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  user_to_query uuid;
BEGIN
  -- Determine which user to query
  user_to_query := COALESCE(target_user_id, auth.uid());
  
  -- Check access permissions
  IF user_to_query != auth.uid() AND NOT public.is_admin_user() THEN
    RAISE EXCEPTION 'Access denied. You can only view your own metrics or be an admin.';
  END IF;
  
  -- Return user metrics data
  RETURN QUERY
  SELECT 
    user_to_query,
    ((metrics ->> 'total_conversions'::text))::bigint,
    ((metrics ->> 'success_rate'::text))::numeric,
    ((metrics ->> 'average_response_time'::text))::numeric,
    ((metrics ->> 'total_file_size'::text))::bigint
  FROM (SELECT public.get_metrics_user(user_to_query) AS metrics) t;
END;
$$;