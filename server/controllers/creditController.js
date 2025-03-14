
const storage = require('../config/storage');

// Obter saldo de créditos do usuário
const getUserCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const users = await storage.query('users', { id: userId });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    res.status(200).json({
      credits: users[0].credits
    });
  } catch (error) {
    console.error('Erro ao obter créditos:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter créditos' });
  }
};

// Adicionar créditos (apenas admin pode fazer isso)
const addUserCredits = async (req, res) => {
  try {
    const { userId, amount } = req.body;
    
    if (!userId || !amount) {
      return res.status(400).json({ message: 'ID do usuário e quantidade de créditos são obrigatórios' });
    }
    
    // Verificar se a quantidade é válida
    if (isNaN(amount) || amount <= 0) {
      return res.status(400).json({ message: 'Quantidade de créditos inválida' });
    }
    
    // Verificar se o usuário existe
    const users = await storage.query('users', { id: userId });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = users[0];
    const newCredits = user.credits + parseInt(amount, 10);
    
    // Atualizar créditos do usuário
    await storage.update('users', userId, { credits: newCredits });
    
    res.status(200).json({
      userId,
      credits: newCredits,
      added: parseInt(amount, 10),
      message: 'Créditos adicionados com sucesso'
    });
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    res.status(500).json({ message: 'Erro no servidor ao adicionar créditos' });
  }
};

module.exports = {
  getUserCredits,
  addUserCredits
};
