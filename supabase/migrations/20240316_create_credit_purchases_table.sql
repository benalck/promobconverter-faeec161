-- Tabela para armazenar histórico de compras de créditos
create table if not exists credit_purchases (
  id uuid default uuid_generate_v4() primary key,
  user_id uuid references profiles(id) not null,
  amount decimal not null,
  credits int not null,
  plan_id text not null,
  purchase_date timestamp with time zone not null,
  expiry_date timestamp with time zone not null,
  created_at timestamp with time zone default now() not null
);

-- Índices para consultas comuns
create index if not exists idx_credit_purchases_user_id on credit_purchases(user_id);
create index if not exists idx_credit_purchases_purchase_date on credit_purchases(purchase_date);

-- RLS policies
alter table credit_purchases enable row level security;

-- Usuários podem ver apenas suas próprias compras
create policy "Users can view their own purchases"
  on credit_purchases for select
  using (auth.uid() = user_id);

-- Apenas o serviço pode inserir
create policy "Service can insert purchases"
  on credit_purchases for insert
  with check (auth.role() = 'service_role'); 