const express = require('express');
const router = express.Router();
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
const { createClient } = require('@supabase/supabase-js');

// Função de logging
function logInfo(message, data = {}) {
  const timestamp = new Date().toISOString();
  console.log(JSON.stringify({
    timestamp,
    level: 'info',
    message,
    ...data
  }));
}

function logError(message, error, data = {}) {
  const timestamp = new Date().toISOString();
  console.error(JSON.stringify({
    timestamp,
    level: 'error',
    message,
    error: error.message,
    stack: error.stack,
    ...data
  }));
}

// Configurações e constantes
const CREDIT_PLANS = {
  [process.env.STRIPE_PRICE_10_CREDITS]: 10,
  [process.env.STRIPE_PRICE_50_CREDITS]: 50,
  [process.env.STRIPE_PRICE_100_CREDITS]: 100
};

const SUBSCRIPTION_PLANS = {
  [process.env.STRIPE_PRICE_MONTHLY]: {
    type: 'monthly',
    credits: 200
  },
  [process.env.STRIPE_PRICE_ANNUAL]: {
    type: 'annual',
    credits: 250
  }
};

// Inicializar cliente Supabase
const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_SERVICE_KEY
);

// Função de retry para operações importantes
async function retryOperation(operation, maxRetries = 3) {
  for (let i = 0; i < maxRetries; i++) {
    try {
      return await operation();
    } catch (error) {
      if (i === maxRetries - 1) throw error;
      await new Promise(resolve => setTimeout(resolve, 1000 * Math.pow(2, i)));
      logError(`Tentativa ${i + 1} falhou, tentando novamente...`, error);
    }
  }
}

// Função para registrar métricas
async function trackMetric(metricName, value, tags = {}) {
  try {
    await supabase
      .from('metrics')
      .insert({
        name: metricName,
        value: value,
        tags: tags,
        timestamp: new Date().toISOString()
      });
    logInfo(`Métrica registrada: ${metricName}`, { value, tags });
  } catch (error) {
    logError('Erro ao registrar métrica', error, { metricName, value, tags });
  }
}

// Validações
function validateSession(session) {
  if (!session.client_reference_id) {
    throw new Error('client_reference_id não encontrado na sessão');
  }
  if (!session.amount_total) {
    throw new Error('amount_total não encontrado na sessão');
  }
  if (!session.mode) {
    throw new Error('mode não encontrado na sessão');
  }
}

// Endpoint para criar sessão de checkout
router.post('/create-checkout-session', express.json(), async (req, res) => {
  try {
    const { priceId, quantity = 1, metadata = {} } = req.body;
    
    logInfo('Recebida requisição para criar sessão de checkout', { 
      body: req.body,
      headers: req.headers
    });
    
    if (!priceId) {
      return res.status(400).json({ message: 'priceId é obrigatório' });
    }
    
    if (!metadata.userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }
    
    logInfo('Criando sessão de checkout', { priceId, quantity, metadata });
    
    // Criar a sessão de checkout
    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card', 'boleto', 'pix'],
      line_items: [
        {
          price: priceId,
          quantity,
        },
      ],
      mode: metadata.type === 'subscription' ? 'subscription' : 'payment',
      success_url: `${process.env.FRONTEND_URL}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${process.env.FRONTEND_URL}/plans`,
      client_reference_id: metadata.userId,
      customer_email: metadata.userEmail,
      metadata,
      locale: 'pt-BR', // Usar português do Brasil
      allow_promotion_codes: true,
      billing_address_collection: 'auto',
      payment_intent_data: metadata.type !== 'subscription' ? {
        metadata, // Passar os metadados para o PaymentIntent também
      } : undefined,
    });
    
    logInfo('Sessão de checkout criada', { sessionId: session.id, url: session.url });
    
    // Garantir que a resposta seja um JSON válido
    return res.status(200).json({ 
      url: session.url,
      sessionId: session.id
    });
  } catch (error) {
    logError('Erro ao criar sessão de checkout', error, { body: req.body });
    return res.status(500).json({ 
      message: 'Erro ao criar sessão de checkout', 
      error: error.message 
    });
  }
});

// Endpoint para webhooks do Stripe
router.post('/stripe', express.raw({type: 'application/json'}), async (req, res) => {
  const sig = req.headers['stripe-signature'];
  let event;

  try {
    event = stripe.webhooks.constructEvent(
      req.body,
      sig,
      process.env.STRIPE_WEBHOOK_SECRET
    );
    logInfo('Webhook recebido', { type: event.type });
  } catch (err) {
    logError('Erro na assinatura do webhook', err, { signature: sig });
    return res.status(400).send(`Webhook Error: ${err.message}`);
  }

  try {
    await handleStripeEvent(event);
    res.status(200).json({received: true});
  } catch (err) {
    logError('Erro ao processar evento', err, { eventType: event.type });
    res.status(500).json({error: err.message});
  }
});

