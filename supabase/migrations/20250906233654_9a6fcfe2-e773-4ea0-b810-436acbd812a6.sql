-- CORREÇÃO CRÍTICA DE SEGURANÇA - PHASE 1
-- 1. Remover política pública perigosa da tabela profiles
DROP POLICY IF EXISTS "Acesso universal para profiles" ON public.profiles;

-- 2. Habilitar RLS em tabelas desprotegidas
ALTER TABLE public.debug_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.system_metrics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_metrics ENABLE ROW LEVEL SECURITY;
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

-- 5. Criar políticas seguras para system_metrics (somente admin)
CREATE POLICY "Admin pode ver métricas do sistema"
ON public.system_metrics
FOR SELECT
USING (public.is_admin_user());

CREATE POLICY "Admin pode inserir métricas do sistema"
ON public.system_metrics
FOR INSERT
WITH CHECK (public.is_admin_user());

-- 6. Criar políticas seguras para user_metrics (somente admin)
CREATE POLICY "Admin pode ver métricas de usuários"
ON public.user_metrics
FOR SELECT
USING (public.is_admin_user());

CREATE POLICY "Admin pode inserir métricas de usuários"
ON public.user_metrics
FOR INSERT
WITH CHECK (public.is_admin_user());

-- 7. Criar políticas para users_without_profiles (somente admin)
CREATE POLICY "Admin pode ver usuários sem perfil"
ON public.users_without_profiles
FOR SELECT
USING (public.is_admin_user());

-- 8. Limpar logs de debug com dados sensíveis (opcional - descomente se necessário)
-- DELETE FROM public.debug_logs WHERE message LIKE '%email%' OR message LIKE '%@%';

-- 9. Adicionar search_path seguro às funções existentes
CREATE OR REPLACE FUNCTION public.create_user_profile(user_id uuid, user_name text, user_email text, user_role text DEFAULT 'user'::text)
RETURNS boolean
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $function$
DECLARE
    success BOOLEAN;
BEGIN
    -- Verificar se o perfil já existe
    IF EXISTS (SELECT 1 FROM public.profiles WHERE id = user_id) THEN
        -- Atualizar perfil existente
        UPDATE public.profiles
        SET 
            name = user_name,
            email = user_email,
            role = user_role,
            last_login = NOW()
        WHERE id = user_id;
        success := TRUE;
    ELSE
        -- Inserir novo perfil
        BEGIN
            INSERT INTO public.profiles (
                id,
                name,
                email,
                role,
                created_at,
                last_login,
                is_banned,
                email_verified,
                credits
            ) VALUES (
                user_id,
                user_name,
                user_email,
                user_role,
                NOW(),
                NOW(),
                FALSE,
                FALSE,
                0
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