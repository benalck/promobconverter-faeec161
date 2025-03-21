# Correção do Problema de Confirmação de Email

Este documento contém instruções para resolver o problema do link de confirmação de email que leva à página 404 (NOT FOUND).

## 1. Executar Script SQL para Corrigir URLs

Execute o script `supabase/migrations/20240329_fix_email_redirect_urls.sql` no Supabase Studio:

1. Acesse o [Supabase Studio](https://supabase.com/dashboard/)
2. Selecione o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o conteúdo completo do arquivo SQL
6. Clique em "Run" para executar

Este script configura corretamente as URLs de redirecionamento para emails de confirmação.

## 2. Verificar Configurações de Autenticação

Ainda no Supabase Studio, verifique as configurações de autenticação:

1. No menu lateral, clique em "Authentication"
2. Vá para "URL Configuration"
3. Verifique se "Site URL" está configurado como `https://promobconverter.cloud`
4. Na seção "Redirect URLs", confirme que todas estas URLs estão presentes:
   - `https://promobconverter.cloud`
   - `https://promobconverter.cloud/verify`
   - `https://promobconverter.cloud/auth/confirm`
   - `https://promobconverter.cloud/register/verify`
   - `https://promobconverter.cloud/register/confirm`
   - `https://promobconverter.cloud/register/auth/confirm`
   - `https://promobconverter.cloud/access`
   - `https://promobconverter.cloud/register/access`
5. Adicione qualquer URL faltante e clique em "Save"

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

2. Tente definir a verificação automática de email:
   ```sql
   UPDATE auth.config SET mailer_autoconfirm = true;
   ```

3. Marque todos os usuários como verificados manualmente:
   ```sql
   UPDATE public.profiles SET email_verified = TRUE;
   ```

## Observações

- As mudanças nas rotas React são aplicadas automaticamente com o deploy
- As configurações do Supabase precisam ser feitas manualmente através do SQL ou da interface
- Se necessário, é possível reenviar emails de confirmação para usuários específicos 