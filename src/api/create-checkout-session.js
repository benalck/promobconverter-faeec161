// Este arquivo deve ser implementado no backend (servidor)
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

/**
 * Endpoint para criar uma sessão de checkout do Stripe
 * 
 * Exemplo de uso:
 * POST /api/create-checkout-session
 * {
 *   "priceId": "price_1R36gvBOCcKhGyPvNKZuChNa",
 *   "quantity": 1,
 *   "metadata": {
 *     "userId": "123",
 *     "userEmail": "user@example.com",
 *     "type": "credits",
 *     "creditAmount": "10"
 *   }
 * }
 */
exports.handler = async (req, res) => {
  try {
    const { priceId, quantity = 1, metadata = {} } = req.body;
    
    if (!priceId) {
      return res.status(400).json({ message: 'priceId é obrigatório' });
    }
    
    if (!metadata.userId) {
      return res.status(400).json({ message: 'userId é obrigatório' });
    }
    
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
      payment_intent_data: {
        metadata, // Passar os metadados para o PaymentIntent também
      },
    });
    
    return res.status(200).json({ url: session.url });
  } catch (error) {
    console.error('Erro ao criar sessão de checkout:', error);
    return res.status(500).json({ 
      message: 'Erro ao criar sessão de checkout', 
      error: error.message 
    });
  }
}; 