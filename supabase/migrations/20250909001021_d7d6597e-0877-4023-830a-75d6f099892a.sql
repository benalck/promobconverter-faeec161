-- CORREÇÃO FINAL: Corrigir função que referenciava a view removida
-- e resolver issues de segurança restantes

-- 1. Corrigir função diagnose_registration_issues
CREATE OR REPLACE FUNCTION public.diagnose_registration_issues()
RETURNS TABLE(issue_type text, count bigint)
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
BEGIN
  -- Usuários sem perfil (calculado diretamente sem a view insegura)
  issue_type := 'Usuários sem perfil';
  count := (
    SELECT COUNT(*) 
    FROM auth.users au
    LEFT JOIN public.profiles p ON au.id = p.id
    WHERE p.id IS NULL
  );
  RETURN NEXT;
  
  -- Usuários sem email verificado
  issue_type := 'Usuários sem email verificado';
  count := (SELECT COUNT(*) FROM public.profiles WHERE email_verified = FALSE OR email_verified IS NULL);
  RETURN NEXT;
  
  -- Usuários registrados nas últimas 24h
  issue_type := 'Registros nas últimas 24h';
  count := (SELECT COUNT(*) FROM auth.users WHERE created_at > NOW() - INTERVAL '24 hours');
  RETURN NEXT;
  
  RETURN;
END;
$function$;

-- 2. Corrigir outras funções que podem ter search_path faltando
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
      -- Silenciar erros para não bloquear o registro
      NULL;
  END;
  
  RETURN NEW;
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