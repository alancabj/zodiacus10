const express = require('express');
const router = express.Router();
const multer = require('multer');
const path = require('path');
const authController = require('../controllers/authController');
const authenticateToken = require('../middleware/authmiddleware');

// Storage para DNI
const storageDni = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/dni/');
  },
  filename: (req, file, cb) => {
    // Quitar tildes y caracteres raros del nombre original
    const cleanName = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});
const uploadDni = multer({ storage: storageDni });

// Storage para fotos de perfil
const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos/');
  },
  filename: (req, file, cb) => {
    const cleanName = file.originalname.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    cb(null, `${Date.now()}-${cleanName}`);
  }
});
const uploadProfile = multer({ storage: storageProfile });

// Rutas
router.post('/register', uploadDni.single('dni'), authController.registerUser);
router.post('/login', authController.loginUser);
router.get('/profile', authenticateToken, authController.getProfile);
router.put('/profile', authenticateToken, uploadProfile.single('photo'), authController.updateProfile);

module.exports = router;