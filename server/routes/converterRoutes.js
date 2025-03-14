
const express = require('express');
const router = express.Router();
const converterController = require('../controllers/converterController');
const { verifyToken } = require('../middlewares/auth');

// Todas as rotas exigem autenticação
router.use(verifyToken);

// Converter XML para Excel
router.post('/xml-to-excel', converterController.convertToExcel);

// Obter histórico de conversões
router.get('/history', converterController.getConversionHistory);

module.exports = router;
