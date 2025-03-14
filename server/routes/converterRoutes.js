
const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const converterController = require('../controllers/converterController');
const { verifyToken } = require('../middlewares/auth');

// Configurar armazenamento de uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../temp'));
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, uniqueSuffix + '-' + file.originalname);
  }
});

// Configurar filtro de arquivos
const fileFilter = (req, file, cb) => {
  if (file.mimetype === 'application/xml' || 
      file.mimetype === 'text/xml' || 
      file.originalname.endsWith('.xml')) {
    cb(null, true);
  } else {
    cb(new Error('Apenas arquivos XML são permitidos'), false);
  }
};

const upload = multer({ 
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: 5 * 1024 * 1024 // 5MB
  }
});

// Todas as rotas exigem autenticação
router.use(verifyToken);

// Rota para converter XML para Excel
router.post('/xml-to-excel', upload.single('xmlFile'), converterController.convertXmlToExcel);

// Rota para obter histórico de conversões
router.get('/history', converterController.getConversionHistory);

// Rota para obter uma conversão específica
router.get('/:id', converterController.getConversion);

// Rota para excluir uma conversão
router.delete('/:id', converterController.removeConversion);

module.exports = router;
