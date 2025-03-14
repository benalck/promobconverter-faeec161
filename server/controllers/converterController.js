
const xml2js = require('xml2js');
const xlsx = require('xlsx');
const { v4: uuidv4 } = require('uuid');
const storage = require('../config/storage');

// Converter XML para Excel
const convertToExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xmlString, filename } = req.body;
    
    if (!xmlString) {
      return res.status(400).json({ message: 'String XML é obrigatória' });
    }
    
    // Verificar se o usuário tem créditos suficientes
    const users = await storage.query('users', { id: userId });
    
    if (users.length === 0) {
      return res.status(404).json({ message: 'Usuário não encontrado' });
    }
    
    const user = users[0];
    
    if (user.credits < 1) {
      return res.status(403).json({ 
        message: 'Créditos insuficientes para realizar a conversão',
        credits: user.credits
      });
    }
    
    // Consumir um crédito
    await storage.update('users', userId, { credits: user.credits - 1 });
    
    // Fazer o parsing do XML
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlString);
    
    // Criar um workbook do Excel
    const wb = xlsx.utils.book_new();
    
    // Processar cada seção do XML e criar worksheets
    for (const [key, value] of Object.entries(result)) {
      if (typeof value === 'object') {
        // Transformar o objeto em um array de objetos para criar a planilha
        let dataArray = [];
        
        if (Array.isArray(value)) {
          dataArray = value;
        } else {
          // Se não for um array, pode ser um objeto único
          const processedData = processObjectToArray(value);
          if (processedData.length > 0) {
            dataArray = processedData;
          }
        }
        
        if (dataArray.length > 0) {
          const ws = xlsx.utils.json_to_sheet(dataArray);
          xlsx.utils.book_append_sheet(wb, ws, key.substring(0, 30)); // Limitar nome da aba
        }
      }
    }
    
    // Gerar o arquivo Excel
    const excelBuffer = xlsx.write(wb, { type: 'buffer', bookType: 'xlsx' });
    
    // Gerar um nome para o arquivo convertido
    const originalFilename = filename || 'documento';
    const filenameWithoutExt = originalFilename.replace(/\.[^/.]+$/, "");
    const convertedFilename = `${filenameWithoutExt}_convertido.xlsx`;
    
    // Salvar o registro da conversão
    const conversionId = uuidv4();
    await storage.insert('conversions', {
      id: conversionId,
      user_id: userId,
      original_filename: originalFilename,
      converted_filename: convertedFilename,
      conversion_type: 'xml_to_excel',
      created_at: new Date().toISOString()
    });
    
    // Retornar o buffer e informações da conversão
    res.status(200).json({
      message: 'Conversão realizada com sucesso',
      conversionId,
      filename: convertedFilename,
      buffer: excelBuffer.toString('base64') // Enviar como base64 para o cliente
    });
  } catch (error) {
    console.error('Erro na conversão:', error);
    
    if (error.message === 'Créditos insuficientes') {
      return res.status(403).json({ message: error.message });
    }
    
    res.status(500).json({ message: 'Erro no servidor ao processar a conversão' });
  }
};

// Função auxiliar para processar objetos complexos
function processObjectToArray(obj) {
  if (!obj) return [];
  
  // Se já é um array, retornar
  if (Array.isArray(obj)) return obj;
  
  // Caso comum em XML: objeto com propriedades e uma propriedade que contém um array de itens
  for (const [key, value] of Object.entries(obj)) {
    if (Array.isArray(value)) {
      return value;
    }
  }
  
  // Se não encontrou um array, tentar converter o próprio objeto em um item de array
  return [flattenObject(obj)];
}

// Função para "achatar" objetos aninhados
function flattenObject(obj, prefix = '') {
  let result = {};
  
  for (const [key, value] of Object.entries(obj)) {
    const newKey = prefix ? `${prefix}_${key}` : key;
    
    if (typeof value === 'object' && value !== null && !Array.isArray(value)) {
      Object.assign(result, flattenObject(value, newKey));
    } else if (Array.isArray(value)) {
      // Para arrays, podemos converter em string ou ignorar
      result[newKey] = JSON.stringify(value);
    } else {
      result[newKey] = value;
    }
  }
  
  return result;
}

// Obter histórico de conversões do usuário
const getConversionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversions = await storage.query('conversions');
    const userConversions = conversions.filter(conv => conv.user_id === userId);
    
    // Ordenar por data de criação (mais recente primeiro)
    userConversions.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
    
    res.status(200).json(userConversions);
  } catch (error) {
    console.error('Erro ao obter histórico de conversões:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter histórico de conversões' });
  }
};

module.exports = {
  convertToExcel,
  getConversionHistory
};
