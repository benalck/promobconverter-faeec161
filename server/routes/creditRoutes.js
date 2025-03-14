
const express = require('express');
const router = express.Router();
const creditController = require('../controllers/creditController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Todas as rotas exigem autenticação
router.use(verifyToken);

// Obter créditos do usuário atual
router.get('/', creditController.getUserCredits);

// Adicionar créditos (apenas admin)
router.post('/add', verifyAdmin, creditController.addUserCredits);

module.exports = router;
