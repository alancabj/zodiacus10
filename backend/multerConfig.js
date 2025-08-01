// multerConfig.js
const multer = require('multer');
const path = require('path');

// Función para limpiar el nombre del archivo (sin tildes, sin espacios, solo caracteres safe)
function cleanFileName(filename) {
  return filename
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '') // quitar tildes
    .replace(/\s+/g, '_')                             // reemplazar espacios por _
    .replace(/[^a-zA-Z0-9_.-]/g, '')                  // eliminar caracteres especiales excepto . _ -
    .toLowerCase();
}

const storageProfile = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploads/profile_photos/');
  },
  filename: (req, file, cb) => {
    const cleanName = cleanFileName(file.originalname);
    cb(null, `${Date.now()}-${cleanName}`);
  }
});

const uploadProfile = multer({ storage: storageProfile });

module.exports = uploadProfile;