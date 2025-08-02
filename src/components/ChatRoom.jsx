import React, { useEffect, useState, useRef, useMemo } from 'react';
import { io } from 'socket.io-client';
import { useNavigate } from 'react-router-dom';
import EmojiPicker from 'emoji-picker-react';

const SOCKET_SERVER_URL = 'http://192.168.0.20:5001';  // pon tu IP local
const BASE_URL = 'http://192.168.0.20:5001/uploads/';

const signosEmoji = {
  aries: '♈', tauro: '♉', geminis: '♊', cancer: '♋', leo: '♌',
  virgo: '♍', libra: '♎', escorpio: '♏', sagitario: '♐',
  capricornio: '♑', acuario: '♒', piscis: '♓'
};

const ChatRoom = ({ room }) => {
  const [message, setMessage] = useState('');
  const [messages, setMessages] = useState([]);
  const [usersRaw, setUsersRaw] = useState([]);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const emojiPickerRef = useRef(null);
  const [likedMessages, setLikedMessages] = useState({});
  const chatEndRef = useRef(null);
  const inputRef = useRef(null);
  const socketRef = useRef();
  const navigate = useNavigate();

  useEffect(() => {
    const token = localStorage.getItem('token');
    const storedUser = JSON.parse(localStorage.getItem('user'));
    const fullName = storedUser?.fullName || 'Anónimo';
    const zodiacSign = storedUser?.zodiacSign || '';

    socketRef.current = io(SOCKET_SERVER_URL, {
      auth: { token },
    });

    socketRef.current.emit('joinRoom', { room, fullName, zodiacSign, photoPath: storedUser?.photoPath || '' });

    socketRef.current.on('message', (msg) => {
      // Si el mensaje tiene una foto relativa, convertimos a absoluta
      if (msg.photo && !msg.photo.startsWith('http')) {
        msg.photo = `${BASE_URL}${msg.photo.replace(/^\/?uploads\//, '')}`;
      }

      // Guardar copia estática de usuario y foto solo si aún no existe
      if (!msg.snapshotUser) {
        msg.snapshotUser = {
          fullName: msg.user,
          photo: msg.photo
        };
      }

      setMessages((prev) => [...prev, msg]);
      setTimeout(() => {
        chatEndRef.current?.scrollIntoView({ behavior: 'smooth' });
      }, 50);
    });

    socketRef.current.on('roomUsers', (usersList) => {
      setUsersRaw((prevUsers) => {
        const currentNames = new Set(usersList.map((u) => u.fullName));
        // Mantener copias estáticas de usuarios desconectados usados en mensajes anteriores
        const preserved = messages
          .filter((m) => m.snapshotUser)
          .map((m) => ({
            fullName: m.snapshotUser.fullName,
            zodiacSign: '',
            photoPath: m.snapshotUser.photo,
          }))
          .filter((u, i, arr) => arr.findIndex(v => v.fullName === u.fullName) === i); // eliminar duplicados

        const combined = usersList.map((u) => ({
          ...u,
          photoPath: u.photoPath?.startsWith('http')
            ? u.photoPath
            : `${BASE_URL}${u.photoPath?.replace(/^\/?uploads\//, '') || ''}`,
        }));

        preserved.forEach((u) => {
          if (!combined.find((cu) => cu.fullName === u.fullName)) {
            combined.push(u);
          }
        });

        return combined;
      });
    });

    socketRef.current.on('userLeft', ({ userId, fullName, message }) => {
      setUsersRaw(prev => {
        const existing = prev.find(u => u.fullName === fullName);
        if (existing) {
          return prev.map(u =>
            u.fullName === fullName
              ? { ...u, disconnected: true }
              : u
          );
        } else {
          // Buscar en mensajes previos si hay snapshot del usuario
          const snapshot = messages.find(m => m.snapshotUser?.fullName === fullName)?.snapshotUser;
          if (snapshot) {
            return [
              ...prev,
              {
                fullName,
                zodiacSign: '',
                photoPath: snapshot.photo,
                disconnected: true,
              }
            ];
          }
          return prev;
        }
      });

      setMessages(prev => [
        ...prev,
        {
          id: `left-${Date.now()}`,
          user: 'Sistema',
          text: message,
          timestamp: new Date().toISOString(),
          system: true,
          photo: '',
        }
      ]);
    });

    const handleClickOutside = (e) => {
      if (emojiPickerRef.current && !emojiPickerRef.current.contains(e.target)) {
        setShowEmojiPicker(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      socketRef.current.disconnect();
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [room]);

  const users = useMemo(() => {
    return usersRaw.map(u => {
      const cleanSign = (u.zodiacSign || '')
        .toLowerCase()
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '');

      let photoPath = u.photoPath || '/default-profile.png';

      return {
        ...u,
        emoji: signosEmoji[cleanSign] || '',
        photoPath,
      };
    });
  }, [usersRaw]);

  const sendMessage = (e) => {
  e.preventDefault();
  if (message.trim() === '') return;

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const photoPath = storedUser?.photoPath || '';

  socketRef.current.emit('chatMessage', {
    room,
    text: message.trim().replace(/[\n\r\\]+/g, ''),
    photoPath,
    fullName: storedUser?.fullName || 'Anónimo'  // opcional si lo necesitas en el backend
  });

  setMessage('');
};

  const handleBack = () => {
    navigate(-1);
  };

  const handleImgError = (e) => {
    e.currentTarget.onerror = null;
    if (!e.currentTarget.dataset.fallback) {
      e.currentTarget.dataset.fallback = 'true';
      e.currentTarget.src = '/default-profile.png';
    }
  };

  const toggleLike = (index) => {
    setLikedMessages((prev) => ({
      ...prev,
      [index]: !prev[index],
    }));
  };

  const addEmoji = (emojiData) => {
    setMessage((prev) => prev + emojiData.emoji);
    setShowEmojiPicker(false);
    inputRef.current?.focus();
  };

  const storedUser = JSON.parse(localStorage.getItem('user'));
  const currentUser = storedUser?.fullName || 'Anónimo';

  return (
    <div style={styles.container}>
      <button onClick={handleBack} style={styles.backButton}>
        ← Volver
      </button>

      <h2 style={styles.title}>
        Bienvenido a la sala: {room.charAt(0).toUpperCase() + room.slice(1)}
      </h2>
      <p style={{ color: '#fff', fontWeight: 'bold', textAlign: 'center', marginBottom: 12 }}>
  Conectado como: {currentUser}
</p>

      <div style={styles.usersBox}>
        <h4 style={styles.usersTitle}>Usuarios conectados:</h4>
        {users.length === 0 ? (
          <p style={styles.usersText}>No hay usuarios</p>
        ) : (
          <ul style={styles.usersList}>
            {users.map((u) => (
              <li key={u._id || u.id || u.fullName} style={styles.userItem}>
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
        {messages.map((msg, i) => {
      // Usar snapshotUser si existe, para mostrar nombre/foto estáticos del mensaje
      let user = users.find(u => u.fullName === msg.user);
      const photo = msg.snapshotUser?.photo || user?.photoPath || '/default-profile.png';
      const emoji = user?.emoji || '';
      const displayName = msg.snapshotUser?.fullName || msg.user || 'Anon';

          if (msg.system) {
            return (
              <div
                key={i}
                style={{
                  alignSelf: 'center',
                  marginBottom: 10,
                  fontStyle: 'italic',
                  color: '#666',
                  fontSize: '0.9rem',
                }}
              >
                {msg.text}
              </div>
            );
          }

          return (
            <div
              key={i}
              style={{
                ...styles.messageItem,
                alignSelf: 'flex-start',
                background: styles.messageItem.background,
                boxShadow: styles.messageItem.boxShadow,
                borderTopRightRadius: 10,
                borderTopLeftRadius: 10,
                opacity: 0,
                animation: 'fadeSlideIn 0.3s forwards',
                animationDelay: `${i * 100}ms`,
              }}
            >
              <img
                src={photo}
                alt={`${displayName} foto`}
                style={styles.messagePhoto}
                onError={handleImgError}
              />
              <div style={{ maxWidth: '70vw', wordBreak: 'break-word' }}>
                <div style={styles.messageUserName}>
                  {displayName} {emoji && <span style={{ marginLeft: 5 }}>{emoji}</span>}
                </div>
                <div style={styles.messageText}>{msg.text || '(sin texto)'}</div>
                <div style={styles.messageTime}>{new Date(msg.timestamp).toLocaleTimeString()}</div>
              </div>
              <div style={styles.likeContainer}>
                <button
                  onClick={() => toggleLike(i)}
                  style={{
                    fontSize: '1.4rem',
                    background: 'transparent',
                    border: 'none',
                    cursor: 'pointer',
                    padding: 0,
                    lineHeight: 1,
                    userSelect: 'none',
                    animation: likedMessages[i] ? 'pop 0.3s ease' : 'none',
                  }}
                  aria-label={likedMessages[i] ? 'Quitar like' : 'Dar like'}
                >
                  {likedMessages[i] ? '❤️' : '🤍'}
                </button>
                <span style={styles.likeCount}>{likedMessages[i] ? 1 : 0}</span>
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
          style={{
            fontSize: '1.5rem',
            background: 'transparent',
            border: 'none',
            cursor: 'pointer',
            marginBottom: 5,
          }}
          aria-label="Mostrar/ocultar selector de emojis"
        >
          😀
        </button>
        {showEmojiPicker && (
          <div
            ref={emojiPickerRef}
            style={{
              position: 'absolute',
              zIndex: 100,
              backgroundColor: 'rgba(255, 255, 255, 0.9)',
              borderRadius: '12px',
              backdropFilter: 'blur(6px)',
              padding: '8px',
              boxShadow: '0 6px 16px rgba(0, 0, 0, 0.3)',
            }}
          >
            <EmojiPicker 
              onEmojiClick={addEmoji}
              locale="es"
              lazyLoadEmojis={true}
              localization={{
                search: "Buscar",
                clear: "Limpiar",
                notFound: "No se encontraron emojis",
                categories: {
                  recent: "Recientes",
                  smileys_people: "Emoticonos y personas",
                  animals_nature: "Animales y naturaleza",
                  food_drink: "Comida y bebida",
                  travel_places: "Viajes y lugares",
                  activities: "Actividades",
                  objects: "Objetos",
                  symbols: "Símbolos",
                  flags: "Banderas",
                  skin_tones: "Tonos de piel"
                }
              }}
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
        <button type="submit" style={styles.sendButton}>
          Enviar
        </button>
      </form>

      <style>{`
        @keyframes fadeSlideIn {
          0% {
            opacity: 0;
            transform: translateX(-20px);
          }
          100% {
            opacity: 1;
            transform: translateX(0);
          }
        }
        @keyframes pop {
          0% { transform: scale(1); }
          50% { transform: scale(1.4); }
          100% { transform: scale(1); }
        }
      `}</style>
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
    alignSelf: 'flex-start',
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
    display: 'flex',
    alignItems: 'flex-start',
    gap: 12,
    marginBottom: 14,
    padding: 12,
    borderRadius: 12,
    background: 'linear-gradient(135deg, #fdfcfb 0%, #e2d1c3 100%)',
    boxShadow: '0 4px 8px rgba(0,0,0,0.1)',
    transition: 'background-color 0.3s ease',
  },
  messageUserName: {
    fontWeight: '700',
    textShadow: '1px 1px 4px rgba(0,0,0,0.25)',
    color: '#4B0082',
    marginBottom: 4,
  },
  messageText: {
    fontSize: '0.95rem',
    color: '#333',
  },
  messageTime: {
    fontSize: '0.75rem',
    color: '#666',
    marginTop: 6,
  },
  messagePhoto: {
    width: 36,
    height: 36,
    borderRadius: '50%',
    objectFit: 'cover',
    border: '2px solid #DAA520',
  },
  likeContainer: {
    display: 'flex',
    alignItems: 'center',
    marginLeft: 12,
    gap: 6,
  },
  likeButton: {
    fontSize: '1.4rem',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    padding: 0,
    lineHeight: 1,
    userSelect: 'none',
  },
  likeCount: {
    fontSize: '0.9rem',
    color: '#4B0082',
    fontWeight: '600',
    userSelect: 'none',
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

export default ChatRoom;