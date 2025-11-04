-- Fix SECURITY DEFINER functions missing fixed search_path
-- This prevents SQL injection through search_path manipulation

-- Update existing functions to add SET search_path = public
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.update_cutting_plans_updated_at()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_verify_email()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  UPDATE public.profiles
  SET email_verified = TRUE
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.debug_registration()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  INSERT INTO public.debug_logs (
    message,
    user_id,
    created_at
  )
  VALUES (
    'Usuário registrado: ' || NEW.email,
    NEW.id,
    NOW()
  );
  RETURN NEW;
END;
$function$;

CREATE OR REPLACE FUNCTION public.auto_verify_email_backup()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  BEGIN
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
    
    IF NOT FOUND THEN
      INSERT INTO public.profiles (
        id, email, name, role, created_at, email_verified, credits
      ) VALUES (
        NEW.id, NEW.email, 
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário ' || substring(NEW.id::text, 1, 8)),
        'user', NOW(), TRUE, 0
      );
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      NULL;
  END;
  
  RETURN NEW;
END;
$function$;

-- Tighten RLS policies on verification_codes to prevent anonymous access vulnerabilities
DROP POLICY IF EXISTS "Users can delete their own verification codes" ON public.verification_codes;
DROP POLICY IF EXISTS "Users can view their own verification codes" ON public.verification_codes;

-- Create stricter policies that don't allow anonymous access
CREATE POLICY "Authenticated users can delete their own verification codes"
ON public.verification_codes
FOR DELETE
TO authenticated
USING (auth.uid() = user_id);

CREATE POLICY "Authenticated users can view their own verification codes"
ON public.verification_codes
FOR SELECT
TO authenticated
USING (auth.uid() = user_id);

-- Keep the anonymous insert policy but add rate limiting through validation
-- The insert policy needs to exist for registration flow, but we'll add server-side validation