
const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

// Diretório de armazenamento
const dataDir = path.join(__dirname, '../data');
const usersFile = path.join(dataDir, 'users.json');
const conversionsFile = path.join(dataDir, 'conversions.json');
const sessionsFile = path.join(dataDir, 'sessions.json');

// Inicializar armazenamento
async function initStorage() {
  try {
    // Criar diretório de dados se não existir
    await fs.mkdir(dataDir, { recursive: true });
    
    // Verificar e criar arquivos se não existirem
    const files = [
      { path: usersFile, defaultContent: { users: [] } },
      { path: conversionsFile, defaultContent: { conversions: [] } },
      { path: sessionsFile, defaultContent: { sessions: [] } }
    ];
    
    for (const file of files) {
      try {
        await fs.access(file.path);
      } catch (err) {
        // Arquivo não existe, criar com conteúdo padrão
        await fs.writeFile(file.path, JSON.stringify(file.defaultContent, null, 2));
        console.log(`Arquivo ${file.path} criado`);
      }
    }
    
    console.log('Armazenamento local inicializado com sucesso!');
    
    // Verificar se existe um administrador padrão
    const data = await readData(usersFile);
    const adminExists = data.users.some(user => user.role === 'admin');
    
    if (!adminExists) {
      console.log('Criando administrador padrão...');
      
      const bcrypt = require('bcrypt');
      const adminHash = await bcrypt.hash('admin123', 10);
      
      // Adicionar administrador padrão
      data.users.push({
        id: uuidv4(),
        name: 'Administrador',
        email: 'admin@sistema.com',
        password: adminHash,
        role: 'admin',
        created_at: new Date().toISOString(),
        last_login: null,
        is_banned: false,
        credits: 100,
        email_verified: true
      });
      
      await writeData(usersFile, data);
      console.log('Administrador padrão criado com sucesso!');
    }
    
    return true;
  } catch (error) {
    console.error('Erro ao inicializar armazenamento:', error);
    return false;
  }
}

// Leitura de dados
async function readData(filePath) {
  try {
    const data = await fs.readFile(filePath, 'utf8');
    return JSON.parse(data);
  } catch (error) {
    console.error(`Erro ao ler arquivo ${filePath}:`, error);
    throw error;
  }
}

// Escrita de dados
async function writeData(filePath, data) {
  try {
    await fs.writeFile(filePath, JSON.stringify(data, null, 2));
    return true;
  } catch (error) {
    console.error(`Erro ao escrever no arquivo ${filePath}:`, error);
    throw error;
  }
}

// Função de consulta
async function query(collection, filter = null) {
  let filePath;
  let dataKey;
  
  switch (collection) {
    case 'users':
      filePath = usersFile;
      dataKey = 'users';
      break;
    case 'conversions':
      filePath = conversionsFile;
      dataKey = 'conversions';
      break;
    case 'sessions':
      filePath = sessionsFile;
      dataKey = 'sessions';
      break;
    default:
      throw new Error(`Coleção desconhecida: ${collection}`);
  }
  
  const data = await readData(filePath);
  const items = data[dataKey];
  
  if (!filter) {
    return items;
  }
  
  // Filtrar itens
  return items.filter(item => {
    for (const [key, value] of Object.entries(filter)) {
      if (item[key] !== value) {
        return false;
      }
    }
    return true;
  });
}

// Função de inserção
async function insert(collection, item) {
  let filePath;
  let dataKey;
  
  switch (collection) {
    case 'users':
      filePath = usersFile;
      dataKey = 'users';
      break;
    case 'conversions':
      filePath = conversionsFile;
      dataKey = 'conversions';
      break;
    case 'sessions':
      filePath = sessionsFile;
      dataKey = 'sessions';
      break;
    default:
      throw new Error(`Coleção desconhecida: ${collection}`);
  }
  
  const data = await readData(filePath);
  
  // Garantir que item tem ID
  if (!item.id) {
    item.id = uuidv4();
  }
  
  data[dataKey].push(item);
  await writeData(filePath, data);
  
  return item;
}

// Função de atualização
async function update(collection, id, updates) {
  let filePath;
  let dataKey;
  
  switch (collection) {
    case 'users':
      filePath = usersFile;
      dataKey = 'users';
      break;
    case 'conversions':
      filePath = conversionsFile;
      dataKey = 'conversions';
      break;
    case 'sessions':
      filePath = sessionsFile;
      dataKey = 'sessions';
      break;
    default:
      throw new Error(`Coleção desconhecida: ${collection}`);
  }
  
  const data = await readData(filePath);
  const index = data[dataKey].findIndex(item => item.id === id);
  
  if (index === -1) {
    return null;
  }
  
  // Atualizar o item
  data[dataKey][index] = { ...data[dataKey][index], ...updates };
  await writeData(filePath, data);
  
  return data[dataKey][index];
}

// Função de remoção
async function remove(collection, id) {
  let filePath;
  let dataKey;
  
  switch (collection) {
    case 'users':
      filePath = usersFile;
      dataKey = 'users';
      break;
    case 'conversions':
      filePath = conversionsFile;
      dataKey = 'conversions';
      break;
    case 'sessions':
      filePath = sessionsFile;
      dataKey = 'sessions';
      break;
    default:
      throw new Error(`Coleção desconhecida: ${collection}`);
  }
  
  const data = await readData(filePath);
  const index = data[dataKey].findIndex(item => item.id === id);
  
  if (index === -1) {
    return false;
  }
  
  // Remover o item
  data[dataKey].splice(index, 1);
  await writeData(filePath, data);
  
  return true;
}

module.exports = {
  initStorage,
  query,
  insert,
  update,
  remove
};
