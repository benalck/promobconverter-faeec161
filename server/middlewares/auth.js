
const jwt = require('jsonwebtoken');
const storage = require('../config/storage');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Verificar token JWT
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Acesso negado. Token não fornecido.' });
  }

  try {
    // Verificar token
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Buscar usuário pelo ID
    const users = await storage.query('users', { id: decoded.userId });
    
    if (users.length === 0) {
      return res.status(401).json({ message: 'Usuário não encontrado' });
    }
    
    const user = users[0];
    
    // Verificar se o usuário está banido
    if (user.is_banned) {
      return res.status(403).json({ message: 'Sua conta foi banida. Entre em contato com o administrador.' });
    }
    
    // Anexar usuário à requisição
    req.user = user;
    
    next();
  } catch (error) {
    return res.status(401).json({ message: 'Token inválido ou expirado' });
  }
};

// Verificar se o usuário é administrador
const verifyAdmin = (req, res, next) => {
  if (req.user.role !== 'admin') {
    return res.status(403).json({ message: 'Acesso negado. Permissão de administrador necessária.' });
  }
  
  next();
};

module.exports = {
  verifyToken,
  verifyAdmin
};
