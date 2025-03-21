# Implementação de Créditos Iniciais Para Novos Usuários

Este documento contém as instruções para configurar o sistema para que cada novo usuário receba automaticamente 10 créditos ao se cadastrar.

## Alterações Implementadas

Realizamos três alterações complementares para garantir que a funcionalidade funcione de forma consistente:

1. **Alteração no código frontend**: Modificamos o arquivo `src/contexts/auth/authHooks.ts` para definir 10 créditos iniciais ao criar um perfil de usuário.

2. **Atualização das funções RPC**: Atualizamos as funções SQL `register_user` e `register_user_verified` para incluir 10 créditos iniciais.

3. **Gatilho de segurança**: Criamos um gatilho no banco de dados que garante que nenhum usuário seja criado com menos de 10 créditos.

## Como Executar o Script SQL

Para implementar esta funcionalidade no banco de dados:

1. Acesse o [Supabase Studio](https://supabase.com/dashboard/)
2. Selecione o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `supabase/migrations/20240330_creditos_cadastro.sql`
6. Clique em "Run" para executar

## Verificar a Implementação

Para confirmar que as alterações foram aplicadas corretamente:

1. Execute a consulta SQL abaixo para verificar as funções e gatilhos:

```sql
-- Verificar funções
SELECT 
  routine_name
FROM 
  information_schema.routines
WHERE 
  routine_type = 'FUNCTION'
  AND routine_schema = 'public'
  AND (routine_name = 'register_user' 
       OR routine_name = 'register_user_verified'
       OR routine_name = 'ensure_initial_credits');

-- Verificar gatilho
SELECT 
  trigger_name
FROM 
  information_schema.triggers
WHERE 
  trigger_schema = 'public'
  AND trigger_name = 'ensure_initial_credits_trigger';
```

2. Teste o cadastro de um novo usuário e verifique se ele recebe 10 créditos iniciais:

```sql
-- Consultar créditos de usuários recentes
SELECT 
  name, email, credits, created_at
FROM 
  public.profiles
ORDER BY 
  created_at DESC
LIMIT 5;
```

## Atribuição de Créditos para Usuários Existentes

Se você deseja atribuir 10 créditos para todos os usuários existentes que possuem menos de 10 créditos:

```sql
-- Atualizar usuários existentes que tenham menos de 10 créditos
UPDATE 
  public.profiles
SET 
  credits = 10
WHERE 
  credits < 10;

-- Registrar nos logs
INSERT INTO public.debug_logs (message)
VALUES ('Atualizado saldo de créditos para mínimo de 10 para todos usuários existentes.');
```

## Observações Importantes

- Todos os novos usuários agora receberão 10 créditos automaticamente no cadastro
- O sistema aplica esta regra em várias camadas para garantir consistência
- Caso você altere os requisitos para mais ou menos créditos iniciais, lembre-se de atualizar todos os pontos mencionados 