-- Script para corrigir problemas de registro - 27/03/2024
-- Este script garante que todos os usuários são automaticamente verificados

-- 1. Atualizar todos os usuários existentes como verificados
UPDATE public.profiles 
SET email_verified = TRUE 
WHERE email_verified = FALSE OR email_verified IS NULL;

-- 2. Recriar a função de verificação automática
CREATE OR REPLACE FUNCTION public.auto_verify_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Verificar se o perfil já existe
  PERFORM 1 FROM public.profiles WHERE id = NEW.id;
  
  IF FOUND THEN
    -- Atualizar perfil existente
    UPDATE public.profiles
    SET email_verified = TRUE
    WHERE id = NEW.id;
  ELSE
    -- Registrar tentativa nos logs
    INSERT INTO public.debug_logs (message)
    VALUES ('Trigger auto_verify_email acionado para usuário ' || NEW.id || ' mas perfil ainda não existia');
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- 3. Garantir que o trigger está ativo
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_email();

-- 4. Criar função RPC para registrar usuário com verificação
CREATE OR REPLACE FUNCTION public.register_user_verified(
  user_id UUID,
  user_name TEXT,
  user_email TEXT,
  user_role TEXT DEFAULT 'user'
) RETURNS JSONB AS $$
DECLARE
  v_result JSONB;
BEGIN
  -- Inserir perfil de usuário com verificação ativa
  INSERT INTO public.profiles (
    id,
    name,
    email,
    role,
    created_at,
    last_login,
    email_verified,
    credits
  ) VALUES (
    user_id,
    user_name,
    user_email,
    user_role,
    NOW(),
    NOW(),
    TRUE,
    0
  );
  
  -- Registrar sucesso
  INSERT INTO public.debug_logs (message)
  VALUES ('Usuário registrado com sucesso e verificado automaticamente: ' || user_email);

  v_result := jsonb_build_object(
    'success', true,
    'message', 'Perfil criado com sucesso e verificado automaticamente'
  );
  
  RETURN v_result;
EXCEPTION
  WHEN others THEN
    v_result := jsonb_build_object(
      'success', false,
      'message', 'Erro ao criar perfil: ' || SQLERRM,
      'error_code', SQLSTATE
    );
    
    RETURN v_result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER; 