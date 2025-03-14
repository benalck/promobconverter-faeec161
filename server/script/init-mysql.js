
const mysql = require('mysql2/promise');
require('dotenv').config();

async function initializeMySQLDatabase() {
  console.log('Iniciando configuração do banco de dados MySQL...');
  
  // Primeiro, conectar sem especificar um banco de dados para criá-lo se não existir
  const connection = await mysql.createConnection({
    host: process.env.DB_HOST || 'localhost',
    user: process.env.DB_USER || 'root',
    password: process.env.DB_PASSWORD || '',
    port: process.env.DB_PORT || 3306
  });
  
  try {
    // Criar o banco de dados se não existir
    await connection.query(`CREATE DATABASE IF NOT EXISTS ${process.env.DB_NAME || 'conversor_xml'}`);
    console.log(`Banco de dados '${process.env.DB_NAME || 'conversor_xml'}' verificado/criado com sucesso!`);
    
    // Fechar a conexão inicial
    await connection.end();
    
    console.log('Banco de dados MySQL configurado com sucesso!');
    return true;
  } catch (error) {
    console.error('Erro ao configurar o banco de dados MySQL:', error);
    await connection.end();
    return false;
  }
}

// Se executado diretamente
if (require.main === module) {
  initializeMySQLDatabase()
    .then(success => {
      if (success) {
        console.log('Script de inicialização do MySQL executado com sucesso!');
        process.exit(0);
      } else {
        console.error('Falha ao executar script de inicialização do MySQL!');
        process.exit(1);
      }
    });
}

module.exports = { initializeMySQLDatabase };
