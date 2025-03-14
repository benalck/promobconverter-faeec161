
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const { v4: uuidv4 } = require('uuid');
const storage = require('../config/storage');
require('dotenv').config();

const JWT_SECRET = process.env.JWT_SECRET || 'sua_chave_secreta_aqui';

// Registrar um novo usuário
const register = async (req, res) => {
  const { name, email, password } = req.body;

  // Validar entrada
  if (!name || !email || !password) {
    return res.status(400).json({ message: 'Nome, email e senha são obrigatórios' });
  }

  try {
    // Verificar se o email já está em uso
    const existingUsers = await storage.query('users', { email });

    if (existingUsers.length > 0) {
      return res.status(400).json({ message: 'Este email já está em uso' });
    }

    // Criar hash da senha
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(password, saltRounds);
    const userId = uuidv4();

    // Inserir novo usuário
    await storage.insert('users', {
      id: userId,
      name, 
      email, 
      password: hashedPassword,
      role: 'user',
      created_at: new Date().toISOString(),
      last_login: null,
      is_banned: false,
      credits: 3,
      email_verified: false
    });

    res.status(201).json({ message: 'Usuário registrado com sucesso', email, name });
  } catch (error) {
    console.error('Erro no registro:', error);
    res.status(500).json({ message: 'Erro no servidor ao registrar usuário' });
  }
};

// Login de usuário
const login = async (req, res) => {
  const { email, password } = req.body;

  // Validar entrada
  if (!email || !password) {
    return res.status(400).json({ message: 'Email e senha são obrigatórios' });
  }

  try {
    // Buscar usuário pelo email
    const users = await storage.query('users', { email });

    if (users.length === 0) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    const user = users[0];

    // Verificar se o usuário está banido
    if (user.is_banned) {
      return res.status(403).json({ message: 'Sua conta foi banida. Entre em contato com o administrador.' });
    }

    // Comparar senha
    const isPasswordValid = await bcrypt.compare(password, user.password);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Email ou senha inválidos' });
    }

    // Atualizar último login
    await storage.update('users', user.id, { last_login: new Date().toISOString() });

    // Criar token JWT
    const token = jwt.sign(
      { userId: user.id, email: user.email, role: user.role },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    // Criar sessão
    const sessionId = uuidv4();
    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7); // 7 dias

    await storage.insert('sessions', {
      id: sessionId,
      user_id: user.id,
      expires_at: expiresAt.toISOString(),
      created_at: new Date().toISOString()
    });

    // Preparar resposta do usuário (sem senha)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      isBanned: user.is_banned,
      credits: user.credits
    };

    res.status(200).json({ 
      message: 'Login realizado com sucesso',
      user: userResponse,
      token 
    });
  } catch (error) {
    console.error('Erro no login:', error);
    res.status(500).json({ message: 'Erro no servidor ao fazer login' });
  }
};

// Logout de usuário
const logout = async (req, res) => {
  const { sessionId } = req.body;

  if (!sessionId) {
    return res.status(200).json({ message: 'Logout realizado' });
  }

  try {
    await storage.remove('sessions', sessionId);
    res.status(200).json({ message: 'Logout realizado com sucesso' });
  } catch (error) {
    console.error('Erro no logout:', error);
    res.status(500).json({ message: 'Erro no servidor ao fazer logout' });
  }
};

// Verificar sessão atual
const getCurrentUser = async (req, res) => {
  try {
    // O usuário já foi carregado pelo middleware de autenticação
    const user = req.user;
    
    // Preparar resposta do usuário (sem senha)
    const userResponse = {
      id: user.id,
      name: user.name,
      email: user.email,
      role: user.role,
      createdAt: user.created_at,
      lastLogin: user.last_login,
      isBanned: user.is_banned,
      credits: user.credits
    };

    res.status(200).json({ user: userResponse });
  } catch (error) {
    console.error('Erro ao obter usuário atual:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter usuário atual' });
  }
};

module.exports = {
  register,
  login,
  logout,
  getCurrentUser
};
