
const { v4: uuidv4 } = require('uuid');
const xml2js = require('xml2js');
const xlsx = require('xlsx');
const { query } = require('../config/database');
const { consumeCredits } = require('./creditService');

// Converter XML para Excel
const convertXmlToExcel = async (userId, xmlString, filename) => {
  try {
    // Primeiro, consumir um crédito do usuário
    await consumeCredits(userId, 1);
    
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
    
    // Salvar o registro da conversão no banco de dados
    const conversionId = uuidv4();
    await query(
      'INSERT INTO conversions (id, user_id, original_filename, converted_filename, conversion_type) VALUES (?, ?, ?, ?, ?)',
      [conversionId, userId, originalFilename, convertedFilename, 'xml_to_excel']
    );
    
    return {
      conversionId,
      buffer: excelBuffer,
      filename: convertedFilename
    };
  } catch (error) {
    console.error('Erro na conversão de XML para Excel:', error);
    throw error;
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
const getUserConversions = async (userId) => {
  try {
    const conversions = await query(
      'SELECT id, original_filename, converted_filename, conversion_type, created_at FROM conversions WHERE user_id = ? ORDER BY created_at DESC',
      [userId]
    );
    
    return conversions;
  } catch (error) {
    console.error('Erro ao obter histórico de conversões:', error);
    throw error;
  }
};

module.exports = {
  convertXmlToExcel,
  getUserConversions
};
