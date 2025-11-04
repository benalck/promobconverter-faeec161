-- Tabela para armazenar métricas do sistema
create table if not exists metrics (
  id uuid default uuid_generate_v4() primary key,
  name text not null,
  value numeric not null,
  tags jsonb not null default '{}',
  timestamp timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

-- Índices para consultas comuns
create index if not exists idx_metrics_name on metrics(name);
create index if not exists idx_metrics_timestamp on metrics(timestamp);
create index if not exists idx_metrics_tags on metrics using gin(tags);

-- RLS policies
alter table metrics enable row level security;

-- Apenas serviço pode inserir
create policy "Service can insert metrics"
  on metrics for insert
  with check (auth.role() = 'service_role');

-- Qualquer usuário autenticado pode ler
create policy "Authenticated users can read metrics"
  on metrics for select
  using (auth.role() = 'authenticated'); 