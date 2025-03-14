
const storage = require('../config/storage');
const bcrypt = require('bcrypt');

// Obter todos os usuários
const getAllUsers = async (req, res) => {
  try {
    const users = await storage.query('users');
    
    // Formatar dados para o formato esperado pelo frontend (sem senhas)
    const formattedUsers = users.map(user => ({
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      isBanned: user.is_banned,
      credits: user.credits
    }));

    res.status(200).json(formattedUsers);
  } catch (error) {
    console.error('Erro ao obter usuários:', error);
    res.status(500).json({ message: 'Erro no servidor ao buscar usuários' });
  }
};

// Banir um usuário
const banUser = async (req, res) => {
  const { userId } = req.params;
  const adminId = req.user.id;

  // Impedir que um administrador se bana
  if (userId === adminId) {
    return res.status(400).json({ message: 'Não é possível banir o próprio usuário' });
  }

  try {
    // Verificar se o usuário existe
    const users = await storage.query('users', { id: userId });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Banir o usuário
    const updatedUser = await storage.update('users', userId, { is_banned: true });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado após atualização' });
    }
    
    // Formatar para o padrão do frontend
    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login,
      isBanned: updatedUser.is_banned,
      credits: updatedUser.credits
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Erro ao banir usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao banir usuário' });
  }
};

// Desbanir um usuário
const unbanUser = async (req, res) => {
  const { userId } = req.params;

  try {
    // Verificar se o usuário existe
    const users = await storage.query('users', { id: userId });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Desbanir o usuário
    const updatedUser = await storage.update('users', userId, { is_banned: false });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado após atualização' });
    }
    
    // Formatar para o padrão do frontend
    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login,
      isBanned: updatedUser.is_banned,
      credits: updatedUser.credits
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Erro ao desbanir usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao desbanir usuário' });
  }
};

// Atualizar um usuário
const updateUser = async (req, res) => {
  const { userId } = req.params;
  const updates = req.body;

  // Validar entrada
  if (Object.keys(updates).length === 0) {
    return res.status(400).json({ message: 'Nenhum dado fornecido para atualização' });
  }

  // Garantir que não estamos alterando campos sensíveis
  const allowedUpdates = ['name', 'role', 'credits', 'is_banned'];
  const validUpdates = {};

  for (const key in updates) {
    if (allowedUpdates.includes(key)) {
      validUpdates[key] = updates[key];
    }
  }

  try {
    // Verificar se o usuário existe
    const users = await storage.query('users', { id: userId });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    // Executar a atualização se houver campos válidos
    if (Object.keys(validUpdates).length > 0) {
      const updatedUser = await storage.update('users', userId, validUpdates);
      
      if (!updatedUser) {
        return res.status(404).json({ message: 'Usuário não encontrado após atualização' });
      }
      
      // Formatar para o padrão do frontend
      const userResponse = {
        id: updatedUser.id,
        name: updatedUser.name,
        email: updatedUser.email,
        role: updatedUser.role,
        createdAt: updatedUser.created_at,
        lastLogin: updatedUser.last_login,
        isBanned: updatedUser.is_banned,
        credits: updatedUser.credits
      };

      res.status(200).json(userResponse);
    } else {
      res.status(400).json({ message: 'Nenhum campo válido para atualização' });
    }
  } catch (error) {
    console.error('Erro ao atualizar usuário:', error);
    res.status(500).json({ message: 'Erro no servidor ao atualizar usuário' });
  }
};

// Adicionar créditos a um usuário
const addCredits = async (req, res) => {
  const { userId } = req.params;
  const { amount } = req.body;

  // Validar entrada
  if (!amount || isNaN(amount) || amount <= 0) {
    return res.status(400).json({ message: 'Quantidade de créditos inválida' });
  }

  try {
    // Verificar se o usuário existe
    const users = await storage.query('users', { id: userId });

    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }

    const user = users[0];
    const newCredits = user.credits + parseInt(amount, 10);

    // Adicionar créditos
    const updatedUser = await storage.update('users', userId, { credits: newCredits });
    
    if (!updatedUser) {
      return res.status(404).json({ message: 'Usuário não encontrado após atualização' });
    }
    
    // Formatar para o padrão do frontend
    const userResponse = {
      id: updatedUser.id,
      name: updatedUser.name,
      email: updatedUser.email,
      role: updatedUser.role,
      createdAt: updatedUser.created_at,
      lastLogin: updatedUser.last_login,
      isBanned: updatedUser.is_banned,
      credits: updatedUser.credits
    };

    res.status(200).json(userResponse);
  } catch (error) {
    console.error('Erro ao adicionar créditos:', error);
    res.status(500).json({ message: 'Erro no servidor ao adicionar créditos' });
  }
};

module.exports = {
  getAllUsers,
  banUser,
  unbanUser,
  updateUser,
  addCredits
};
