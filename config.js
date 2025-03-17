require('dotenv').config();

module.exports = {
  stripe: {
    secretKey: process.env.STRIPE_SECRET_KEY,
    webhookSecret: process.env.STRIPE_WEBHOOK_SECRET,
    prices: {
      credits: {
        '10': process.env.STRIPE_PRICE_10_CREDITS,
        '50': process.env.STRIPE_PRICE_50_CREDITS,
        '100': process.env.STRIPE_PRICE_100_CREDITS
      },
      subscriptions: {
        monthly: process.env.STRIPE_PRICE_MONTHLY,
        annual: process.env.STRIPE_PRICE_ANNUAL
      }
    }
  },
  supabase: {
    url: process.env.SUPABASE_URL,
    serviceKey: process.env.SUPABASE_SERVICE_KEY
  },
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development'
  },
  creditPlans: {
    [process.env.STRIPE_PRICE_10_CREDITS]: 10,
    [process.env.STRIPE_PRICE_50_CREDITS]: 50,
    [process.env.STRIPE_PRICE_100_CREDITS]: 100
  },
  subscriptionPlans: {
    [process.env.STRIPE_PRICE_MONTHLY]: {
      type: 'monthly',
      credits: 200
    },
    [process.env.STRIPE_PRICE_ANNUAL]: {
      type: 'annual',
      credits: 250
    }
  }
}; 