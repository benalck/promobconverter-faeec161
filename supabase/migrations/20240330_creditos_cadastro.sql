-- Script para adicionar 10 créditos iniciais a cada usuário que se cadastra
-- Data: 30/03/2024

-- Parte 1: Remover funções existentes antes de criar as novas versões
DROP FUNCTION IF EXISTS public.register_user(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.register_user_verified(uuid, text, text, text);

-- Atualizar a função register_user para incluir 10 créditos
CREATE OR REPLACE FUNCTION public.register_user(user_id uuid, user_name text, user_email text, user_role text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Inserir o perfil com 10 créditos
  INSERT INTO public.profiles (id, name, email, role, created_at, last_login, is_banned, email_verified, credits)
  VALUES (
    user_id,
    user_name,
    user_email,
    user_role,
    now(),
    now(),
    false,
    true,
    10  -- 10 créditos iniciais
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    email_verified = true,
    credits = CASE
      WHEN public.profiles.credits < 10 THEN 10
      ELSE public.profiles.credits
    END;
    
  -- Registrar nos logs
  INSERT INTO public.debug_logs (message)
  VALUES ('Usuário registrado com 10 créditos: ' || user_email);
  
  result := json_build_object(
    'success', true,
    'message', 'Usuário registrado com sucesso'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false,
    'message', 'Erro ao registrar usuário: ' || SQLERRM
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Atualizar a função register_user_verified para incluir 10 créditos
CREATE OR REPLACE FUNCTION public.register_user_verified(user_id uuid, user_name text, user_email text, user_role text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Inserir o perfil com 10 créditos e email verificado
  INSERT INTO public.profiles (id, name, email, role, created_at, last_login, is_banned, email_verified, credits)
  VALUES (
    user_id,
    user_name,
    user_email,
    user_role,
    now(),
    now(),
    false,
    true,
    10  -- 10 créditos iniciais
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    email_verified = true,
    credits = CASE
      WHEN public.profiles.credits < 10 THEN 10
      ELSE public.profiles.credits
    END;
    
  -- Registrar nos logs
  INSERT INTO public.debug_logs (message)
  VALUES ('Usuário registrado e verificado com 10 créditos: ' || user_email);
  
  result := json_build_object(
    'success', true,
    'message', 'Usuário registrado e verificado com sucesso'
  );
  
  RETURN result;
EXCEPTION WHEN OTHERS THEN
  result := json_build_object(
    'success', false,
    'message', 'Erro ao registrar e verificar usuário: ' || SQLERRM
  );
  
  RETURN result;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Parte 2: Criar um gatilho para garantir créditos iniciais em novos registros (proteção adicional)

-- Função para garantir créditos iniciais
CREATE OR REPLACE FUNCTION public.ensure_initial_credits()
RETURNS TRIGGER AS $$
BEGIN
  -- Se os créditos são menores que 10, definir como 10
  IF NEW.credits < 10 THEN
    NEW.credits := 10;
  END IF;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Remover o gatilho se já existir
DROP TRIGGER IF EXISTS ensure_initial_credits_trigger ON public.profiles;

-- Criar o gatilho
CREATE TRIGGER ensure_initial_credits_trigger
BEFORE INSERT ON public.profiles
FOR EACH ROW
EXECUTE FUNCTION public.ensure_initial_credits();

-- Atualizar créditos de usuários existentes
UPDATE public.profiles
SET credits = 10
WHERE credits < 10;

-- Registrar a atualização nos logs
INSERT INTO public.debug_logs (message)
VALUES ('Configuração de créditos iniciais (10) para novos usuários implementada e usuários existentes atualizados.'); 