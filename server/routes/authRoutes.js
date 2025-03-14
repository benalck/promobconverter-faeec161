
const express = require('express');
const router = express.Router();
const authController = require('../controllers/authController');
const { verifyToken } = require('../middlewares/auth');

// Rotas de autenticação
router.post('/register', authController.register);
router.post('/login', authController.login);
router.post('/logout', authController.logout);
router.get('/me', verifyToken, authController.getCurrentUser);

module.exports = router;
