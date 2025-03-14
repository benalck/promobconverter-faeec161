
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conversor_xml',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0
});

// Testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados:', error);
    return false;
  }
}

module.exports = {
  pool,
  testConnection
};
