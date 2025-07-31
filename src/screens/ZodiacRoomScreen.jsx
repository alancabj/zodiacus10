// screens/ZodiacRoomScreen.jsx
import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import jwtDecode from 'jwt-decode';

const ZodiacRoomScreen = () => {
  const { signo } = useParams();
  const navigate = useNavigate();
  const [user, setUser] = useState(null);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      try {
        const decoded = jwtDecode(token);
        setUser(decoded);
        console.log(decoded);

        if (decoded.zodiacSign.toLowerCase() !== signo.toLowerCase()) {
          alert('No podés entrar a esta sala. Solo está permitida para tu signo.');
          navigate('/rooms');
        }
      } catch (err) {
        console.error('Token inválido o no coincide el signo:', err);
        navigate('/login');
      }
    } else {
      navigate('/login');
    }
  }, [signo, navigate]);

  const handleBack = () => {
    navigate(-1);
  };

  if (!user) return <p>Cargando...</p>;

  return (
    <div style={styles.container}>
      <div style={styles.card}>
        <div style={styles.content}>
          <h1 style={styles.title}>Sala de {signo}</h1>
          <p style={styles.subtitle}>Bienvenido {user.fullName} ({user.zodiacSign})</p>
        </div>
      </div>
      <button onClick={handleBack} style={styles.backButton}>← Volver</button>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundImage: 'url("/logo/Zodiacus.jpeg")',
    backgroundSize: 'cover',
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    filter: 'brightness(1.05) contrast(1.1)',
    color: '#fff',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    textAlign: 'center',
  },
  card: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)',
    borderRadius: 15,
    padding: '40px 30px',
    width: '100%',
    maxWidth: 500,
    boxShadow: '0 8px 24px rgba(0,0,0,0.25)',
    color: '#4B0082',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  content: {
    textAlign: 'center',
  },
  title: {
    fontSize: '2.5rem',
    color: '#DAA520',
    marginBottom: 10,
  },
  subtitle: {
    fontSize: '1.2rem',
    color: '#4B0082',
  },
  backButton: {
    position: 'absolute',
    bottom: 20,
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

export default ZodiacRoomScreen;