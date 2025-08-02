const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const http = require('http');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const { initializeSocket } = require('./socket');
const path = require('path');
const fs = require('fs');

dotenv.config();

const app = express();
const server = http.createServer(app);

initializeSocket(server);

app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Asegurar que la carpeta uploads existe
const uploadsDir = path.join(__dirname, 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Asegurar que la carpeta profile_photos existe dentro de uploads
const profilePhotosDir = path.join(uploadsDir, 'profile_photos');
if (!fs.existsSync(profilePhotosDir)) {
  fs.mkdirSync(profilePhotosDir, { recursive: true });
}

// Servir imágenes estáticas
app.use('/uploads', express.static(uploadsDir));
app.use('/profile_photos', express.static(path.join(__dirname, 'uploads/profile_photos')));

app.use('/api/auth', authRoutes);

// Conexión a MongoDB
mongoose.connect(process.env.MONGODB_URI)
  .then(() => {
    console.log('✅ Conectado a MongoDB');
    const PORT = process.env.PORT || 5001;
    server.listen(PORT, () => {
      console.log(`🚀 Servidor corriendo en puerto ${PORT}`);
    });
  })
  .catch((err) => console.error('❌ Error de conexión a MongoDB:', err));