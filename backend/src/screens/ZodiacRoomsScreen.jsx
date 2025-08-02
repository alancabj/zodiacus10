import React from 'react';
import { useNavigate } from 'react-router-dom';

const signos = [
  { name: 'Capricornio', emoji: '♑' },
  { name: 'Acuario', emoji: '♒' },
  { name: 'Piscis', emoji: '♓' },
  { name: 'Aries', emoji: '♈' },
  { name: 'Tauro', emoji: '♉' },
  { name: 'Géminis', emoji: '♊' },
  { name: 'Cáncer', emoji: '♋' },
  { name: 'Leo', emoji: '♌' },
  { name: 'Virgo', emoji: '♍' },
  { name: 'Libra', emoji: '♎' },
  { name: 'Escorpio', emoji: '♏' },
  { name: 'Sagitario', emoji: '♐' },
];

const ZodiacRoomsScreen = () => {
  const navigate = useNavigate();

  const handleEnterRoom = (sign) => {
    navigate(`/rooms/${sign.toLowerCase()}`);
  };

  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      <div style={styles.centralContainer}>
        <button onClick={handleGoBack} style={styles.backButton}>⬅ Volver</button>
        <h1 style={styles.title}>Salas Zodiacales</h1>
        <div style={styles.grid}>
          {signos.map(({ name, emoji }) => (
            <div
              key={name}
              style={styles.card}
              onMouseEnter={e => { if (styles.card[':hover']) Object.assign(e.currentTarget.style, styles.card[':hover']); }}
              onMouseLeave={e => { Object.assign(e.currentTarget.style, styles.card); }}
            >
              <div style={styles.emoji}>{emoji}</div>
              <h2 style={styles.signName}>{name}</h2>
              <button
                style={styles.button}
                onMouseEnter={e => { if (styles.button[':hover']) Object.assign(e.currentTarget.style, styles.button[':hover']); }}
                onMouseLeave={e => { Object.assign(e.currentTarget.style, styles.button); }}
                onClick={() => handleEnterRoom(name)}
              >
                Entrar
              </button>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

const styles = {
  container: {
    padding: 20,
    minHeight: '100vh',
    color: 'white',
    backgroundImage: 'url("/logo/Zodiacus.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    position: 'relative',
  },
  centralContainer: {
    maxWidth: '1200px',
    width: '100%',
    margin: '0 auto',
    position: 'relative',
  },
  backButton: {
    backgroundColor: '#DAA520',
    color: '#4B0082',
    border: 'none',
    borderRadius: 8,
    padding: '8px 12px',
    cursor: 'pointer',
    fontWeight: 'bold',
    fontSize: '1rem',
    marginBottom: 20,
    position: 'absolute',
    top: 20,
    left: 20,
    zIndex: 10,
  },
  title: {
    backgroundColor: 'rgba(0,0,0,0.5)',
    borderRadius: 12,
    padding: '15px 20px',
    marginBottom: 30,
    fontSize: '3rem',
    fontWeight: 'bold',
    color: '#DAA520',
    textAlign: 'center',
    fontFamily: "'Poppins', sans-serif",
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  },
  grid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(160px, 1fr))',
    gap: 20,
    maxWidth: '100%',
    margin: '0 auto',
    padding: 20,
  },
  card: {
    backgroundColor: 'rgba(49, 27, 88, 0.85)',
    borderRadius: 12,
    padding: 20,
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(218, 165, 32, 0.5)',
    transition: 'transform 0.2s ease',
    cursor: 'pointer',
    backdropFilter: 'blur(4px)',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
  emoji: {
    fontSize: '4rem',
    marginBottom: 10,
  },
  signName: {
    marginBottom: 15,
    fontWeight: 'bold',
    fontSize: '1.1rem',
    color: '#DAA520',
    maxWidth: '100%',
    whiteSpace: 'nowrap',
    overflow: 'hidden',
    textOverflow: 'ellipsis',
    textAlign: 'center',
  },
  button: {
    backgroundColor: '#DAA520',
    border: 'none',
    borderRadius: 8,
    color: '#4B0082',
    fontWeight: 'bold',
    padding: '10px 15px',
    fontSize: '1rem',
    cursor: 'pointer',
    boxShadow: '0 4px 12px rgba(218, 165, 32, 0.4)',
    transition: 'transform 0.2s ease',
    ':hover': {
      transform: 'scale(1.05)',
    },
  },
};

export default ZodiacRoomsScreen;