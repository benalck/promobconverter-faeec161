# Remoção da Funcionalidade de Créditos

Este documento contém instruções para remover completamente a funcionalidade de créditos do sistema.

## Alterações Implementadas

Realizamos as seguintes alterações para remover os créditos do sistema:

1. **Atualização do código frontend**: Modificamos o arquivo `src/contexts/auth/authHooks.ts` para definir 0 créditos ao criar um perfil novo.

2. **Remoção das funções e gatilhos de créditos**: Criamos um script SQL que:
   - Remove o gatilho que garantia créditos mínimos
   - Remove a função associada ao gatilho
   - Atualiza as funções de registro para não adicionar créditos
   - Define 0 créditos para todos os usuários existentes

## Como Executar o Script SQL

Para implementar esta alteração no banco de dados:

1. Acesse o [Supabase Studio](https://supabase.com/dashboard/)
2. Selecione o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo `supabase/migrations/20240331_remover_creditos.sql`
6. Clique em "Run" para executar

## Verificar a Implementação

Para confirmar que as alterações foram aplicadas corretamente:

```sql
-- Verificar se o gatilho foi removido
SELECT 
  trigger_name
FROM 
  information_schema.triggers
WHERE 
  trigger_schema = 'public'
  AND trigger_name = 'ensure_initial_credits_trigger';
-- Deve retornar 0 resultados

-- Verificar se todos os usuários têm 0 créditos
SELECT 
  id, name, email, credits 
FROM 
  public.profiles 
WHERE 
  credits > 0;
-- Deve retornar 0 resultados
```

## Interfaces de Usuário Afetadas

Se houver interfaces de usuário mostrando informações sobre créditos, você pode querer ocultá-las também:

1. Verificar qualquer componente que exibe o saldo de créditos
2. Remover ou ocultar essas informações na interface
3. Remover quaisquer funcionalidades relacionadas à compra ou uso de créditos

## Consequências da Remoção

- Nenhum usuário terá créditos no sistema
- O sistema não atribuirá créditos a novos usuários
- Qualquer funcionalidade que dependia de créditos precisará ser revisada ou removida

Se no futuro você decidir reativar a funcionalidade de créditos, será necessário restaurar os gatilhos e funções, além de atualizar o código frontend. 