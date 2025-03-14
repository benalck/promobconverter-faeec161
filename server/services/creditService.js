
const { query } = require('../config/database');

// Verificar se o usuário tem créditos suficientes
const checkUserCredits = async (userId) => {
  try {
    const [user] = await query(
      'SELECT credits FROM users WHERE id = ?',
      [userId]
    );
    
    if (!user) {
      throw new Error('Usuário não encontrado');
    }
    
    return {
      userId,
      credits: user.credits,
      hasCredits: user.credits > 0
    };
  } catch (error) {
    console.error('Erro ao verificar créditos do usuário:', error);
    throw new Error('Falha ao verificar créditos');
  }
};

// Usar crédito (descontar 1)
const useCredit = async (userId) => {
  try {
    // Verificar se o usuário tem créditos
    const creditCheck = await checkUserCredits(userId);
    
    if (!creditCheck.hasCredits) {
      throw new Error('Créditos insuficientes');
    }
    
    // Descontar um crédito
    await query(
      'UPDATE users SET credits = credits - 1 WHERE id = ? AND credits > 0',
      [userId]
    );
    
    const [user] = await query(
      'SELECT credits FROM users WHERE id = ?',
      [userId]
    );
    
    return {
      userId,
      credits: user.credits,
      success: true
    };
  } catch (error) {
    console.error('Erro ao usar crédito:', error);
    throw error;
  }
};

// Adicionar créditos a um usuário
const addCredits = async (userId, amount) => {
  try {
    if (!amount || amount <= 0) {
      throw new Error('Quantidade de créditos inválida');
    }
    
    await query(
      'UPDATE users SET credits = credits + ? WHERE id = ?',
      [amount, userId]
    );
    
    const [user] = await query(
      'SELECT credits FROM users WHERE id = ?',
      [userId]
    );
    
    return {
      userId,
      credits: user.credits,
      added: amount,
      success: true
    };
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    throw new Error('Falha ao adicionar créditos');
  }
};

module.exports = {
  checkUserCredits,
  useCredit,
  addCredits
};
