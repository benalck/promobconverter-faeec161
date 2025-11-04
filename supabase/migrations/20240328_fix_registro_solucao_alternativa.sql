-- Solução alternativa para problemas no registro - 28/03/2024
-- Este script implementa uma solução mais robusta para o registro de usuários

-- 1. Criar um BACKUP da função de verificação automática de email
CREATE OR REPLACE FUNCTION public.auto_verify_email_backup()
RETURNS TRIGGER AS $$
BEGIN
  -- Inserir um log para diagnóstico
  INSERT INTO public.debug_logs (message)
  VALUES ('auto_verify_email_backup acionado para usuário: ' || NEW.id);
  
  -- Tentar atualizar o perfil do usuário para email_verified = TRUE
  BEGIN
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
    
    -- Verificar se a atualização afetou alguma linha
    IF NOT FOUND THEN
      -- Se o perfil ainda não existe, criar um perfil básico
      INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        created_at,
        email_verified,
        credits
      ) VALUES (
        NEW.id,
        NEW.email,
        COALESCE(NEW.raw_user_meta_data->>'name', 'Usuário ' || substring(NEW.id::text, 1, 8)),
        'user',
        NOW(),
        TRUE,
        0
      );
      
      INSERT INTO public.debug_logs (message)
      VALUES ('Perfil criado automaticamente pelo backup para usuário: ' || NEW.id);
    END IF;
  EXCEPTION
    WHEN OTHERS THEN
      -- Registrar erro para diagnóstico
      INSERT INTO public.debug_logs (message)
      VALUES ('Erro ao verificar email no backup: ' || SQLERRM || ' para usuário: ' || NEW.id);
  END;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 2. Criar um TRIGGER de BACKUP separado para maior redundância
DROP TRIGGER IF EXISTS on_auth_user_verified_backup ON auth.users;
CREATE TRIGGER on_auth_user_verified_backup
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_email_backup();

-- 3. Criar uma VIEW para diagnóstico de usuários sem perfil
CREATE OR REPLACE VIEW public.users_without_profiles AS
SELECT
  au.id,
  au.email,
  au.created_at,
  au.last_sign_in_at
FROM
  auth.users au
LEFT JOIN
  public.profiles p ON au.id = p.id
WHERE
  p.id IS NULL;

-- 4. Criar função de diagnóstico e correção para administrador
CREATE OR REPLACE FUNCTION public.fix_missing_profiles()
RETURNS TABLE (
  user_id UUID,
  email TEXT,
  status TEXT
) AS $$
DECLARE
  v_user RECORD;
BEGIN
  -- Encontrar usuários sem perfil
  FOR v_user IN (
    SELECT 
      id,
      email,
      raw_user_meta_data->>'name' as name
    FROM 
      auth.users
    WHERE 
      id NOT IN (SELECT id FROM public.profiles)
  ) LOOP
    -- Criar perfil para o usuário
    BEGIN
      INSERT INTO public.profiles (
        id,
        email,
        name,
        role,
        created_at,
        email_verified,
        credits
      ) VALUES (
        v_user.id,
        v_user.email,
        COALESCE(v_user.name, 'Usuário ' || substring(v_user.id::text, 1, 8)),
        'user',
        NOW(),
        TRUE,
        0
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 5. Criar função para diagnóstico de usuários com problema
CREATE OR REPLACE FUNCTION public.diagnose_registration_issues()
RETURNS TABLE (
  issue_type TEXT,
  count BIGINT
) AS $$
BEGIN
  -- Usuários sem perfil
  issue_type := 'Usuários sem perfil';
  count := (SELECT COUNT(*) FROM public.users_without_profiles);
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
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 6. Verificar e corrigir perfis inconsistentes
UPDATE public.profiles
SET email_verified = TRUE
WHERE email_verified = FALSE OR email_verified IS NULL;

-- 7. Registrar ações nos logs
INSERT INTO public.debug_logs (message)
VALUES ('Solução alternativa para problema de registro aplicada em ' || NOW());

-- 8. Conceder permissões para funções de diagnóstico
GRANT EXECUTE ON FUNCTION public.diagnose_registration_issues() TO authenticated;
GRANT EXECUTE ON FUNCTION public.fix_missing_profiles() TO authenticated; 