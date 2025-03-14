
const jwt = require('jsonwebtoken');
const { pool } = require('../config/database');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Middleware para verificar autenticação
const verifyToken = async (req, res, next) => {
  const token = req.headers.authorization?.split(' ')[1];
  
  if (!token) {
    return res.status(401).json({ message: 'Não autorizado: Token não fornecido' });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    
    // Verificar se o usuário existe e não está banido
    const [users] = await pool.query(
      'SELECT * FROM users WHERE id = ? AND is_banned = FALSE',
      [decoded.userId]
    );

    if (users.length === 0) {
      return res.status(401).json({ message: 'Não autorizado: Usuário não encontrado ou banido' });
    }

    // Adicionar o usuário ao objeto de requisição
    req.user = users[0];
    next();
  } catch (error) {
    console.error('Erro na autenticação:', error);
    return res.status(401).json({ message: 'Não autorizado: Token inválido' });
  }
};

// Middleware para verificar se é administrador
const verifyAdmin = (req, res, next) => {
  if (req.user && req.user.role === 'admin') {
    next();
  } else {
    res.status(403).json({ message: 'Acesso negado: Permissão de administrador necessária' });
  }
};

module.exports = {
  verifyToken,
  verifyAdmin
};
