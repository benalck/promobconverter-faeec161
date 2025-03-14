
const { testConnection, initializeSchema } = require('./database');

async function initDatabase() {
  try {
    // Testar conexão com o banco
    const isConnected = await testConnection();
    
    if (!isConnected) {
      console.error('Não foi possível conectar ao banco de dados. Verifique as configurações.');
      return false;
    }
    
    // Inicializar esquema do banco
    const schemaInitialized = await initializeSchema();
    
    if (!schemaInitialized) {
      console.error('Não foi possível inicializar o esquema do banco de dados.');
      return false;
    }
    
    console.log('Banco de dados inicializado com sucesso!');
    return true;
    
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
    return false;
  }
}

module.exports = { initDatabase };
