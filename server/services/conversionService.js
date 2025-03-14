
const { query } = require('../config/database');
const { v4: uuidv4 } = require('uuid');
const fs = require('fs');
const path = require('path');
const xlsx = require('xlsx');
const xml2js = require('xml2js');

// Diretório para arquivos temporários
const TEMP_DIR = path.join(__dirname, '../temp');

// Garantir que o diretório temporário existe
if (!fs.existsSync(TEMP_DIR)) {
  fs.mkdirSync(TEMP_DIR, { recursive: true });
}

// Converter XML para Excel
const xmlToExcel = async (xmlContent, filename) => {
  try {
    // Analisar o conteúdo XML
    const parser = new xml2js.Parser({ explicitArray: false });
    const result = await parser.parseStringPromise(xmlContent);
    
    // Criar planilha do Excel
    const workbook = xlsx.utils.book_new();
    
    // Converter objetos para formato de planilha
    const processObject = (obj, prefix = '') => {
      let data = [];
      
      // Extrair dados do objeto
      for (const key in obj) {
        if (obj.hasOwnProperty(key)) {
          const value = obj[key];
          
          if (typeof value === 'object' && value !== null) {
            // Processar objetos aninhados
            const nestedData = processObject(value, `${prefix}${key}.`);
            data = [...data, ...nestedData];
          } else {
            // Adicionar valores simples
            data.push({ key: `${prefix}${key}`, value: value });
          }
        }
      }
      
      return data;
    };
    
    // Processar dados XML
    const sheetData = processObject(result);
    
    // Converter para o formato de planilha
    const worksheet = xlsx.utils.json_to_sheet(sheetData);
    
    // Adicionar planilha ao workbook
    xlsx.utils.book_append_sheet(workbook, worksheet, 'XML Data');
    
    // Gerar nome de arquivo para Excel
    const excelFilename = filename.replace('.xml', '.xlsx');
    const excelPath = path.join(TEMP_DIR, excelFilename);
    
    // Salvar arquivo Excel
    xlsx.writeFile(workbook, excelPath);
    
    return {
      excelPath,
      excelFilename
    };
  } catch (error) {
    console.error('Erro ao converter XML para Excel:', error);
    throw new Error('Falha ao converter XML para Excel');
  }
};

// Salvar registro de conversão no banco de dados
const saveConversion = async (userId, originalFilename, convertedFilename, fileContent, conversionType = 'xml_to_excel') => {
  try {
    const id = uuidv4();
    
    const result = await query(
      `INSERT INTO conversions (id, user_id, original_filename, converted_filename, file_content, conversion_type)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [id, userId, originalFilename, convertedFilename, fileContent, conversionType]
    );
    
    return {
      id,
      userId,
      originalFilename,
      convertedFilename,
      conversionType,
      createdAt: new Date()
    };
  } catch (error) {
    console.error('Erro ao salvar conversão no banco de dados:', error);
    throw new Error('Falha ao salvar registro de conversão');
  }
};

// Obter histórico de conversões de um usuário
const getUserConversions = async (userId) => {
  try {
    const conversions = await query(
      `SELECT id, user_id, original_filename, converted_filename, conversion_type, created_at
       FROM conversions 
       WHERE user_id = ?
       ORDER BY created_at DESC`,
      [userId]
    );
    
    return conversions;
  } catch (error) {
    console.error('Erro ao obter histórico de conversões:', error);
    throw new Error('Falha ao obter histórico de conversões');
  }
};

// Obter conversão específica pelo ID
const getConversionById = async (id, userId) => {
  try {
    const [conversion] = await query(
      `SELECT * FROM conversions 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    if (!conversion) {
      return null;
    }
    
    return conversion;
  } catch (error) {
    console.error('Erro ao obter conversão:', error);
    throw new Error('Falha ao obter conversão');
  }
};

// Excluir uma conversão
const deleteConversion = async (id, userId) => {
  try {
    const result = await query(
      `DELETE FROM conversions 
       WHERE id = ? AND user_id = ?`,
      [id, userId]
    );
    
    return result.affectedRows > 0;
  } catch (error) {
    console.error('Erro ao excluir conversão:', error);
    throw new Error('Falha ao excluir conversão');
  }
};

module.exports = {
  xmlToExcel,
  saveConversion,
  getUserConversions,
  getConversionById,
  deleteConversion
};
