-- Create interior_render_history table
CREATE TABLE IF NOT EXISTS public.interior_render_history (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  input_image_url TEXT,
  output_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS
ALTER TABLE public.interior_render_history ENABLE ROW LEVEL SECURITY;

-- Create policies
CREATE POLICY "Users can insert their own interior renders"
  ON public.interior_render_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can view their own interior renders"
  ON public.interior_render_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own interior renders"
  ON public.interior_render_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Create indexes
CREATE INDEX idx_interior_render_history_user_id ON public.interior_render_history(user_id);
CREATE INDEX idx_interior_render_history_created_at ON public.interior_render_history(created_at DESC);