
import { localDB } from './localDatabase';
import { User } from '@/contexts/auth/types';

// Tabelas do banco de dados
const USERS_TABLE = 'users';
const SESSIONS_TABLE = 'sessions';

// Interface para sessão
interface Session {
  id: string;
  userId: string;
  expiresAt: number;
}

export interface AuthUser {
  id: string;
  name: string;
  email: string;
  password: string;  // Na vida real, isso seria hash+salt
  role: 'admin' | 'user';
  createdAt: string;
  lastLogin?: string;
  isBanned: boolean;
  credits: number;
  emailVerified: boolean;
}

// Inicializar as tabelas se não existirem
function initializeTables() {
  if (!localDB.tableExists(USERS_TABLE)) {
    localDB.saveTable<AuthUser>(USERS_TABLE, []);
  }
  
  if (!localDB.tableExists(SESSIONS_TABLE)) {
    localDB.saveTable<Session>(SESSIONS_TABLE, []);
  }

  // Criar admin default se não existir nenhum usuário
  const users = localDB.getTable<AuthUser>(USERS_TABLE);
  if (users.length === 0) {
    // Criar administrador padrão
    registerUser({
      name: 'Administrador',
      email: 'admin@sistema.com',
      password: 'admin123',
      role: 'admin',
    });
    console.log('Administrador padrão criado.');
  }
}

// Inicializar banco de dados
initializeTables();

// Converter AuthUser para User (formato usado na aplicação)
export function convertToAppUser(authUser: AuthUser): User {
  return {
    id: authUser.id,
    name: authUser.name,
    email: authUser.email,
    role: authUser.role,
    createdAt: authUser.createdAt,
    lastLogin: authUser.lastLogin,
    isBanned: authUser.isBanned,
    credits: authUser.credits,
  };
}

// Registrar um novo usuário
export function registerUser(userData: { 
  name: string; 
  email: string; 
  password: string;
  role?: 'admin' | 'user';
}): AuthUser {
  // Verificar se o e-mail já está em uso
  const existingUser = localDB.findBy<AuthUser>(USERS_TABLE, 'email', userData.email);
  if (existingUser.length > 0) {
    throw new Error('Este email já está em uso');
  }

  const now = new Date().toISOString();
  const isFirstUser = localDB.getTable<AuthUser>(USERS_TABLE).length === 0;
  
  // Criar novo usuário
  const newUser: AuthUser = {
    id: crypto.randomUUID(),
    name: userData.name,
    email: userData.email,
    password: userData.password, // Na vida real, seria hash+salt
    role: userData.role || (isFirstUser ? 'admin' : 'user'),
    createdAt: now,
    isBanned: false,
    credits: 3, // Créditos iniciais
    emailVerified: true, // Assumimos que está verificado por padrão no sistema local
  };

  return localDB.insert<AuthUser>(USERS_TABLE, newUser);
}

// Autenticar usuário
export function loginUser(email: string, password: string): User {
  const users = localDB.getTable<AuthUser>(USERS_TABLE);
  const user = users.find(u => u.email === email && u.password === password);
  
  if (!user) {
    throw new Error('Email ou senha inválidos');
  }

  if (user.isBanned) {
    throw new Error('Sua conta foi banida. Entre em contato com o administrador.');
  }

  // Atualizar último login
  const now = new Date().toISOString();
  localDB.update<AuthUser>(USERS_TABLE, user.id, { lastLogin: now });

  // Criar sessão
  const session: Session = {
    id: crypto.randomUUID(),
    userId: user.id,
    expiresAt: Date.now() + (7 * 24 * 60 * 60 * 1000), // 7 dias
  };
  
  localDB.insert<Session>(SESSIONS_TABLE, session);
  
  // Salvar sessão atual
  localStorage.setItem('currentSession', session.id);
  
  return convertToAppUser({...user, lastLogin: now});
}

// Verificar sessão atual
export function getCurrentUser(): User | null {
  const sessionId = localStorage.getItem('currentSession');
  if (!sessionId) return null;
  
  const sessions = localDB.getTable<Session>(SESSIONS_TABLE);
  const session = sessions.find(s => s.id === sessionId);
  
  if (!session || session.expiresAt < Date.now()) {
    localStorage.removeItem('currentSession');
    return null;
  }
  
  const user = localDB.findById<AuthUser>(USERS_TABLE, session.userId);
  if (!user || user.isBanned) return null;
  
  return convertToAppUser(user);
}

// Fazer logout
export function logoutUser(): void {
  const sessionId = localStorage.getItem('currentSession');
  if (sessionId) {
    localStorage.removeItem('currentSession');
    // Também poderíamos remover a sessão da tabela de sessões
  }
}

// Obter todos os usuários
export function getAllUsers(): User[] {
  const users = localDB.getTable<AuthUser>(USERS_TABLE);
  return users.map(convertToAppUser);
}

// Banir um usuário
export function banUser(userId: string): User | null {
  const user = localDB.update<AuthUser>(USERS_TABLE, userId, { isBanned: true });
  return user ? convertToAppUser(user) : null;
}

// Desbanir um usuário
export function unbanUser(userId: string): User | null {
  const user = localDB.update<AuthUser>(USERS_TABLE, userId, { isBanned: false });
  return user ? convertToAppUser(user) : null;
}

// Atualizar um usuário
export function updateUser(userId: string, updates: Partial<Omit<User, 'id'>>): User | null {
  const user = localDB.update<AuthUser>(USERS_TABLE, userId, updates as Partial<AuthUser>);
  return user ? convertToAppUser(user) : null;
}

// Adicionar créditos a um usuário
export function addCredits(userId: string, amount: number): User | null {
  const user = localDB.findById<AuthUser>(USERS_TABLE, userId);
  if (!user) return null;
  
  const updatedUser = localDB.update<AuthUser>(USERS_TABLE, userId, { 
    credits: user.credits + amount 
  });
  
  return updatedUser ? convertToAppUser(updatedUser) : null;
}
