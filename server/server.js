
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');
const { initDatabase } = require('./config/init-db');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');

// Inicializar express
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json());

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);

// Rota básica para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do Conversor XML funcionando!');
});

// Iniciar servidor
async function startServer() {
  // Testar conexão com banco de dados
  const isConnected = await testConnection();
  
  if (isConnected) {
    // Inicializar banco de dados
    await initDatabase();
    
    // Iniciar servidor
    app.listen(port, () => {
      console.log(`Servidor rodando na porta ${port}`);
    });
  } else {
    console.error('Não foi possível iniciar o servidor devido a falha na conexão com o banco de dados');
  }
}

startServer();
