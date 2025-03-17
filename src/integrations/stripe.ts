import { loadStripe } from '@stripe/stripe-js';

// Substitua pela sua chave pública do Stripe
const STRIPE_PUBLIC_KEY = 'pk_live_51OCvEHBOCcKhGyPv8oRNMQ7Te8QfxLqXi1SBP05Ynx0EkWP2Mvha2egC3EjaLrL7jsJFcvDteMw0vwwiiiQr0rD100pJ3I8oL1';

// Definir os tipos para metadata
interface StripeMetadata {
  userId?: string;
  userEmail?: string;
  type?: 'credits' | 'subscription';
  creditAmount?: string;
  planType?: string;
  [key: string]: string | undefined; // Permite propriedades adicionais
}

// Preços dos produtos no Stripe
export const STRIPE_PRICES = {
  CREDITS_10: 'price_1R36gvBOCcKhGyPvNKZuChNa',
  CREDITS_50: 'price_1R36hSBOCcKhGyPvLMBwTyDa',
  CREDITS_100: 'price_1R36hkBOCcKhGyPvVacz2duC',
  PLAN_MONTHLY: 'price_1R36jABOCcKhGyPvVGY0ntw3',
  PLAN_ANNUAL: 'price_1R36kfBOCcKhGyPvv5TlSLLs',
};

// Carrega a instância do Stripe
export const stripePromise = loadStripe(STRIPE_PUBLIC_KEY);

// Simular o checkout (para testes)
export const redirectToCheckout = async (
  priceId: string, 
  quantity: number = 1, 
  metadata: StripeMetadata = {}
) => {
  try {
    console.log('Iniciando checkout:', { priceId, quantity, metadata });
    
    // Tentar carregar o Stripe diretamente se disponível
    const stripe = await stripePromise;
    if (!stripe) {
      throw new Error('Não foi possível carregar o Stripe');
    }
    
    try {
      // URL da API a partir da variável de ambiente
      const apiUrl = `${import.meta.env.VITE_API_URL || ''}/api/create-checkout-session`;
      console.log('Usando URL da API:', apiUrl);
      
      // Fazer chamada para o backend para criar a sessão do Stripe
      const response = await fetch(apiUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          priceId,
          quantity,
          metadata,
        }),
        // Adicionar timeout para evitar espera infinita
        signal: AbortSignal.timeout(10000), // 10 segundos de timeout
      });
      
      // Verificar se a resposta é válida
      if (!response.ok) {
        let errorMessage = 'Erro ao criar sessão de checkout';
        try {
          const errorData = await response.json();
          errorMessage = errorData.message || errorMessage;
        } catch (jsonError) {
          // Se não conseguir parsear o JSON, use o texto da resposta
          errorMessage = await response.text() || errorMessage;
        }
        throw new Error(errorMessage);
      }
      
      // Tentar parsear a resposta com tratamento de erro
      let responseData;
      try {
        responseData = await response.json();
      } catch (jsonError) {
        console.error('Erro ao parsear resposta JSON:', jsonError);
        throw new Error('Resposta inválida do servidor');
      }
      
      if (!responseData || !responseData.url) {
        throw new Error('URL de checkout não encontrada na resposta');
      }
      
      // Redirecionar para a página de checkout do Stripe
      window.location.href = responseData.url;
      
    } catch (serverError) {
      console.error('Erro ao usar API do servidor, tentando checkout direto:', serverError);
      
      // Fallback: Criar sessão diretamente com o Stripe.js
      const { error } = await stripe.redirectToCheckout({
        lineItems: [{ price: priceId, quantity }],
        mode: metadata.type === 'subscription' ? 'subscription' : 'payment',
        successUrl: `${window.location.origin}/payment/success?session_id={CHECKOUT_SESSION_ID}`,
        cancelUrl: `${window.location.origin}/plans`,
        customerEmail: metadata.userEmail,
      });
      
      if (error) {
        console.error('Erro no checkout direto do Stripe:', error);
        throw new Error(error.message);
      }
    }
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    throw error;
  }
};

// Função para comprar créditos
export const buyCredits = async (
  userId: string, 
  userEmail: string, 
  amount: 10 | 50 | 100
) => {
  let priceId: string;
  
  switch (amount) {
    case 10:
      priceId = STRIPE_PRICES.CREDITS_10;
      break;
    case 50:
      priceId = STRIPE_PRICES.CREDITS_50;
      break;
    case 100:
      priceId = STRIPE_PRICES.CREDITS_100;
      break;
    default:
      throw new Error('Quantidade inválida');
  }
  
  return redirectToCheckout(
    priceId, 
    1, 
    { 
      userId, 
      userEmail, 
      type: 'credits',
      creditAmount: amount.toString(),
    }
  );
};

// Função para comprar planos
export const buyPlan = async (
  userId: string, 
  userEmail: string, 
  planType: 'monthly' | 'annual'
) => {
  const priceId = planType === 'monthly' 
    ? STRIPE_PRICES.PLAN_MONTHLY 
    : STRIPE_PRICES.PLAN_ANNUAL;
  
  return redirectToCheckout(
    priceId, 
    1, 
    { 
      userId, 
      userEmail, 
      type: 'subscription',
      planType,
    }
  );
};