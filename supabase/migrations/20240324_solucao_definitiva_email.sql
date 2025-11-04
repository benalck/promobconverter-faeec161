-- SOLUÇÃO DEFINITIVA: Desativar completamente a verificação de email

-- 1. Marcar TODOS os usuários como verificados
UPDATE public.profiles 
SET email_verified = TRUE;

-- 2. Atualizar configuração para autoverificar novos usuários
-- Criar função de trigger se não existir
CREATE OR REPLACE FUNCTION public.auto_verify_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Marcar automaticamente como verificado
  UPDATE public.profiles
  SET email_verified = TRUE
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar trigger para novos usuários
DROP TRIGGER IF EXISTS on_auth_user_verified ON auth.users;
CREATE TRIGGER on_auth_user_verified
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.auto_verify_email();

-- Inserir nota nos logs
INSERT INTO public.debug_logs (message)
VALUES ('SOLUÇÃO DEFINITIVA: Todos os emails serão automaticamente verificados sem necessidade de confirmação por email'); 