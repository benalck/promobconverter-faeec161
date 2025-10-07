-- FASE 3: Sistema de Orçamento Inteligente
-- Tabelas para gestão de materiais, serviços e orçamentos

-- Tabela de fornecedores
CREATE TABLE IF NOT EXISTS public.suppliers (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  contact_email TEXT,
  contact_phone TEXT,
  address TEXT,
  notes TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de materiais (chapas)
CREATE TABLE IF NOT EXISTS public.materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- MDF, MDP, Compensado, etc
  thickness_mm INTEGER NOT NULL,
  width_mm INTEGER NOT NULL DEFAULT 2750,
  height_mm INTEGER NOT NULL DEFAULT 1850,
  color TEXT,
  finish TEXT, -- Revestido, Cru, UV, etc
  price_per_sqm DECIMAL(10,2) NOT NULL,
  yield_factor DECIMAL(3,2) DEFAULT 0.85, -- % aproveitamento (0-1)
  supplier_id UUID REFERENCES public.suppliers(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de fitas de borda
CREATE TABLE IF NOT EXISTS public.edgebands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  thickness_mm DECIMAL(4,2) NOT NULL,
  width_mm INTEGER NOT NULL,
  color TEXT,
  material TEXT, -- PVC, ABS, Melamina, etc
  price_per_meter DECIMAL(10,2) NOT NULL,
  supplier_id UUID REFERENCES public.suppliers(id),
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de serviços
CREATE TABLE IF NOT EXISTS public.services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  name TEXT NOT NULL,
  type TEXT NOT NULL, -- corte, furacao, usinagem, montagem, transporte
  unit TEXT NOT NULL, -- peça, m², hora, unidade
  price_per_unit DECIMAL(10,2) NOT NULL,
  description TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de projetos/orçamentos
CREATE TABLE IF NOT EXISTS public.estimates (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  client_name TEXT,
  client_email TEXT,
  client_phone TEXT,
  status TEXT DEFAULT 'draft', -- draft, sent, approved, rejected, in_production
  version INTEGER DEFAULT 1,
  
  -- Configurações de cálculo
  profit_margin_percent DECIMAL(5,2) DEFAULT 20.00,
  tax_percent DECIMAL(5,2) DEFAULT 0.00,
  discount_percent DECIMAL(5,2) DEFAULT 0.00,
  
  -- Totais calculados
  material_cost DECIMAL(10,2) DEFAULT 0,
  edgeband_cost DECIMAL(10,2) DEFAULT 0,
  service_cost DECIMAL(10,2) DEFAULT 0,
  subtotal DECIMAL(10,2) DEFAULT 0,
  total DECIMAL(10,2) DEFAULT 0,
  
  -- Metadados
  pieces_data JSONB, -- JSON das peças originais
  calculation_data JSONB, -- Dados detalhados do cálculo
  notes TEXT,
  valid_until TIMESTAMPTZ,
  
  created_at TIMESTAMPTZ DEFAULT now(),
  updated_at TIMESTAMPTZ DEFAULT now(),
  approved_at TIMESTAMPTZ,
  sent_at TIMESTAMPTZ
);

-- Tabela de itens do orçamento (materiais)
CREATE TABLE IF NOT EXISTS public.estimate_materials (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  material_id UUID REFERENCES public.materials(id),
  
  -- Dados do material no momento do orçamento (para histórico)
  material_name TEXT NOT NULL,
  material_type TEXT,
  thickness_mm INTEGER,
  
  -- Quantidades
  quantity INTEGER NOT NULL, -- número de chapas
  area_sqm DECIMAL(10,4) NOT NULL,
  waste_percent DECIMAL(5,2) DEFAULT 10.00,
  
  -- Preços
  unit_price DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens do orçamento (bordas)
CREATE TABLE IF NOT EXISTS public.estimate_edgebands (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  edgeband_id UUID REFERENCES public.edgebands(id),
  
  -- Dados da borda no momento do orçamento
  edgeband_name TEXT NOT NULL,
  thickness_mm DECIMAL(4,2),
  
  -- Quantidades
  length_meters DECIMAL(10,2) NOT NULL,
  
  -- Preços
  price_per_meter DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Tabela de itens do orçamento (serviços)
CREATE TABLE IF NOT EXISTS public.estimate_services (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  estimate_id UUID NOT NULL REFERENCES public.estimates(id) ON DELETE CASCADE,
  service_id UUID REFERENCES public.services(id),
  
  -- Dados do serviço no momento do orçamento
  service_name TEXT NOT NULL,
  service_type TEXT,
  unit TEXT,
  
  -- Quantidades
  quantity DECIMAL(10,2) NOT NULL,
  
  -- Preços
  price_per_unit DECIMAL(10,2) NOT NULL,
  total_price DECIMAL(10,2) NOT NULL,
  
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Histórico de alterações de preços
CREATE TABLE IF NOT EXISTS public.price_histories (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  table_name TEXT NOT NULL, -- materials, edgebands, services
  record_id UUID NOT NULL,
  old_price DECIMAL(10,2),
  new_price DECIMAL(10,2) NOT NULL,
  changed_by UUID REFERENCES auth.users(id),
  reason TEXT,
  created_at TIMESTAMPTZ DEFAULT now()
);

-- Triggers para atualizar updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = now();
    RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_suppliers_updated_at BEFORE UPDATE ON public.suppliers
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_materials_updated_at BEFORE UPDATE ON public.materials
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_edgebands_updated_at BEFORE UPDATE ON public.edgebands
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_services_updated_at BEFORE UPDATE ON public.services
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

CREATE TRIGGER update_estimates_updated_at BEFORE UPDATE ON public.estimates
    FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();

-- Índices para performance
CREATE INDEX idx_estimates_user_id ON public.estimates(user_id);
CREATE INDEX idx_estimates_status ON public.estimates(status);
CREATE INDEX idx_estimate_materials_estimate_id ON public.estimate_materials(estimate_id);
CREATE INDEX idx_estimate_edgebands_estimate_id ON public.estimate_edgebands(estimate_id);
CREATE INDEX idx_estimate_services_estimate_id ON public.estimate_services(estimate_id);
CREATE INDEX idx_materials_active ON public.materials(is_active);
CREATE INDEX idx_edgebands_active ON public.edgebands(is_active);
CREATE INDEX idx_services_active ON public.services(is_active);

-- RLS Policies

-- Suppliers
ALTER TABLE public.suppliers ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver fornecedores ativos"
  ON public.suppliers FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar fornecedores"
  ON public.suppliers FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Materials
ALTER TABLE public.materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver materiais ativos"
  ON public.materials FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar materiais"
  ON public.materials FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Edgebands
ALTER TABLE public.edgebands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver bordas ativas"
  ON public.edgebands FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar bordas"
  ON public.edgebands FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Services
ALTER TABLE public.services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Todos podem ver serviços ativos"
  ON public.services FOR SELECT
  USING (is_active = true);

CREATE POLICY "Admins podem gerenciar serviços"
  ON public.services FOR ALL
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Estimates
ALTER TABLE public.estimates ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver seus próprios orçamentos"
  ON public.estimates FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem criar orçamentos"
  ON public.estimates FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem atualizar seus próprios orçamentos"
  ON public.estimates FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Admins podem ver todos os orçamentos"
  ON public.estimates FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Estimate Materials
ALTER TABLE public.estimate_materials ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver materiais de seus orçamentos"
  ON public.estimate_materials FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir materiais em seus orçamentos"
  ON public.estimate_materials FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

-- Estimate Edgebands
ALTER TABLE public.estimate_edgebands ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver bordas de seus orçamentos"
  ON public.estimate_edgebands FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir bordas em seus orçamentos"
  ON public.estimate_edgebands FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

-- Estimate Services
ALTER TABLE public.estimate_services ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Usuários podem ver serviços de seus orçamentos"
  ON public.estimate_services FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

CREATE POLICY "Usuários podem inserir serviços em seus orçamentos"
  ON public.estimate_services FOR INSERT
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.estimates
      WHERE id = estimate_id AND user_id = auth.uid()
    )
  );

-- Price Histories
ALTER TABLE public.price_histories ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Admins podem ver histórico de preços"
  ON public.price_histories FOR SELECT
  USING (
    EXISTS (
      SELECT 1 FROM public.profiles
      WHERE id = auth.uid() AND role = 'admin'
    )
  );

-- Inserir dados iniciais (exemplos)
INSERT INTO public.suppliers (name, contact_email, is_active) VALUES
  ('Fornecedor Local MDF', 'contato@fornecedor1.com', true),
  ('Distribuidora Premium', 'vendas@premium.com', true)
ON CONFLICT DO NOTHING;

INSERT INTO public.materials (name, type, thickness_mm, width_mm, height_mm, color, finish, price_per_sqm, yield_factor, is_active)
VALUES
  ('MDF Branco 15mm', 'MDF', 15, 2750, 1850, 'Branco', 'Revestido BP', 45.00, 0.85, true),
  ('MDF Branco 18mm', 'MDF', 18, 2750, 1850, 'Branco', 'Revestido BP', 52.00, 0.85, true),
  ('MDF Amadeirado 15mm', 'MDF', 15, 2750, 1850, 'Carvalho', 'Revestido BP', 55.00, 0.85, true),
  ('MDP Branco 15mm', 'MDP', 15, 2750, 1850, 'Branco', 'Revestido BP', 38.00, 0.88, true),
  ('MDP Branco 18mm', 'MDP', 18, 2750, 1850, 'Branco', 'Revestido BP', 43.00, 0.88, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.edgebands (name, thickness_mm, width_mm, color, material, price_per_meter, is_active)
VALUES
  ('Fita PVC Branco 0.45mm', 0.45, 22, 'Branco', 'PVC', 1.80, true),
  ('Fita PVC Branco 1mm', 1.00, 22, 'Branco', 'PVC', 2.50, true),
  ('Fita ABS Branco 1mm', 1.00, 22, 'Branco', 'ABS', 3.20, true),
  ('Fita PVC Amadeirado 0.45mm', 0.45, 22, 'Carvalho', 'PVC', 2.00, true)
ON CONFLICT DO NOTHING;

INSERT INTO public.services (name, type, unit, price_per_unit, description, is_active)
VALUES
  ('Corte Reto', 'corte', 'corte', 0.80, 'Corte reto em serra esquadrejadeira', true),
  ('Furação Simples', 'furacao', 'furo', 0.50, 'Furação com furadeira horizontal', true),
  ('Aplicação de Borda', 'usinagem', 'metro', 1.50, 'Aplicação de fita de borda com coladeira', true),
  ('Montagem por Peça', 'montagem', 'peça', 3.00, 'Montagem e acabamento final', true),
  ('Embalagem e Transporte', 'transporte', 'projeto', 80.00, 'Embalagem e entrega local', true)
ON CONFLICT DO NOTHING;