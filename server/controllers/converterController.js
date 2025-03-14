
const { xmlToExcel, saveConversion, getUserConversions, getConversionById, deleteConversion } = require('../services/conversionService');
const { useCredit, checkUserCredits } = require('../services/creditService');
const fs = require('fs');
const path = require('path');

// Converter XML para Excel
const convertXmlToExcel = async (req, res) => {
  try {
    // Verificar se o arquivo foi enviado
    if (!req.file && !req.body.xmlContent) {
      return res.status(400).json({ message: 'Nenhum arquivo XML ou conteúdo enviado' });
    }
    
    const userId = req.user.id;
    
    // Verificar créditos do usuário
    const creditCheck = await checkUserCredits(userId);
    
    if (!creditCheck.hasCredits) {
      return res.status(403).json({ 
        message: 'Créditos insuficientes para realizar a conversão',
        credits: creditCheck.credits 
      });
    }
    
    let xmlContent, originalFilename;
    
    // Obter conteúdo XML do arquivo ou do corpo da requisição
    if (req.file) {
      xmlContent = fs.readFileSync(req.file.path, 'utf8');
      originalFilename = req.file.originalname;
    } else {
      xmlContent = req.body.xmlContent;
      originalFilename = req.body.filename || 'documento.xml';
    }
    
    // Converter o XML para Excel
    const { excelPath, excelFilename } = await xmlToExcel(xmlContent, originalFilename);
    
    // Descontar um crédito
    await useCredit(userId);
    
    // Salvar registro da conversão no banco de dados
    const conversion = await saveConversion(
      userId,
      originalFilename,
      excelFilename,
      xmlContent
    );
    
    // Enviar o arquivo Excel como resposta
    res.download(excelPath, excelFilename, (err) => {
      if (err) {
        console.error('Erro ao enviar arquivo:', err);
        return res.status(500).json({ message: 'Erro ao enviar arquivo convertido' });
      }
      
      // Limpar o arquivo temporário após o envio
      fs.unlink(excelPath, (unlinkErr) => {
        if (unlinkErr) console.error('Erro ao remover arquivo temporário:', unlinkErr);
      });
    });
  } catch (error) {
    console.error('Erro na conversão:', error);
    res.status(500).json({ message: 'Erro no servidor ao processar a conversão' });
  }
};

// Obter histórico de conversões do usuário
const getConversionHistory = async (req, res) => {
  try {
    const userId = req.user.id;
    
    const conversions = await getUserConversions(userId);
    
    res.status(200).json(conversions);
  } catch (error) {
    console.error('Erro ao obter histórico:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter histórico de conversões' });
  }
};

// Obter uma conversão específica
const getConversion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const conversion = await getConversionById(id, userId);
    
    if (!conversion) {
      return res.status(404).json({ message: 'Conversão não encontrada' });
    }
    
    res.status(200).json(conversion);
  } catch (error) {
    console.error('Erro ao obter conversão:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter conversão' });
  }
};

// Excluir uma conversão
const removeConversion = async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;
    
    const success = await deleteConversion(id, userId);
    
    if (!success) {
      return res.status(404).json({ message: 'Conversão não encontrada ou já removida' });
    }
    
    res.status(200).json({ message: 'Conversão removida com sucesso' });
  } catch (error) {
    console.error('Erro ao excluir conversão:', error);
    res.status(500).json({ message: 'Erro no servidor ao excluir conversão' });
  }
};

module.exports = {
  convertXmlToExcel,
  getConversionHistory,
  getConversion,
  removeConversion
};
