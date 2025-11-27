-- Add RLS policy for admins and CEOs to view all user profiles
CREATE POLICY "Admins and CEOs can view all profiles"
ON public.profiles
FOR SELECT
TO authenticated
USING (public.is_admin_or_ceo());