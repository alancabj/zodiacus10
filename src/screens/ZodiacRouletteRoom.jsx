import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

const SOCKET_SERVER_URL = 'http://192.168.1.35:5001';  // pon tu IP local
const BASE_URL = 'http://192.168.1.35:5001/uploads/';

const signosEmoji = {
  aries: '♈', tauro: '♉', geminis: '♊', cancer: '♋', leo: '♌',
  virgo: '♍', libra: '♎', escorpio: '♏', sagitario: '♐',
  capricornio: '♑', acuario: '♒', piscis: '♓'
};

const ZodiacRouletteRoom = () => {
  const [partner, setPartner] = useState(null);
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [waiting, setWaiting] = useState(true);
  const [room, setRoom] = useState(null);
  const [usersRaw, setUsersRaw] = useState([]);
  const [likesState, setLikesState] = useState({}); // messageId -> likesCount
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef(null);
  const navigate = useNavigate();

  useEffect(() => {
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const token = localStorage.getItem('token');
    if (!storedUser || !token) return;

    socketRef.current = io(SOCKET_SERVER_URL, { auth: { token } });

    socketRef.current.on('connect', () => {
      socketRef.current.emit('joinRoulette', storedUser);
    });

    socketRef.current.on('roulettePartner', (data) => {
      if (data.photoPath && !data.photoPath.startsWith('http')) {
        const cleanedPath = data.photoPath.replace(/^\/?(?:uploads\/)?/, '');
        const encodedPath = cleanedPath.split('/').map(encodeURIComponent).join('/');
        data.photoPath = `${BASE_URL}${encodedPath}`;
      }
      setPartner(data);
      setRoom(data.room);
      setWaiting(false);
      setMessages([]);
      setUsersRaw([]);

      socketRef.current.emit('joinRoom', {
        room: data.room,
        fullName: storedUser.fullName,
        zodiacSign: storedUser.zodiacSign,
        photoPath: storedUser.photoPath,
      });

      socketRef.current.emit('getRoomUsers', data.room);
    });

    socketRef.current.on('waitingPartner', () => {
      setWaiting(true);
      setPartner(null);
      setMessages([]);
      setUsersRaw([]);
    });

    socketRef.current.on('message', (msg) => {
      setMessages((prev) => [...prev, msg]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socketRef.current.on('userLeft', (data) => {
      const systemMessage = {
        id: `left-${Date.now()}`,
        text: data.message,
        system: true,
        timestamp: new Date().toISOString(),
      };
      setMessages((prev) => [...prev, systemMessage]);
      setTimeout(() => chatEndRef.current?.scrollIntoView({ behavior: 'smooth' }), 50);
    });

    socketRef.current.on('roomUsers', (usersList) => {
      setUsersRaw(usersList);
    });

    socketRef.current.on('likesUpdate', ({ messageId, likesCount }) => {
      setLikesState((prev) => ({ ...prev, [messageId]: likesCount }));
    });

    return () => {
      socketRef.current.disconnect();
    };
  }, []);

  const users = useMemo(() => {
    return usersRaw.map(u => {
      const cleanSign = (u.zodiacSign || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      let photoPath = u.photoPath || '';
      if (photoPath && !photoPath.startsWith('http')) {
        const cleanedPath = photoPath.replace(/^\/?uploads\//, '');
        const encodedPath = cleanedPath.split('/').map(encodeURIComponent).join('/');
        photoPath = `${BASE_URL}${encodedPath}`;
      }

      return {
        ...u,
        emoji: signosEmoji[cleanSign] || '',
        photoPath: photoPath || '/default-profile.png',
      };
    });
  }, [usersRaw]);

  const partnerWithExtras = useMemo(() => {
    if (!partner) return null;
    const cleanSign = (partner.zodiacSign || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '');

    let photoPath = partner.photoPath || '';
    if (photoPath && !photoPath.startsWith('http')) {
      const cleanedPath = photoPath.replace(/^\/?uploads\//, '');
      const encodedPath = cleanedPath.split('/').map(encodeURIComponent).join('/');
      photoPath = `${BASE_URL}${encodedPath}`;
    }

    return {
      ...partner,
      emoji: signosEmoji[cleanSign] || '',
      photoPath: photoPath || '/default-profile.png',
    };
  }, [partner]);

  const storedUser = JSON.parse(localStorage.getItem('user'));

  // Enviar toggle de like
  const toggleLike = (messageId) => {
    if (!room || !messageId) return;
    socketRef.current.emit('toggleLike', { room, messageId });
  };

  // Función para volver atrás
  const handleBack = () => {
    navigate(-1);
  };

  // Manejador para error de imagen (pone imagen default)
  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    e.currentTarget.src = '/default-profile.png';
  };

  // Añadir emoji al mensaje
  const addEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  // Enviar mensaje de chat
  const sendMessage = (e) => {
    e.preventDefault();
    if (!message.trim() || !room) return;

    socketRef.current.emit('chatMessage', {
      room,
      text: message.trim(),
    });

    setMessage('');
  };

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>← Volver</button>

      <h2 style={styles.title}>🎲 Ruleta Zodiacal 🔮</h2>

      {waiting ? (
        <div style={styles.infoBox}>
          <h3 style={styles.infoTitle}>Buscando usuario...</h3>
          <p style={styles.infoText}>
            En esta sala de ruleta zodiacal, serás emparejado aleatoriamente con otro usuario.
            El objetivo es crear nuevas conexiones, ya sea una charla casual, una amistad o lo que surja. ¡Disfrutá la experiencia cósmica!
          </p>
        </div>
      ) : (
        <>
          {partnerWithExtras && (
            <div style={styles.usersBox}>
              <h4 style={styles.usersTitle}>Tu pareja en la ruleta:</h4>
              <div style={styles.userItem}>
                <img
                  src={partnerWithExtras.photoPath}
                  alt={`${partnerWithExtras.fullName} foto`}
                  style={styles.userPhoto}
                  onError={handleImgError}
                />
                <span style={{ marginRight: 8 }}>{partnerWithExtras.emoji}</span>
                {partnerWithExtras.fullName}
              </div>
            </div>
          )}

          <div style={styles.usersBox}>
            <h4 style={styles.usersTitle}>Usuarios conectados en sala:</h4>
            {users.length === 0 ? (
              <p style={styles.usersText}>No hay usuarios conectados</p>
            ) : (
              <ul style={styles.usersList}>
                {users.map((u) => (
                  <li key={u.id || u.fullName} style={styles.userItem}>
                    <img
                      src={u.photoPath}
                      alt={`${u.fullName} foto`}
                      style={styles.userPhoto}
                      onError={handleImgError}
                    />
                    <span style={{ marginRight: 8 }}>{u.emoji}</span>
                    {u.fullName}
                  </li>
                ))}
              </ul>
            )}
          </div>

          <div style={styles.chatBox}>
            {messages.map((msg) => {
              if (msg.system) {
                return (
                  <div key={msg.id} style={{
                    textAlign: 'center',
                    fontStyle: 'italic',
                    color: '#4B0082',
                    marginBottom: 10,
                    backgroundColor: 'rgba(255,255,255,0.8)',
                    borderRadius: 10,
                    padding: '6px 12px',
                    maxWidth: '60%',
                    alignSelf: 'center',
                    fontWeight: 600,
                  }}>
                    {msg.text}
                  </div>
                );
              }
              const sender = users.find(u => u.fullName === msg.user) || {};
              const likesCount = likesState[msg.id] ?? msg.likesCount ?? 0;

              // Formatear hora
              const date = new Date(msg.timestamp);
              const hours = date.getHours().toString().padStart(2, '0');
              const minutes = date.getMinutes().toString().padStart(2, '0');
              const formattedTime = `${hours}:${minutes}`;

              // Definir si el mensaje es del usuario actual para cambiar color y estilo
              const isCurrentUser = msg.user === storedUser.fullName;

              return (
                <div
                  key={msg.id}
                  style={{
                    ...styles.messageItem,
                    backgroundColor: isCurrentUser ? 'rgba(218, 165, 32, 0.2)' : 'rgba(75, 0, 130, 0.2)',  // dorado traslúcido o violeta traslúcido
                    color: '#333',
                    marginBottom: 14,
                    borderRadius: 16,
                    display: 'flex',
                    alignItems: 'flex-start',
                    gap: 12,
                    padding: 12,
                    maxWidth: '60%',
                    alignSelf: 'flex-start', // ALINEAR A LA IZQUIERDA
                    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
                    wordBreak: 'break-word',
                  }}
                >
                  <img
                    src={sender.photoPath || '/default-profile.png'}
                    alt={sender.fullName || 'Usuario'}
                    style={styles.messagePhoto}
                    onError={handleImgError}
                  />
                  <div style={{ flex: 1, display: 'flex', flexDirection: 'column' }}>
                    <div style={styles.messageUserName}>
                      <span style={{ marginRight: 6 }}>{signosEmoji[(sender.zodiacSign || '').toLowerCase()] || ''}</span>
                      {msg.user}
                    </div>
                    <div style={styles.messageText}>{msg.text}</div>
                    <div style={styles.messageFooter}>
                      <span style={styles.messageTime}>{formattedTime}</span>
                      <div style={styles.likeContainer}>
                        <button
                          style={styles.likeButton}
                          onClick={() => toggleLike(msg.id)}
                          aria-label="Like message"
                          title="Me gusta"
                        >
                          {likesCount > 0 ? '❤️' : '🤍'}
                        </button>
                        <span style={styles.likeCount}>{likesCount}</span>
                      </div>
                    </div>
                  </div>
                </div>
              );
            })}
            <div ref={chatEndRef} />
          </div>

          <div style={{ position: 'relative', marginBottom: 10 }}>
            <button
              type="button"
              onClick={() => setShowEmojiPicker((prev) => !prev)}
              style={styles.emojiToggleButton}
              aria-label="Mostrar/ocultar selector de emojis"
            >
              😀
            </button>
            {showEmojiPicker && (
              <div
                ref={emojiPickerRef}
                style={styles.emojiPickerContainer}
              >
                <EmojiPicker
                  onEmojiClick={addEmoji}
                  locale="es"
                  lazyLoadEmojis={true}
                />
              </div>
            )}
          </div>

          <form onSubmit={sendMessage} style={styles.form}>
            <input
              ref={inputRef}
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Escribí tu mensaje..."
              style={styles.input}
              autoComplete="off"
            />
            <button type="submit" style={styles.sendButton}>Enviar</button>
          </form>
        </>
      )}
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    backgroundImage: 'url("/logo/Zodiacus.jpeg")',
    backgroundSize: 'cover',
    backgroundColor: 'transparent',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(1.05) contrast(1.1)',
    color: '#fff',
    minHeight: '100vh',
    position: 'relative',
    fontFamily: "'Poppins', sans-serif",
  },
  title: {
    fontSize: '2rem',
    color: '#FFFFFF',
    fontWeight: '700',
    fontStyle: 'italic',
    textAlign: 'center',
    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.85)',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    padding: '10px 20px',
    borderRadius: 12,
    marginBottom: 20,
    maxWidth: 500,
    marginLeft: 'auto',
    marginRight: 'auto',
  },
  usersBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.45)',
    padding: '10px 15px',
    borderRadius: 10,
    color: '#fff',
    maxWidth: 300,
    marginBottom: 20,
  },
  usersTitle: {
    fontSize: '1rem',
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 8,
  },
  usersList: {
    listStyle: 'none',
    paddingLeft: 0,
    margin: 0,
  },
  userItem: {
    fontSize: '0.95rem',
    marginBottom: 6,
    color: '#fff',
    fontWeight: '500',
    display: 'flex',
    alignItems: 'center',
  },
  userPhoto: {
    width: 32,
    height: 32,
    borderRadius: '50%',
    marginRight: 8,
    objectFit: 'cover',
    verticalAlign: 'middle',
    border: '2px solid #DAA520',
  },
  infoBox: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    color: '#fff',
    padding: 20,
    borderRadius: 12,
    maxWidth: 500,
    margin: '40px auto 0 auto',
    textAlign: 'center',
    boxShadow: '0 4px 12px rgba(0,0,0,0.3)',
  },
  infoTitle: {
    fontSize: '1.4rem',
    fontWeight: 'bold',
    color: '#DAA520',
    marginBottom: 10,
  },
  infoText: {
    fontSize: '1rem',
    fontStyle: 'italic',
    lineHeight: 1.5,
  },
  chatBox: {
    display: 'flex',
    flexDirection: 'column',
    border: '2px solid #DAA520',
    padding: 16,
    height: 420,
    overflowY: 'auto',
    marginBottom: 20,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    color: '#333',
    borderRadius: 12,
    boxShadow: '0 8px 16px rgba(0, 0, 0, 0.25)',
  },
  messageItem: {
    borderRadius: 16,
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    padding: 12,
    maxWidth: '75%',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s ease',
    wordBreak: 'break-word',
  },
  messagePhoto: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #DAA520',
    flexShrink: 0,
  },
  messageUserName: {
    fontWeight: '700',
    color: '#4B0082',
    textShadow: '1px 1px 4px rgba(0,0,0,0.25)',
    marginBottom: 4,
    display: 'flex',
    alignItems: 'center',
    gap: 6,
    fontSize: '0.9rem',
  },
  messageText: {
    fontSize: '1rem',
    color: '#333',
    whiteSpace: 'pre-wrap',
    wordBreak: 'break-word',
  },
  messageFooter: {
    marginTop: 6,
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#666',
    fontStyle: 'italic',
  },
  likeContainer: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
  },
  likeButton: {
    fontSize: '1.3rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    userSelect: 'none',
    transition: 'transform 0.2s ease',
  },
  likeCount: {
    fontSize: '0.9rem',
    color: '#4B0082',
    fontWeight: '600',
    userSelect: 'none',
  },
  emojiToggleButton: {
    fontSize: '1.5rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    marginBottom: 5,
    color: '#4B0082',
  },
  emojiPickerContainer: {
    position: 'absolute',
    zIndex: 100,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: '12px',
    backdropFilter: 'blur(6px)',
    padding: '8px',
    boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
  },
  form: {
    display: 'flex',
    alignItems: 'center',
    gap: 8,
    marginTop: 20,
  },
  input: {
    flex: 1,
    padding: 10,
    fontSize: '1rem',
    borderRadius: 10,
    border: '2px solid #DAA520',
    outline: 'none',
    backgroundColor: 'white',
    color: '#4B0082',
    fontWeight: '600',
    boxShadow: '0 3px 8px rgba(0, 0, 0, 0.25)',
    transition: 'border-color 0.3s ease',
  },
  sendButton: {
    padding: '10px 20px',
    backgroundColor: '#DAA520',
    color: '#4B0082',
    border: 'none',
    borderRadius: 10,
    fontWeight: 'bold',
    cursor: 'pointer',
    boxShadow: '0 3px 8px rgba(218, 165, 32, 0.8)',
    transition: 'background-color 0.3s ease',
  },
  backButton: {
    position: 'absolute',
    top: 20,
    left: 20,
    backgroundColor: '#DAA520',
    color: '#4B0082',
    border: 'none',
    borderRadius: 8,
    padding: '10px 15px',
    fontWeight: 'bold',
    cursor: 'pointer',
    zIndex: 10,
  },
};

export default ZodiacRouletteRoom;