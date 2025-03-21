# Arquivos de Migração do Banco de Dados

Este diretório contém os scripts de migração do banco de dados para o Promob Converter. Cada arquivo representa uma etapa específica de configuração ou correção do banco de dados.

## Arquivos Principais

### 1. Estrutura Básica do Banco de Dados
- **20240316_create_metrics_table.sql**: Cria a tabela para armazenar métricas do sistema.
- **20240316_create_credit_purchases_table.sql**: Cria a tabela para gerenciar compras de crédito dos usuários.
- **20240316_create_processed_events_table.sql**: Cria a tabela para registro de eventos processados.
- **20240316_create_update_user_credits_function.sql**: Cria a função para atualizar créditos de usuários.
- **20240320000000_create_conversions_table.sql**: Cria a tabela para registrar conversões de arquivos e funções associadas.

### 2. Correções e Melhorias
- **20240324_solucao_definitiva_email.sql**: Implementa a solução definitiva para verificação de email, desativando a necessidade de confirmação por email.
- **20240326_fix_tipo_simplificado.sql**: Corrige a função `get_conversions_by_type()` para resolver o erro 42P13.
- **20240326_fix_unico_admin_corrigido.sql**: Script completo para o painel administrativo, incluindo todas as funções necessárias.
- **20240327_fix_registro.sql**: Corrige problemas de registro, garantindo que todos os usuários tenham email verificado automaticamente.

## Execução

Estes scripts devem ser executados na ordem cronológica (do mais antigo para o mais recente) para garantir a configuração correta do banco de dados.

Para aplicar as migrações, utilize o Supabase Studio ou execute os scripts diretamente no banco de dados PostgreSQL.

## Correção do Problema de Registro

Se os usuários estiverem enfrentando problemas no registro (botão "Registrando..." travado), execute o script **20240327_fix_registro.sql** no Supabase Studio. Este script:

1. Marca todos os usuários existentes como verificados
2. Recria a função de verificação automática
3. Garante que o trigger de verificação automática está ativo
4. Cria uma nova função RPC para registrar usuários já verificados

Para executar o script:

1. Acesse o Supabase Studio (https://supabase.com/dashboard/)
2. Vá para o projeto "Promob Converter"
3. Clique em "SQL Editor" no menu lateral
4. Crie uma nova consulta
5. Cole o conteúdo do arquivo **20240327_fix_registro.sql**
6. Execute a consulta

## Observações

- O script `20240326_fix_unico_admin_corrigido.sql` é um script abrangente que configura todas as funcionalidades do painel administrativo.
- O script `20240324_solucao_definitiva_email.sql` elimina a necessidade de verificação de email, marcando todos os usuários como verificados automaticamente. 