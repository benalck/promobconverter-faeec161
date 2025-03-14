
const express = require('express');
const router = express.Router();
const userController = require('../controllers/userController');
const { verifyToken, verifyAdmin } = require('../middlewares/auth');

// Todas as rotas exigem autenticação
router.use(verifyToken);

// Rotas que exigem privilégios de administrador
router.get('/', verifyAdmin, userController.getAllUsers);
router.put('/:userId/ban', verifyAdmin, userController.banUser);
router.put('/:userId/unban', verifyAdmin, userController.unbanUser);
router.put('/:userId', verifyAdmin, userController.updateUser);
router.post('/:userId/credits', verifyAdmin, userController.addCredits);

module.exports = router;