// Função para processar diferentes tipos de eventos
async function handleStripeEvent(event) {
  console.log(`Processando evento: ${event.type}`);

  // Verificar idempotência
  const { data: existingEvent } = await supabase
    .from('processed_events')
    .select()
    .eq('event_id', event.id)
    .single();

  if (existingEvent) {
    console.log(`Evento ${event.id} já foi processado anteriormente`);
    return;
  }

  try {
    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object);
        break;
      case 'customer.subscription.created':
      case 'customer.subscription.updated':
        await handleSubscriptionChange(event.data.object);
        break;
      case 'invoice.paid':
        await handleInvoicePaid(event.data.object);
        break;
      default:
        console.log(`Evento não processado: ${event.type}`);
    }

    // Registrar evento processado
    await supabase
      .from('processed_events')
      .insert({
        event_id: event.id,
        type: event.type,
        processed_at: new Date().toISOString()
      });

  } catch (error) {
    console.error('Erro ao processar evento:', error);
    await trackMetric('webhook_error', 1, {
      event_type: event.type,
      error: error.message
    });
    throw error;
  }
}

// Processar checkout finalizado
async function handleCheckoutCompleted(session) {
  try {
    console.log('Checkout completado:', session);
    validateSession(session);

    const clientReferenceId = session.client_reference_id;
    
    const expandedSession = await stripe.checkout.sessions.retrieve(session.id, {
      expand: ['line_items']
    });
    
    const lineItems = expandedSession.line_items.data;
    
    if (session.mode === 'payment') {
      const priceId = lineItems[0].price.id;
      const creditsToAdd = CREDIT_PLANS[priceId] || 0;
      
      if (creditsToAdd > 0) {
        await retryOperation(async () => {
          // Atualizar créditos usando RPC para garantir atomicidade
          const { error } = await supabase.rpc('update_user_credits', {
            p_user_id: clientReferenceId,
            p_credits_to_add: creditsToAdd,
            p_amount: session.amount_total / 100,
            p_plan_id: priceId
          });
          
          if (error) throw error;

          await trackMetric('credits_added', creditsToAdd, {
            user_id: clientReferenceId,
            plan_id: priceId
          });
        });
      }
    }
  } catch (error) {
    console.error('Erro ao processar checkout:', error);
    throw error;
  }
}

// Processar alterações na assinatura
async function handleSubscriptionChange(subscription) {
  try {
    console.log('Assinatura alterada:', subscription);
    
    const customerId = subscription.customer;
    
    const { data: userData, error: userError } = await supabase
      .from('profiles')
      .select('id')
      .eq('stripe_customer_id', customerId)
      .single();
      
    if (userError) throw userError;
    
    const userId = userData.id;
    
    if (subscription.status === 'active' || subscription.status === 'trialing') {
      const priceId = subscription.items.data[0].price.id;
      const plan = SUBSCRIPTION_PLANS[priceId];
      
      if (!plan) {
        throw new Error(`Plano não encontrado para o priceId: ${priceId}`);
      }

      const periodEnd = new Date(subscription.current_period_end * 1000);
      
      await retryOperation(async () => {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            active_plan: plan.type,
            plan_expiry_date: periodEnd.toISOString(),
            credits: plan.credits
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;

        await trackMetric('subscription_activated', 1, {
          user_id: userId,
          plan_type: plan.type
        });
      });
      
      console.log(`Plano ${plan.type} ativado para o usuário ${userId} até ${periodEnd}`);
    } else if (subscription.status === 'canceled' || subscription.status === 'unpaid') {
      await retryOperation(async () => {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            active_plan: null,
            plan_expiry_date: null
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;

        await trackMetric('subscription_canceled', 1, {
          user_id: userId
        });
      });
      
      console.log(`Plano cancelado para o usuário ${userId}`);
    }
  } catch (error) {
    console.error('Erro ao processar alteração de assinatura:', error);
    throw error;
  }
}

// Processar faturas pagas
async function handleInvoicePaid(invoice) {
  try {
    if (invoice.subscription) {
      const subscription = await stripe.subscriptions.retrieve(invoice.subscription);
      const customerId = subscription.customer;
      
      const { data: userData, error: userError } = await supabase
        .from('profiles')
        .select('id, credits')
        .eq('stripe_customer_id', customerId)
        .single();
        
      if (userError) throw userError;
      
      const userId = userData.id;
      const currentCredits = userData.credits || 0;
      
      const priceId = subscription.items.data[0].price.id;
      const plan = SUBSCRIPTION_PLANS[priceId];
      
      if (!plan) {
        throw new Error(`Plano não encontrado para o priceId: ${priceId}`);
      }

      const periodEnd = new Date(subscription.current_period_end * 1000);
      
      await retryOperation(async () => {
        const { error: updateError } = await supabase
          .from('profiles')
          .update({
            credits: currentCredits + plan.credits,
            plan_expiry_date: periodEnd.toISOString()
          })
          .eq('id', userId);
          
        if (updateError) throw updateError;

        await trackMetric('subscription_renewed', 1, {
          user_id: userId,
          credits_added: plan.credits
        });
      });
      
      console.log(`Adicionados ${plan.credits} créditos para o usuário ${userId} na renovação`);
    }
  } catch (error) {
    console.error('Erro ao processar fatura paga:', error);
    throw error;
  }
}

module.exports = router;