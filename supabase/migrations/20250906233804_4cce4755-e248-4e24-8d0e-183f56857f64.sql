-- CORREÇÃO CRÍTICA DE SEGURANÇA - PHASE 1 (Final)
-- 1. Remover política pública perigosa da tabela profiles
DROP POLICY IF EXISTS "Acesso universal para profiles" ON public.profiles;

-- 2. Habilitar RLS apenas na tabela debug_logs
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;

-- 3. Criar função segura para verificar role de admin
CREATE OR REPLACE FUNCTION public.is_admin_user()
RETURNS BOOLEAN
LANGUAGE SQL
SECURITY DEFINER
STABLE
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1 FROM public.profiles 
    WHERE id = auth.uid() AND role = 'admin'
  );
$$;

-- 4. Criar políticas seguras para debug_logs (somente admin)
CREATE POLICY "Admin pode ver debug logs"
ON public.debug_logs
FOR SELECT
USING (public.is_admin_user());

CREATE POLICY "Admin pode inserir debug logs"
ON public.debug_logs
FOR INSERT
WITH CHECK (public.is_admin_user());

-- 5. Limpar logs de debug com dados sensíveis existentes
DELETE FROM public.debug_logs WHERE message ILIKE '%@%' OR message ILIKE '%email%' OR message ILIKE '%senha%' OR message ILIKE '%password%';

-- 6. Corrigir todas as funções com search_path seguro
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

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    PERFORM public.create_user_profile(
        NEW.id,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário'),
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'role', 'user')
    );
    RETURN NEW;
EXCEPTION WHEN OTHERS THEN
    RETURN NEW;
END;
$function$;