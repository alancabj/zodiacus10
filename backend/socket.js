const { Server } = require('socket.io');

function initializeSocket(server) {
  const io = new Server(server, {
    cors: {
      origin: '*',
    },
  });

  // Mapa temporal para almacenar likes por mensaje:
  // key: messageId, value: { likesCount: number, likedBy: Set<socketId> }
  const messageLikes = new Map();

  // Lista para usuarios esperando en ruleta
  const waitingUsers = [];

  io.on('connection', (socket) => {
    console.log('🟢 Usuario conectado:', socket.id);

    // --- Ruleta zodiacal ---
    socket.on('joinRoulette', (userData) => {
      console.log('🎲 Usuario en ruleta:', userData);

      if (waitingUsers.length > 0) {
        const partnerSocket = waitingUsers.shift(); // emparejar al primero esperando
        const roomName = `roulette_${Date.now()}_${socket.id}`; // sala privada única

        // Unir ambos a la sala
        socket.join(roomName);
        partnerSocket.join(roomName);

        // Guardar datos en socket.data para poder emitir usuarios y mensajes
        socket.data = { ...userData, room: roomName };
        partnerSocket.data = { ...partnerSocket.data, room: roomName };

        // Emitir info del partner y nombre de sala a cada usuario
        socket.emit('roulettePartner', { ...partnerSocket.data, room: roomName });
        partnerSocket.emit('roulettePartner', { ...userData, room: roomName });

        // Simular joinRoom manualmente para socket
        socket.join(roomName);
        socket.data.fullName = userData.fullName;
        socket.data.room = roomName;
        socket.data.zodiacSign = userData.zodiacSign || '';
        socket.data.photoPath = userData.photoPath || '';

        // Simular joinRoom manualmente para partnerSocket
        partnerSocket.join(roomName);
        partnerSocket.data.fullName = partnerSocket.data.fullName || 'Anónimo';
        partnerSocket.data.room = roomName;
        partnerSocket.data.zodiacSign = partnerSocket.data.zodiacSign || '';
        partnerSocket.data.photoPath = partnerSocket.data.photoPath || '';

        // Emitir usuarios actuales en la sala (los dos)
        io.to(roomName).emit('roomUsers', [
          {
            id: partnerSocket.id,
            fullName: partnerSocket.data.fullName,
            zodiacSign: partnerSocket.data.zodiacSign,
            photoPath: partnerSocket.data.photoPath,
          },
          {
            id: socket.id,
            fullName: socket.data.fullName,
            zodiacSign: socket.data.zodiacSign,
            photoPath: socket.data.photoPath,
          }
        ]);
      } else {
        // No hay nadie esperando, agregar a la lista
        waitingUsers.push(socket);
        socket.emit('waitingPartner');
      }
    });

    // --- Salas generales (ej: salas de signos) ---
    socket.on('joinRoom', ({ room, fullName, zodiacSign, photoPath }) => {
      console.log('🧩 Datos recibidos en joinRoom:', { room, fullName, zodiacSign, photoPath });

      if (!room || !fullName) return;
      socket.join(room);
      socket.data.fullName = fullName;
      socket.data.room = room;
      socket.data.zodiacSign = zodiacSign || '';
      socket.data.photoPath = photoPath || '';

      // Emitir usuarios actuales en la sala con zodiacSign incluido
      const usersInRoom = [];
      for (let [id, s] of io.of('/').sockets) {
        if (s.data.room === room) {
          usersInRoom.push({
            id,
            fullName: s.data.fullName || 'Anónimo',
            zodiacSign: s.data.zodiacSign || '',
            photoPath: s.data.photoPath || '',
          });
        }
      }
      io.to(room).emit('roomUsers', usersInRoom);
    });

    // --- Obtener usuarios de una sala ---
    socket.on('getRoomUsers', (room) => {
      if (!room) return;
      const usersInRoom = [];
      for (let [id, s] of io.of('/').sockets) {
        if (s.data.room === room) {
          usersInRoom.push({
            id,
            fullName: s.data.fullName || 'Anónimo',
            zodiacSign: s.data.zodiacSign || '',
            photoPath: s.data.photoPath || '',
          });
        }
      }
      io.to(room).emit('roomUsers', usersInRoom);
    });

    // --- Mensajes de chat ---
    socket.on('chatMessage', (data) => {
  console.log('Mensaje recibido en backend:', data);

  if (!data.room || !data.text || typeof data.text !== 'string' || !data.text.trim()) return;

  const fullName = socket.data.fullName || 'Anónimo';
  const timestamp = new Date().toISOString();

  const messageId = `${Date.now()}-${socket.id}`;

  const message = {
    id: messageId,
    user: fullName,
    text: data.text.trim(),
    timestamp,
    likesCount: 0,
    photoPath: data.photoPath || '',  // ✅ AÑADIR ESTO
  };

  messageLikes.set(messageId, { likesCount: 0, likedBy: new Set() });

  io.to(data.room).emit('message', message);
});

    // --- Likes toggle ---
    socket.on('toggleLike', ({ room, messageId }) => {
      if (!room || !messageId) return;

      const likeData = messageLikes.get(messageId);
      if (!likeData) return; // mensaje no existe

      if (likeData.likedBy.has(socket.id)) {
        // Usuario ya dio like, quitar like
        likeData.likedBy.delete(socket.id);
        likeData.likesCount--;
      } else {
        // Usuario da like
        likeData.likedBy.add(socket.id);
        likeData.likesCount++;
      }

      // Actualizar mapa
      messageLikes.set(messageId, likeData);

      // Emitir conteo actualizado a todos en la sala
      io.to(room).emit('likesUpdate', { messageId, likesCount: likeData.likesCount });
    });

    // --- Desconexión ---
    socket.on('disconnect', () => {
      console.log('🔴 Usuario desconectado:', socket.id);

      // Si estaba esperando en ruleta, sacarlo
      const idx = waitingUsers.indexOf(socket);
      if (idx !== -1) {
        waitingUsers.splice(idx, 1);
      }

      // Si estaba en alguna sala, actualizar usuarios conectados
      const room = socket.data.room;
      if (room) {
        const usersInRoom = [];
        for (let [id, s] of io.of('/').sockets) {
          if (s.data.room === room && id !== socket.id) {
            usersInRoom.push({
              id,
              fullName: s.data.fullName || 'Anónimo',
              zodiacSign: s.data.zodiacSign || '',
              photoPath: s.data.photoPath || '',
            });
          }
        }
        io.to(room).emit('roomUsers', usersInRoom);

        // Emitir aviso de desconexión para mostrar mensaje en el chat
        io.to(room).emit('message', {
          id: `system-${Date.now()}`,
          user: 'Sistema',
          text: `${socket.data.fullName || 'Un usuario'} abandonó la sala.`,
          timestamp: new Date().toISOString(),
          photo: null,
          system: true,
        });
      }
    });
  });
}

module.exports = { initializeSocket };