const User = require('../models/User');
const jwt = require('jsonwebtoken');
const path = require('path');

// Registro de usuario
exports.registerUser = async (req, res) => {
  const { fullName, dob, password } = req.body;
  let dniPath = '';

  if (req.file) {
    // Guardar ruta relativa para que frontend acceda bien
    dniPath = path.relative(path.join(__dirname, '../'), req.file.path).replace(/\\/g, '/');
  }

  try {
    const newUser = new User({ fullName, dob, password, dniPath });
    await newUser.save();

    res.status(201).json({
      message: 'Usuario registrado exitosamente',
      zodiacSign: newUser.zodiacSign,
      userId: newUser._id
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al registrar usuario', error: error.message });
  }
};

// Login de usuario
exports.loginUser = async (req, res) => {
  const { fullName, password } = req.body;

  try {
    const user = await User.findOne({ fullName });
    if (!user) return res.status(400).json({ message: 'Usuario no encontrado' });

    const isMatch = await user.comparePassword(password);
    if (!isMatch) return res.status(400).json({ message: 'Contraseña incorrecta' });

    const token = jwt.sign(
      { id: user._id, fullName: user.fullName, zodiacSign: user.zodiacSign },
      process.env.JWT_SECRET,
      { expiresIn: '1d' }
    );

    res.json({
      token,
      userId: user._id,
      zodiacSign: user.zodiacSign,
      photoPath: user.photoPath
    });
  } catch (error) {
    res.status(500).json({ message: 'Error al iniciar sesión', error });
  }
};

// Obtener perfil autenticado
exports.getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password -__v');
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    res.json(user);
  } catch (error) {
    res.status(500).json({ message: 'Error al obtener perfil', error });
  }
};

// Actualizar perfil (foto de perfil)
exports.updateProfile = async (req, res) => {
  try {
    const body = req.body || {};
    const { fullName, dob, password, bio } = body;
    let photoPath;

    if (req.file) {
      photoPath = path.relative(path.join(__dirname, '../uploads'), req.file.path).replace(/\\/g, '/');
    }

    const updates = {};
    if (fullName) updates.fullName = fullName;
    if (dob) updates.dob = dob;
    if (password) updates.password = password; // será hasheada en el schema User
    if (bio !== undefined) updates.bio = bio;
    if (photoPath) updates.photoPath = photoPath;

    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'Usuario no encontrado' });

    Object.assign(user, updates);
    await user.save();

    const userObj = user.toObject();
    if (userObj.photoPath && !userObj.photoPath.startsWith('http')) {
      userObj.photoPath = `/uploads/${userObj.photoPath}`;
    }

    res.json({
      message: 'Perfil actualizado correctamente',
      user: userObj,
    });
  } catch (error) {
    res.status(500).json({ message: 'Error actualizando perfil', error: error.message });
  }
};