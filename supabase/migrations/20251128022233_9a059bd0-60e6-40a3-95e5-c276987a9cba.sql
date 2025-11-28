-- Criar tabela para histórico de renders IA
CREATE TABLE IF NOT EXISTS public.render_history (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL,
  prompt TEXT NOT NULL,
  style TEXT NOT NULL,
  output_image_url TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Habilitar Row Level Security
ALTER TABLE public.render_history ENABLE ROW LEVEL SECURITY;

-- Políticas de acesso
CREATE POLICY "Usuários podem criar seus próprios renders"
  ON public.render_history
  FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Usuários podem ver seus próprios renders"
  ON public.render_history
  FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Usuários podem deletar seus próprios renders"
  ON public.render_history
  FOR DELETE
  USING (auth.uid() = user_id);

-- Criar índice para melhor performance
CREATE INDEX idx_render_history_user_id ON public.render_history(user_id);
CREATE INDEX idx_render_history_created_at ON public.render_history(created_at DESC);