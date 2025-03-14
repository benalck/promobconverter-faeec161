
const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const { testConnection } = require('./config/database');
const { initDatabase } = require('./config/init-db');
const { initializeMySQLDatabase } = require('./script/init-mysql');
require('dotenv').config();

// Importar rotas
const authRoutes = require('./routes/authRoutes');
const userRoutes = require('./routes/userRoutes');
const converterRoutes = require('./routes/converterRoutes');
const creditRoutes = require('./routes/creditRoutes');

// Inicializar express
const app = express();
const port = process.env.PORT || 5000;

// Middlewares
app.use(cors());
app.use(bodyParser.json({ limit: '10mb' }));
app.use(bodyParser.urlencoded({ limit: '10mb', extended: true }));

// Configurar rotas
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/converter', converterRoutes);
app.use('/api/credits', creditRoutes);

// Rota básica para verificar se o servidor está funcionando
app.get('/', (req, res) => {
  res.send('API do Conversor XML funcionando!');
});

// Iniciar servidor
async function startServer() {
  try {
    // Inicializar o banco de dados MySQL (criar se não existir)
    await initializeMySQLDatabase();
    
    // Testar conexão com banco de dados
    const isConnected = await testConnection();
    
    if (isConnected) {
      // Inicializar esquema do banco de dados (tabelas)
      await initDatabase();
      
      // Iniciar servidor
      app.listen(port, () => {
        console.log(`Servidor rodando na porta ${port}`);
      });
    } else {
      console.error('Não foi possível iniciar o servidor devido a falha na conexão com o banco de dados');
    }
  } catch (error) {
    console.error('Erro ao iniciar o servidor:', error);
  }
}

startServer();
