
const { query } = require('../config/database');

// Verificar créditos do usuário
const checkUserCredits = async (userId) => {
  try {
    const users = await query('SELECT credits FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    return { 
      credits: users[0].credits,
      userId
    };
  } catch (error) {
    console.error('Erro ao verificar créditos do usuário:', error);
    throw error;
  }
};

// Adicionar créditos a um usuário
const addCredits = async (userId, amount) => {
  try {
    // Verificar se o usuário existe
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    // Adicionar créditos
    await query('UPDATE users SET credits = credits + ? WHERE id = ?', [amount, userId]);
    
    // Obter saldo atualizado
    const updatedUsers = await query('SELECT credits FROM users WHERE id = ?', [userId]);
    
    return {
      userId,
      credits: updatedUsers[0].credits,
      added: amount
    };
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    throw error;
  }
};

// Consumir créditos do usuário
const consumeCredits = async (userId, amount = 1) => {
  try {
    // Verificar se o usuário existe e tem créditos suficientes
    const users = await query('SELECT * FROM users WHERE id = ?', [userId]);
    
    if (users.length === 0) {
      throw new Error('Usuário não encontrado');
    }
    
    const currentCredits = users[0].credits;
    
    if (currentCredits < amount) {
      throw new Error('Créditos insuficientes');
    }
    
    // Consumir créditos
    await query('UPDATE users SET credits = credits - ? WHERE id = ?', [amount, userId]);
    
    // Obter saldo atualizado
    const updatedUsers = await query('SELECT credits FROM users WHERE id = ?', [userId]);
    
    return {
      userId,
      credits: updatedUsers[0].credits,
      consumed: amount
    };
  } catch (error) {
    console.error('Erro ao consumir créditos:', error);
    throw error;
  }
};

module.exports = {
  checkUserCredits,
  addCredits,
  consumeCredits
};
