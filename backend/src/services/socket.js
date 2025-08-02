// src/services/socket.js
import { io } from 'socket.io-client';

const token = localStorage.getItem('token'); // Tomamos el token guardado al iniciar sesión

const socket = io('http://192.168.0.20:5001', {
  auth: {
    token: token,
  },
});

export default socket;