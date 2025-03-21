# Correção do Problema de Confirmação de Email

Este documento contém instruções para resolver o problema do link de confirmação de email que leva à página 404 (NOT FOUND).

## 1. Script SQL Simplificado

Para executar o script SQL no Supabase Studio:

1. Acesse o [Supabase Studio](https://supabase.com/dashboard/)
2. Selecione o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole os comandos SQL abaixo
6. Clique em "Run" para executar

```sql
-- Script ultra simplificado para corrigir o problema de confirmação de email

-- Marcar todos os usuários como verificados
UPDATE public.profiles SET email_verified = TRUE;

-- Criar ou substituir a função que verifica emails automaticamente
CREATE OR REPLACE FUNCTION public.auto_verify_email()
RETURNS TRIGGER AS $$
BEGIN
  -- Atualiza o perfil do usuário para marcar email como verificado
  UPDATE public.profiles
  SET email_verified = TRUE
  WHERE id = NEW.id;
  
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- Criar o gatilho se não existir
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM pg_trigger WHERE tgname = 'auto_verify_email_trigger'
  ) THEN
    CREATE TRIGGER auto_verify_email_trigger
    AFTER INSERT ON public.profiles
    FOR EACH ROW
    EXECUTE FUNCTION public.auto_verify_email();
  END IF;
END
$$;

-- Registrar a ação
INSERT INTO public.debug_logs (message)
VALUES ('Todos os usuários marcados como verificados e configurado sistema de verificação automática.');
```

## 2. Configurar Manualmente o Supabase

Como não é possível acessar algumas tabelas internas do Supabase, você precisará configurar manualmente através da interface:

1. No menu lateral, clique em "Authentication"
2. Vá para "URL Configuration"
3. Configure o "Site URL" como `https://promobconverter.cloud`
4. Na seção "Redirect URLs", adicione manualmente as URLs:
   - `https://promobconverter.cloud`
   - `https://promobconverter.cloud/verify`
   - `https://promobconverter.cloud/register`
   - `https://promobconverter.cloud/login`
5. **Importante:** Em "Email Confirmation", selecione "Disable email confirmation"
6. Clique em "Save"

## 3. Verificar o Código Frontend

Verifique se o código frontend está configurado para não depender da confirmação de email:

1. No arquivo `src/contexts/auth/authHooks.ts`, certifique-se que a função de registro não requer confirmação:
   ```typescript
   // Exemplo correto
   const { data, error } = await supabase.auth.signUp({
     email: values.email,
     password: values.password,
     // Sem emailRedirectTo
   });
   ```

2. Em `src/pages/Register.tsx`, certifique-se que o fluxo não espera confirmação de email.

## 4. Testar o Processo de Registro

Após aplicar as correções:

1. Registre um novo usuário com um email válido
2. Você deve conseguir fazer login imediatamente sem precisar confirmar o email
3. Todos os usuários existentes devem ter seus emails marcados como verificados

## 5. Se o Problema Persistir

Se mesmo após todas estas etapas o problema persistir:

1. Verifique os logs no Supabase:
   ```sql
   SELECT * FROM public.debug_logs ORDER BY created_at DESC LIMIT 20;
   ```

2. Entre em contato com o suporte do Supabase para obter assistência com as tabelas específicas de autenticação

## Observações

- Esta solução desabilita completamente a confirmação de email
- Todos os usuários serão automaticamente verificados
- Use esta abordagem apenas se você estiver enfrentando problemas persistentes com a confirmação de email
- Lembre-se de fazer deploy do código frontend após estas alterações 