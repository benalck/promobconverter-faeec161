const { createClient } = require('@supabase/supabase-js');
require('dotenv').config();

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

async function checkErrors() {
  const { data: metrics, error } = await supabase
    .from('metrics')
    .select('*')
    .eq('name', 'webhook_error')
    .gte('timestamp', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('timestamp', { ascending: false });

  if (error) {
    console.error('Erro ao buscar métricas:', error);
    return;
  }

  if (metrics.length > 0) {
    console.log('⚠️ Erros encontrados nas últimas 24 horas:');
    metrics.forEach(metric => {
      console.log(`
        Timestamp: ${metric.timestamp}
        Tipo de evento: ${metric.tags.event_type}
        Erro: ${metric.tags.error}
      `);
    });
  } else {
    console.log('✅ Nenhum erro encontrado nas últimas 24 horas');
  }
}

async function checkPayments() {
  const { data: purchases, error } = await supabase
    .from('credit_purchases')
    .select('*')
    .gte('purchase_date', new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString())
    .order('purchase_date', { ascending: false });

  if (error) {
    console.error('Erro ao buscar compras:', error);
    return;
  }

  console.log(`\n📊 Resumo de compras nas últimas 24 horas:
    Total de compras: ${purchases.length}
    Valor total: R$ ${purchases.reduce((acc, p) => acc + p.amount, 0).toFixed(2)}
    Créditos vendidos: ${purchases.reduce((acc, p) => acc + p.credits, 0)}
  `);
}

async function main() {
  await checkErrors();
  await checkPayments();
}

main().catch(console.error); 