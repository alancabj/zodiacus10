// src/services/socket.js
import { io } from 'socket.io-client';

const token = localStorage.getItem('token'); // Tomamos el token guardado al iniciar sesión

const socket = io('http://192.168.1.35:5001', {
  auth: {
    token: token,
  },
});

export default socket;