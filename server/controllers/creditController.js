
const { checkUserCredits, addCredits } = require('../services/creditService');

// Obter saldo de créditos do usuário
const getUserCredits = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const result = await checkUserCredits(userId);
    
    res.status(200).json({
      credits: result.credits
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
    
    const result = await addCredits(userId, parseInt(amount));
    
    res.status(200).json({
      userId,
      credits: result.credits,
      added: result.added,
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
