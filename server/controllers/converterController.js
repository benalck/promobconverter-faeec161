
const { convertXmlToExcel, getUserConversions } = require('../services/conversionService');
const { checkUserCredits } = require('../services/creditService');

// Converter XML para Excel
const convertToExcel = async (req, res) => {
  try {
    const userId = req.user.id;
    const { xmlString, filename } = req.body;
    
    if (!xmlString) {
      return res.status(400).json({ message: 'String XML é obrigatória' });
    }
    
    // Verificar se o usuário tem créditos suficientes
    const creditInfo = await checkUserCredits(userId);
    
    if (creditInfo.credits < 1) {
      return res.status(403).json({ 
        message: 'Créditos insuficientes para realizar a conversão',
        credits: creditInfo.credits
      });
    }
    
    // Realizar a conversão
    const result = await convertXmlToExcel(userId, xmlString, filename);
    
    // Retornar o buffer e informações da conversão
    res.status(200).json({
      message: 'Conversão realizada com sucesso',
      conversionId: result.conversionId,
      filename: result.filename,
      buffer: result.buffer.toString('base64') // Enviar como base64 para o cliente
    });
  } catch (error) {
    console.error('Erro na conversão:', error);
    
    if (error.message === 'Créditos insuficientes') {
      return res.status(403).json({ message: error.message });
    }
    
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
    console.error('Erro ao obter histórico de conversões:', error);
    res.status(500).json({ message: 'Erro no servidor ao obter histórico de conversões' });
  }
};

module.exports = {
  convertToExcel,
  getConversionHistory
};
