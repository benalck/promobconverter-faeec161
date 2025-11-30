-- Criar tabela para histórico de orçamentos
CREATE TABLE IF NOT EXISTS public.budget_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  xml_data JSONB NOT NULL,
  total_materials NUMERIC(10, 2) NOT NULL DEFAULT 0,
  total_labor NUMERIC(10, 2) NOT NULL DEFAULT 0,
  profit NUMERIC(10, 2) NOT NULL DEFAULT 0,
  final_price NUMERIC(10, 2) NOT NULL DEFAULT 0,
  items JSONB NOT NULL DEFAULT '[]'::jsonb,
  config JSONB NOT NULL DEFAULT '{}'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de otimização de cortes
CREATE TABLE IF NOT EXISTS public.cut_optimizer_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  xml_data JSONB NOT NULL,
  total_sheets INTEGER NOT NULL DEFAULT 0,
  waste_percentage NUMERIC(5, 2) NOT NULL DEFAULT 0,
  layout_data JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de lista de materiais
CREATE TABLE IF NOT EXISTS public.materials_bom_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  xml_data JSONB NOT NULL,
  materials_list JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para verificação IA
CREATE TABLE IF NOT EXISTS public.project_verification_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  xml_data JSONB NOT NULL,
  issues_found JSONB NOT NULL DEFAULT '[]'::jsonb,
  suggestions JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para comparação de projetos
CREATE TABLE IF NOT EXISTS public.project_comparison_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name_v1 TEXT NOT NULL,
  project_name_v2 TEXT NOT NULL,
  xml_data_v1 JSONB NOT NULL,
  xml_data_v2 JSONB NOT NULL,
  differences JSONB NOT NULL DEFAULT '[]'::jsonb,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para histórico de PDFs gerados
CREATE TABLE IF NOT EXISTS public.pdf_generation_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  project_name TEXT NOT NULL,
  pdf_url TEXT,
  pdf_type TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para gestão de projetos
CREATE TABLE IF NOT EXISTS public.user_projects (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  description TEXT,
  status TEXT NOT NULL DEFAULT 'novo' CHECK (status IN ('novo', 'em_producao', 'finalizado')),
  xml_data JSONB,
  pdf_urls JSONB DEFAULT '[]'::jsonb,
  total_cost NUMERIC(10, 2) DEFAULT 0,
  delivery_date TIMESTAMP WITH TIME ZONE,
  client_name TEXT,
  client_phone TEXT,
  client_email TEXT,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Criar tabela para configurações de custos do usuário
CREATE TABLE IF NOT EXISTS public.user_cost_settings (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE UNIQUE,
  sheet_cost NUMERIC(10, 2) DEFAULT 120.00,
  labor_cost_per_hour NUMERIC(10, 2) DEFAULT 35.00,
  markup NUMERIC(5, 2) DEFAULT 1.70,
  edge_banding_cost_per_meter NUMERIC(10, 2) DEFAULT 2.50,
  hardware_cost_percentage NUMERIC(5, 2) DEFAULT 15.00,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Habilitar RLS em todas as tabelas
ALTER TABLE public.budget_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cut_optimizer_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.materials_bom_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_verification_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.project_comparison_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.pdf_generation_history ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_projects ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_cost_settings ENABLE ROW LEVEL SECURITY;

-- Políticas RLS para budget_history
CREATE POLICY "Users can view their own budget history"
  ON public.budget_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own budget history"
  ON public.budget_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own budget history"
  ON public.budget_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para cut_optimizer_history
CREATE POLICY "Users can view their own cut optimizer history"
  ON public.cut_optimizer_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cut optimizer history"
  ON public.cut_optimizer_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cut optimizer history"
  ON public.cut_optimizer_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para materials_bom_history
CREATE POLICY "Users can view their own materials BOM history"
  ON public.materials_bom_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own materials BOM history"
  ON public.materials_bom_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own materials BOM history"
  ON public.materials_bom_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para project_verification_history
CREATE POLICY "Users can view their own verification history"
  ON public.project_verification_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own verification history"
  ON public.project_verification_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own verification history"
  ON public.project_verification_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para project_comparison_history
CREATE POLICY "Users can view their own comparison history"
  ON public.project_comparison_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own comparison history"
  ON public.project_comparison_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own comparison history"
  ON public.project_comparison_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para pdf_generation_history
CREATE POLICY "Users can view their own PDF history"
  ON public.pdf_generation_history FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own PDF history"
  ON public.pdf_generation_history FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can delete their own PDF history"
  ON public.pdf_generation_history FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para user_projects
CREATE POLICY "Users can view their own projects"
  ON public.user_projects FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own projects"
  ON public.user_projects FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own projects"
  ON public.user_projects FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own projects"
  ON public.user_projects FOR DELETE
  USING (auth.uid() = user_id);

-- Políticas RLS para user_cost_settings
CREATE POLICY "Users can view their own cost settings"
  ON public.user_cost_settings FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can insert their own cost settings"
  ON public.user_cost_settings FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cost settings"
  ON public.user_cost_settings FOR UPDATE
  USING (auth.uid() = user_id);

-- Trigger para atualizar updated_at automaticamente
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_budget_history_updated_at BEFORE UPDATE ON public.budget_history
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_projects_updated_at BEFORE UPDATE ON public.user_projects
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_user_cost_settings_updated_at BEFORE UPDATE ON public.user_cost_settings
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();