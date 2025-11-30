-- Tabela de itens de estoque
create table public.inventory_items (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  category text not null,
  unit text not null default 'un',
  current_stock numeric not null default 0,
  min_stock numeric not null default 0,
  created_at timestamptz default now()
);

alter table public.inventory_items enable row level security;

create policy "Usuário gerencia apenas seu estoque"
  on public.inventory_items
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);

-- Tabela de templates de orçamento
create table public.budget_templates (
  id uuid primary key default gen_random_uuid(),
  user_id uuid not null references auth.users(id) on delete cascade,
  name text not null,
  header_title text,
  header_subtitle text,
  footer_text text,
  accent_color text default '#3b82f6',
  created_at timestamptz default now()
);

alter table public.budget_templates enable row level security;

create policy "Usuário gerencia seus templates"
  on public.budget_templates
  for all
  using (auth.uid() = user_id)
  with check (auth.uid() = user_id);