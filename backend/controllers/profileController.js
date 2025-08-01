// Función para sanitizar nombres de archivo
function sanitizeFilename(filename) {
  return filename
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '') // Elimina tildes
    .replace(/[^a-zA-Z0-9._-]/g, '_'); // Reemplaza caracteres raros por _
}
const User = require('../models/User');
const fs = require('fs');
const path = require('path');

const getProfile = async (req, res) => {
  try {
    const userId = req.user.id;

    const user = await User.findById(userId).select('-password');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

const updateProfile = async (req, res) => {
  try {
    const userId = req.user.id;
    const { fullName, dob, bio } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    if (fullName) user.fullName = fullName;
    if (dob) user.dob = new Date(dob);
    if (bio) user.bio = bio;

    if (req.file) {
      // Borrar foto anterior si existe
      if (user.photoPath) {
        const oldPath = path.join(__dirname, '..', user.photoPath);
        if (fs.existsSync(oldPath)) {
          fs.unlinkSync(oldPath);
        }
      }
      const originalName = req.file.originalname;
      const ext = path.extname(originalName);
      const sanitizedFilename = sanitizeFilename(path.basename(originalName, ext)) + '-' + Date.now() + ext;
      const newPath = path.join('uploads/profile_photos', sanitizedFilename);
      // Mover archivo al nuevo nombre
      fs.renameSync(req.file.path, newPath);
      user.photoPath = newPath;
    }

    await user.save();

    res.json({ message: 'Perfil actualizado correctamente', user });
  } catch (error) {
    console.error('Error al actualizar perfil:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

// Nuevo: obtener perfil público sin datos sensibles
const getPublicProfile = async (req, res) => {
  try {
    const userId = req.params.id;

    const user = await User.findById(userId).select('fullName bio photoPath zodiacSign');

    if (!user) {
      return res.status(404).json({ error: 'Usuario no encontrado' });
    }

    res.json(user);
  } catch (error) {
    console.error('Error al obtener perfil público:', error);
    res.status(500).json({ error: 'Error interno del servidor' });
  }
};

module.exports = { getProfile, updateProfile, getPublicProfile };