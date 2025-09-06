-- CORREÇÃO CRÍTICA DE SEGURANÇA - PHASE 1 (Corrigida)
-- 1. Remover política pública perigosa da tabela profiles
DROP POLICY IF EXISTS "Acesso universal para profiles" ON public.profiles;

-- 2. Habilitar RLS apenas em tabelas (não views)
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.users_without_profiles ENABLE ROW LEVEL SECURITY;

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

-- 5. Criar políticas para users_without_profiles (somente admin)
CREATE POLICY "Admin pode ver usuários sem perfil"
ON public.users_without_profiles
FOR SELECT
USING (public.is_admin_user());

-- 6. Limpar logs de debug com dados sensíveis existentes
DELETE FROM public.debug_logs WHERE message ILIKE '%@%' OR message ILIKE '%email%' OR message ILIKE '%senha%' OR message ILIKE '%password%';

-- 7. Corrigir funções com search_path seguro
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER 
SET search_path = public
AS $function$
BEGIN
    -- Tenta criar perfil de usuário usando a função segura
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