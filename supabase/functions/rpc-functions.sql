
-- This file is for reference only. It should be executed via the SQL editor in Supabase.

-- Function to insert a verification code
CREATE OR REPLACE FUNCTION public.insert_verification_code(p_user_id UUID, p_email TEXT, p_code TEXT) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  INSERT INTO public.verification_codes (user_id, email, code)
  VALUES (p_user_id, p_email, p_code);
END;
$$;

-- Function to verify a code and return its data if valid
CREATE OR REPLACE FUNCTION public.verify_code(p_email TEXT, p_code TEXT) 
RETURNS SETOF verification_codes
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  RETURN QUERY 
  SELECT * FROM verification_codes 
  WHERE email = p_email AND code = p_code
  LIMIT 1;
END;
$$;

-- Function to delete a verification code by ID
CREATE OR REPLACE FUNCTION public.delete_verification_code(p_id UUID) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM verification_codes WHERE id = p_id;
END;
$$;

-- Function to delete verification codes by email
CREATE OR REPLACE FUNCTION public.delete_verification_codes_by_email(p_email TEXT) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  DELETE FROM verification_codes WHERE email = p_email;
END;
$$;

-- Function to get user ID from email
CREATE OR REPLACE FUNCTION public.get_user_id_by_email(p_email TEXT) 
RETURNS json
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
DECLARE
  user_record auth.users%ROWTYPE;
BEGIN
  SELECT * INTO user_record FROM auth.users WHERE email = p_email LIMIT 1;
  RETURN json_build_object('id', user_record.id);
END;
$$;

-- Function to update email_verified status
CREATE OR REPLACE FUNCTION public.update_email_verified_status(p_user_id UUID) 
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
AS $$
BEGIN
  UPDATE public.profiles 
  SET email_verified = true
  WHERE id = p_user_id;
END;
$$;
