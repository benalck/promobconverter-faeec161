
const { pool } = require('./database');

async function initDatabase() {
  try {
    // Criar tabela de usuários se não existir
    await pool.query(`
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
        email_verified BOOLEAN DEFAULT TRUE
      )
    `);

    // Criar tabela de sessões
    await pool.query(`
      CREATE TABLE IF NOT EXISTS sessions (
        id VARCHAR(36) PRIMARY KEY,
        user_id VARCHAR(36) NOT NULL,
        expires_at TIMESTAMP NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        FOREIGN KEY (user_id) REFERENCES users(id) ON DELETE CASCADE
      )
    `);

    // Verificar se existe um administrador padrão
    const [adminRows] = await pool.query('SELECT * FROM users');
    
    if (adminRows.length === 0) {
      // Hash para 'admin123'
      const adminHash = '$2b$10$uuS8LAUKTqIlPVYUhXhDQ.T6eS3kK86RpGABqV0s1GY5MjQxNDhmQ';
      
      // Criar administrador padrão
      await pool.query(`
        INSERT INTO users (id, name, email, password, role, email_verified) 
        VALUES (UUID(), 'Administrador', 'admin@sistema.com', ?, 'admin', TRUE)
      `, [adminHash]);
      
      console.log('Administrador padrão criado com sucesso!');
    }

    console.log('Banco de dados inicializado com sucesso!');
  } catch (error) {
    console.error('Erro ao inicializar banco de dados:', error);
  }
}

module.exports = { initDatabase };
