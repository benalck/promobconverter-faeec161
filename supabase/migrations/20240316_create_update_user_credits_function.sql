-- Função para atualizar créditos do usuário de forma atômica
create or replace function update_user_credits(
  p_user_id uuid,
  p_credits_to_add int,
  p_amount decimal,
  p_plan_id text
)
returns void
language plpgsql
security definer
as $$
begin
  -- Atualizar créditos do usuário
  update profiles
  set credits = coalesce(credits, 0) + p_credits_to_add
  where id = p_user_id;

  -- Registrar a compra
  insert into credit_purchases (
    user_id,
    amount,
    credits,
    plan_id,
    purchase_date,
    expiry_date
  ) values (
    p_user_id,
    p_amount,
    p_credits_to_add,
    p_plan_id,
    now(),
    now() + interval '1 year'
  );

  -- Se alguma das operações falhar, toda a transação será revertida
end;
$$; 