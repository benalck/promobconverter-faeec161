-- CORREÇÃO CRÍTICA: Remover exposição de auth.users
-- A view users_without_profiles está expondo dados sensíveis da tabela auth.users

-- 1. Verificar se a view é usada por alguma função
SELECT 
    routine_name,
    routine_type,
    routine_definition
FROM information_schema.routines
WHERE routine_schema = 'public' 
  AND routine_definition ILIKE '%users_without_profiles%';

-- 2. Dropa a view insegura que expõe auth.users
DROP VIEW IF EXISTS public.users_without_profiles;

-- 3. Criar uma função segura para admins verificarem usuários sem perfil (se necessário)
CREATE OR REPLACE FUNCTION public.get_users_without_profiles()
RETURNS TABLE (
    user_count INTEGER,
    message TEXT
)
LANGUAGE SQL
SECURITY DEFINER
SET search_path = public
AS $$
  -- Apenas retorna a contagem, não os dados sensíveis
  SELECT 
    COUNT(*)::INTEGER as user_count,
    CASE 
      WHEN COUNT(*) > 0 THEN 'Existem usuários sem perfil cadastrado'
      ELSE 'Todos os usuários possuem perfil'
    END as message
  FROM auth.users au
  LEFT JOIN public.profiles p ON au.id = p.id
  WHERE p.id IS NULL;
$$;

-- 4. Criar política de segurança para a função (apenas admins)
REVOKE EXECUTE ON FUNCTION public.get_users_without_profiles() FROM PUBLIC;
REVOKE EXECUTE ON FUNCTION public.get_users_without_profiles() FROM anon;
REVOKE EXECUTE ON FUNCTION public.get_users_without_profiles() FROM authenticated;

-- Apenas permitir para usuários autenticados com role admin
-- (será verificado na aplicação antes de chamar a função)