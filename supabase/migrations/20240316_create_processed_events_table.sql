-- Tabela para controle de eventos processados
create table if not exists processed_events (
  id uuid default uuid_generate_v4() primary key,
  event_id text not null unique,
  type text not null,
  processed_at timestamp with time zone not null default now(),
  created_at timestamp with time zone not null default now()
);

-- Índice para busca rápida por event_id
create index if not exists idx_processed_events_event_id on processed_events(event_id);

-- Índice para busca por tipo de evento
create index if not exists idx_processed_events_type on processed_events(type);

-- RLS policies
alter table processed_events enable row level security;

-- Apenas serviço pode inserir/ler
create policy "Service can manage processed_events"
  on processed_events
  using (auth.role() = 'service_role'); 