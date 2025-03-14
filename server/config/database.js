
const mysql = require('mysql2/promise');
require('dotenv').config();

// Configuração do banco de dados
const pool = mysql.createPool({
  host: process.env.DB_HOST || 'localhost',
  user: process.env.DB_USER || 'root',
  password: process.env.DB_PASSWORD || '',
  database: process.env.DB_NAME || 'conversor_xml',
  port: process.env.DB_PORT || 3306,
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  timezone: '+00:00',
  charset: 'utf8mb4'
});

// Testar conexão
async function testConnection() {
  try {
    const connection = await pool.getConnection();
    console.log('Conexão com o banco de dados MySQL estabelecida com sucesso!');
    connection.release();
    return true;
  } catch (error) {
    console.error('Erro ao conectar ao banco de dados MySQL:', error);
    return false;
  }
}

// Executar consulta com tratamento de erro
async function query(sql, params = []) {
  try {
    const [results] = await pool.execute(sql, params);
    return results;
  } catch (error) {
    console.error('Erro ao executar consulta SQL:', error);
    throw error;
  }
}

// Inicializar esquema do banco de dados (tabelas)
async function initializeSchema() {
  try {
    console.log('Inicializando esquema do banco de dados...');
    
    // Criar tabela de usuários se não existir
    await query(`
      CREATE TABLE IF NOT EXISTS users (
        id VARCHAR(36) PRIMARY KEY,
        name VARCHAR(100) NOT NULL,
        email VARCHAR(100) UNIQUE NOT NULL,
        password VARCHAR(255) NOT NULL,
        role ENUM('admin', 'user') DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        last_login TIMESTAMP NULL,
        is_banned BOOLEAN DEFAULT FALSE,
        credits INT DEFAULT 3,
        email_verified BOOLEAN DEFAULT FALSE
      )
    `);
    
    // Criar tabela de tokens de reset de senha
    await query(`
      CREATE TABLE IF NOT EXISTS password_reset_tokens (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Criar tabela de sessões
    await query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Criar tabela de verificação de email
    await query(`
      CREATE TABLE IF NOT EXISTS email_verification (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        token VARCHAR(100) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    // Criar tabela para histórico de conversões
    await query(`
      CREATE TABLE IF NOT EXISTS conversions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        original_filename VARCHAR(255),
        converted_filename VARCHAR(255),
        conversion_type VARCHAR(50) DEFAULT 'xml_to_excel',
        file_content LONGTEXT,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);
    
    console.log('Esquema do banco de dados inicializado com sucesso!');
    
    // Verificar se existe um administrador padrão
    const adminCheck = await query('SELECT * FROM users WHERE role = ?', ['admin']);
    if (adminCheck.length === 0) {
      console.log('Criando administrador padrão...');
      
      // Gerar ID
      const { v4: uuidv4 } = require('uuid');
      const adminId = uuidv4();
      
      // Hash para 'admin123'
      const bcrypt = require('bcrypt');
      const adminHash = await bcrypt.hash('admin123', 10);
      
      // Inserir administrador padrão
      await query(
        'INSERT INTO users (id, name, email, password, role, email_verified) VALUES (?, ?, ?, ?, ?, ?)',
        [adminId, 'Administrador', 'admin@sistema.com', adminHash, 'admin', true]
      );
      
      console.log('Administrador padrão criado com sucesso!');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar esquema do banco de dados:', error);
    return false;
  }
}

module.exports = {
  pool,
  query,
  testConnection,
  initializeSchema
};
