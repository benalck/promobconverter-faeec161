-- Fix Security Definer View issue by adding RLS policies to system_metrics and user_metrics views

-- Enable RLS on system_metrics view (admin-only access to business intelligence data)
ALTER VIEW public.system_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Only admins can access system metrics
CREATE POLICY "system_metrics_admin_only" ON public.system_metrics
FOR SELECT 
USING (public.is_admin_user());

-- Enable RLS on user_metrics view (users see own data, admins see all)
ALTER VIEW public.user_metrics ENABLE ROW LEVEL SECURITY;

-- Policy: Users can only see their own metrics
CREATE POLICY "user_metrics_own_data" ON public.user_metrics
FOR SELECT 
USING (auth.uid() = user_id);

-- Policy: Admins can see all user metrics
CREATE POLICY "user_metrics_admin_access" ON public.user_metrics
FOR SELECT 
USING (public.is_admin_user());

-- Add security barrier to both views to ensure RLS is enforced
ALTER VIEW public.system_metrics SET (security_barrier = true);
ALTER VIEW public.user_metrics SET (security_barrier = true);