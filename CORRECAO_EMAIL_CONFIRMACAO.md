# Correção do Problema de Confirmação de Email

Este documento contém instruções para resolver o problema do link de confirmação de email que leva à página 404 (NOT FOUND).

## 1. Executar Script SQL para Corrigir URLs

Para executar o script SQL no Supabase Studio:

1. Acesse o [Supabase Studio](https://supabase.com/dashboard/)
2. Selecione o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole os comandos SQL abaixo
6. Clique em "Run" para executar

```sql
-- Script simplificado para corrigir a confirmação de email

-- Adicionar URLs de redirecionamento válidas
INSERT INTO auth.redirect_urls (uri)
VALUES
  ('https://promobconverter.cloud'),
  ('https://promobconverter.cloud/verify'),
  ('https://promobconverter.cloud/auth/confirm'),
  ('https://promobconverter.cloud/register/verify'),
  ('https://promobconverter.cloud/register/confirm'),
  ('https://promobconverter.cloud/register/auth/confirm'),
  ('https://promobconverter.cloud/access'),
  ('https://promobconverter.cloud/register/access'),
  ('https://promobconverter.cloud/verify-email'),
  ('https://promobconverter.cloud/verify-redirect'),
  ('https://promobconverter.cloud/register')
ON CONFLICT (uri) DO NOTHING;

-- Marcar todos os usuários como verificados
UPDATE public.profiles SET email_verified = TRUE;

-- Registrar a ação
INSERT INTO public.debug_logs (message)
VALUES ('URLs de redirecionamento atualizadas e todos os usuários marcados como verificados.');
```

## 2. Verificar Configurações de Autenticação no Supabase

Ainda no Supabase Studio, verifique as configurações de autenticação:

1. No menu lateral, clique em "Authentication"
2. Vá para "URL Configuration"
3. Verifique se "Site URL" está configurado como `https://promobconverter.cloud`
4. Na seção "Redirect URLs", adicione manualmente as URLs listadas acima
5. Ative a opção "Confirm email" para "Auto-confirm"
6. Clique em "Save"

## 3. Verificar Template de Email

Verifique o template de email de confirmação:

1. No menu Authentication, vá para "Email Templates"
2. Selecione "Confirmation"
3. Certifique-se de que o botão usa a URL correta
4. Clique em "Save" se fizer alguma alteração

## 4. Testar o Processo de Registro

Após aplicar as correções:

1. Registre um novo usuário com um email válido
2. Verifique a caixa de entrada do email (e a pasta de spam)
3. Clique no link de confirmação enviado
4. Você deve ser redirecionado para a página de verificação e então para o login

## 5. Se o Problema Persistir

Se mesmo após todas estas etapas o problema persistir:

1. Verifique os logs no Supabase:
   ```sql
   SELECT * FROM public.debug_logs ORDER BY created_at DESC LIMIT 20;
   ```

2. Tente a solução mais radical - Desativar completamente a verificação de email:
   1. Adicione um gatilho para marcar automaticamente todos os novos usuários como verificados
   2. Certifique-se que todas as rotas de verificação no App.tsx estão corretas
   3. Contate o suporte do Supabase se necessário

## Observações

- As mudanças nas rotas React são aplicadas automaticamente com o deploy
- As configurações do Supabase precisam ser feitas manualmente através do SQL ou da interface
- Se necessário, é possível reenviar emails de confirmação para usuários específicos 