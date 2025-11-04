// Teste de commit
const express = require('express');
const cors = require('cors');
const morgan = require('morgan');
const config = require('./config');
const webhookRouter = require('./webhook');

const app = express();

// Middleware para logging
app.use(morgan('dev'));

// Middleware para CORS - configuração mais permissiva para desenvolvimento
app.use(cors({
  origin: '*', // Permitir qualquer origem
  methods: ['GET', 'POST', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'stripe-signature', 'Authorization'],
  credentials: true
}));

// Middleware para lidar com requisições OPTIONS (preflight)
app.options('*', cors());

// Middleware para parsear JSON para todas as rotas exceto webhook do Stripe
app.use((req, res, next) => {
  if (req.originalUrl === '/webhook/stripe') {
    next();
  } else {
    express.json()(req, res, next);
  }
});

// Rotas
app.use('/webhook', webhookRouter);
app.use('/api', webhookRouter);

// Rota de healthcheck
app.get('/health', (req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

// Middleware de erro
app.use((err, req, res, next) => {
  console.error(err.stack);
  res.status(500).json({
    error: config.server.env === 'development' ? err.message : 'Erro interno do servidor'
  });
});

// Iniciar servidor
const port = config.server.port;
app.listen(port, () => {
  console.log(`Servidor rodando na porta ${port}`);
  console.log(`Ambiente: ${config.server.env}`);
}); 