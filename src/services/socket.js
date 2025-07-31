// src/services/socket.js
import { io } from 'socket.io-client';

const token = localStorage.getItem('token'); // Tomamos el token guardado al iniciar sesión

const socket = io('https://backend-zodiacus.onrender.com', {
  auth: {
    token: token,
  },
});

export default socket;