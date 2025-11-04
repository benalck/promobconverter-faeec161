-- Script para remover a funcionalidade de créditos do sistema
-- Data: 31/03/2024

-- 1. Remover o gatilho de créditos iniciais
DROP TRIGGER IF EXISTS ensure_initial_credits_trigger ON public.profiles;

-- 2. Remover a função associada ao gatilho
DROP FUNCTION IF EXISTS public.ensure_initial_credits();

-- 3. Restaurar as funções de registro sem a lógica de créditos
DROP FUNCTION IF EXISTS public.register_user(uuid, text, text, text);
DROP FUNCTION IF EXISTS public.register_user_verified(uuid, text, text, text);

-- Recriar função register_user sem créditos
CREATE OR REPLACE FUNCTION public.register_user(user_id uuid, user_name text, user_email text, user_role text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Inserir o perfil sem créditos
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
    0  -- Sem créditos
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    email_verified = true;
    
  -- Registrar nos logs
  INSERT INTO public.debug_logs (message)
  VALUES ('Usuário registrado sem créditos: ' || user_email);
  
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

-- Recriar função register_user_verified sem créditos
CREATE OR REPLACE FUNCTION public.register_user_verified(user_id uuid, user_name text, user_email text, user_role text)
RETURNS json AS $$
DECLARE
  result json;
BEGIN
  -- Inserir o perfil sem créditos
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
    0  -- Sem créditos
  )
  ON CONFLICT (id) DO UPDATE SET
    name = EXCLUDED.name,
    email = EXCLUDED.email,
    role = EXCLUDED.role,
    email_verified = true;
    
  -- Registrar nos logs
  INSERT INTO public.debug_logs (message)
  VALUES ('Usuário registrado e verificado sem créditos: ' || user_email);
  
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

-- 4. Definir todos os créditos de usuários para zero
UPDATE public.profiles
SET credits = 0
WHERE credits > 0;

-- Registrar a alteração
INSERT INTO public.debug_logs (message)
VALUES ('Funcionalidade de créditos removida do sistema. Todos os usuários agora têm 0 créditos.'); 