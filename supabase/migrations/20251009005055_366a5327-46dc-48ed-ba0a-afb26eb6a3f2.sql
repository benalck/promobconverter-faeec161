-- Create cutting_plans table
CREATE TABLE IF NOT EXISTS public.cutting_plans (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  sheet_width INTEGER NOT NULL DEFAULT 2750,
  sheet_height INTEGER NOT NULL DEFAULT 1850,
  sheet_thickness INTEGER NOT NULL DEFAULT 18,
  cut_margin INTEGER NOT NULL DEFAULT 3,
  grain_direction TEXT CHECK (grain_direction IN ('horizontal', 'vertical', 'none')) DEFAULT 'none',
  total_sheets INTEGER NOT NULL DEFAULT 0,
  utilization_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  total_area NUMERIC(10,2) NOT NULL DEFAULT 0,
  used_area NUMERIC(10,2) NOT NULL DEFAULT 0,
  waste_area NUMERIC(10,2) NOT NULL DEFAULT 0,
  status TEXT CHECK (status IN ('draft', 'processing', 'completed', 'error')) DEFAULT 'draft',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW(),
  updated_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cutting_items table
CREATE TABLE IF NOT EXISTS public.cutting_items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.cutting_plans(id) ON DELETE CASCADE,
  name TEXT NOT NULL,
  width INTEGER NOT NULL,
  height INTEGER NOT NULL,
  thickness INTEGER NOT NULL,
  quantity INTEGER NOT NULL DEFAULT 1,
  grain_direction TEXT CHECK (grain_direction IN ('horizontal', 'vertical', 'none')) DEFAULT 'none',
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cutting_sheets table (layout result)
CREATE TABLE IF NOT EXISTS public.cutting_sheets (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.cutting_plans(id) ON DELETE CASCADE,
  sheet_number INTEGER NOT NULL,
  layout_data JSONB NOT NULL, -- Store the placement of pieces
  utilization_percent NUMERIC(5,2) NOT NULL DEFAULT 0,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Create cutting_exports table
CREATE TABLE IF NOT EXISTS public.cutting_exports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  plan_id UUID NOT NULL REFERENCES public.cutting_plans(id) ON DELETE CASCADE,
  export_type TEXT CHECK (export_type IN ('pdf', 'excel', 'png')) NOT NULL,
  file_url TEXT,
  file_size INTEGER,
  created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.cutting_plans ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutting_items ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutting_sheets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cutting_exports ENABLE ROW LEVEL SECURITY;

-- RLS Policies for cutting_plans
CREATE POLICY "Users can view their own cutting plans"
  ON public.cutting_plans FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own cutting plans"
  ON public.cutting_plans FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own cutting plans"
  ON public.cutting_plans FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own cutting plans"
  ON public.cutting_plans FOR DELETE
  USING (auth.uid() = user_id);

-- RLS Policies for cutting_items
CREATE POLICY "Users can view items from their cutting plans"
  ON public.cutting_items FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_items.plan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create items for their cutting plans"
  ON public.cutting_items FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_items.plan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can update items from their cutting plans"
  ON public.cutting_items FOR UPDATE
  USING (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_items.plan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can delete items from their cutting plans"
  ON public.cutting_items FOR DELETE
  USING (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_items.plan_id AND user_id = auth.uid()
  ));

-- RLS Policies for cutting_sheets
CREATE POLICY "Users can view sheets from their cutting plans"
  ON public.cutting_sheets FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_sheets.plan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create sheets for their cutting plans"
  ON public.cutting_sheets FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_sheets.plan_id AND user_id = auth.uid()
  ));

-- RLS Policies for cutting_exports
CREATE POLICY "Users can view exports from their cutting plans"
  ON public.cutting_exports FOR SELECT
  USING (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_exports.plan_id AND user_id = auth.uid()
  ));

CREATE POLICY "Users can create exports for their cutting plans"
  ON public.cutting_exports FOR INSERT
  WITH CHECK (EXISTS (
    SELECT 1 FROM public.cutting_plans
    WHERE id = cutting_exports.plan_id AND user_id = auth.uid()
  ));

-- Indexes for performance
CREATE INDEX idx_cutting_plans_user_id ON public.cutting_plans(user_id);
CREATE INDEX idx_cutting_plans_status ON public.cutting_plans(status);
CREATE INDEX idx_cutting_items_plan_id ON public.cutting_items(plan_id);
CREATE INDEX idx_cutting_sheets_plan_id ON public.cutting_sheets(plan_id);
CREATE INDEX idx_cutting_exports_plan_id ON public.cutting_exports(plan_id);

-- Trigger for updated_at
CREATE OR REPLACE FUNCTION update_cutting_plans_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_update_cutting_plans_updated_at
  BEFORE UPDATE ON public.cutting_plans
  FOR EACH ROW
  EXECUTE FUNCTION update_cutting_plans_updated_at();