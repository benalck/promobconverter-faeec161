-- Script para corrigir URLs de redirecionamento de email - 29/03/2024
-- Este script corrige a configuração de redirecionamento de confirmação de email

-- Definir as novas URLs permitidas (mantenha as existentes e adicione novas)
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
  ('https://promobconverter.cloud/register'),
  ('http://localhost:5173'),
  ('http://localhost:5173/verify'),
  ('http://localhost:5173/register')
ON CONFLICT (uri) DO NOTHING;

-- Limpar URLs inválidas (opcional)
DELETE FROM auth.redirect_urls
WHERE uri NOT LIKE 'https://promobconverter.cloud%' 
  AND uri NOT LIKE 'http://localhost%';

-- Verificar configuração correta das chaves de autenticação
UPDATE auth.config
SET redirect_urls = array(SELECT uri FROM auth.redirect_urls);

-- Registrar ação nos logs
INSERT INTO public.debug_logs (message)
VALUES ('URLs de redirecionamento para confirmação de email corrigidas. URLs permitidas atualizadas.');

-- Atualizar configuração para oferecer melhor suporte a confirmação de emails
UPDATE auth.config 
SET site_url = 'https://promobconverter.cloud',
    mailer_autoconfirm = true,
    external_email_redirect_urls = array(
      'https://promobconverter.cloud/verify',
      'https://promobconverter.cloud/register/verify',
      'https://promobconverter.cloud/register/access',
      'https://promobconverter.cloud/access'
    );

-- Verificar usuários recentes que possam precisar de reenvio de email
INSERT INTO public.debug_logs (message)
SELECT 'Usuário recente registrado: ' || email || ' em ' || created_at 
FROM auth.users 
WHERE created_at > NOW() - INTERVAL '24 hours'; 