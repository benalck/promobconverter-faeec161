-- Fix critical security vulnerabilities
-- 1. Remove anonymous insert policy on profiles
-- 2. Update RLS policies to use has_role functions instead of profiles.role
-- 3. Ensure user_roles table is properly configured

-- Drop the dangerous anonymous insert policy
DROP POLICY IF EXISTS "Permitir inserção anônima para registro" ON profiles;

-- Update RLS policies to use security definer functions instead of direct role checks

-- Suppliers table
DROP POLICY IF EXISTS "Admins podem gerenciar fornecedores" ON suppliers;
CREATE POLICY "Admins podem gerenciar fornecedores" 
ON suppliers FOR ALL 
USING (is_admin_or_ceo());

-- Materials table
DROP POLICY IF EXISTS "Admins podem gerenciar materiais" ON materials;
CREATE POLICY "Admins podem gerenciar materiais" 
ON materials FOR ALL 
USING (is_admin_or_ceo());

-- Edgebands table
DROP POLICY IF EXISTS "Admins podem gerenciar bordas" ON edgebands;
CREATE POLICY "Admins podem gerenciar bordas" 
ON edgebands FOR ALL 
USING (is_admin_or_ceo());

-- Services table
DROP POLICY IF EXISTS "Admins podem gerenciar serviços" ON services;
CREATE POLICY "Admins podem gerenciar serviços" 
ON services FOR ALL 
USING (is_admin_or_ceo());

-- Estimates table
DROP POLICY IF EXISTS "Admins podem ver todos os orçamentos" ON estimates;
CREATE POLICY "Admins podem ver todos os orçamentos" 
ON estimates FOR SELECT 
USING (is_admin_or_ceo());

-- Price histories table
DROP POLICY IF EXISTS "Admins podem ver histórico de preços" ON price_histories;
CREATE POLICY "Admins podem ver histórico de preços" 
ON price_histories FOR SELECT 
USING (is_admin_or_ceo());

-- Credit purchases table
DROP POLICY IF EXISTS "Admins podem ver todas as compras" ON credit_purchases;
CREATE POLICY "Admins podem ver todas as compras" 
ON credit_purchases FOR SELECT 
USING (is_admin_or_ceo());