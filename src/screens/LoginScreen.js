import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const LoginScreen = () => {
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  const [formData, setFormData] = useState({
    fullName: '',
    password: '',
  });

  const [error, setError] = useState('');

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/login`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(formData),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.message || 'Error en login');
        return;
      }

      login({
        userId: data.userId,
        fullName: formData.fullName,
        zodiacSign: data.zodiacSign,
        photoPath: data.photoPath,
      });

      localStorage.setItem('token', data.token);

      // Redirigir a selección de salas
      navigate('/home');
    } catch (err) {
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.backButtonWrapper}>
        <button onClick={() => navigate('/')} style={styles.backButton}>
          ⬅ Volver
        </button>
      </div>
      <div style={styles.sloganContainer}>
        <p style={styles.sloganText}>
          La red social con mayor win rate % de compatibilidad zodiacal.
        </p>
      </div>
      <form onSubmit={handleSubmit} style={styles.form}>
        <h2 style={styles.title}>Iniciar Sesión</h2>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Nombre Completo</label>
        <input
          type="text"
          name="fullName"
          value={formData.fullName}
          onChange={handleChange}
          style={styles.input}
          autoComplete="off"
          required
        />

        <label style={styles.label}>Contraseña</label>
        <input
          type="password"
          name="password"
          value={formData.password}
          onChange={handleChange}
          style={styles.input}
          autoComplete="off"
          required
        />

        <button type="submit" style={styles.button}>
          Entrar
        </button>

        <p style={styles.text}>
          ¿No tenés cuenta? <Link to="/register" style={styles.link}>Registrate acá</Link>
        </p>
      </form>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    backgroundImage: 'url("/logo/Zodiacus.jpeg")',
    backgroundSize: 'cover',
    backgroundColor: 'transparent', // Para fondo neutro si hay espacio vacío
    backgroundPosition: 'center',
    backgroundRepeat: 'no-repeat',
    backgroundImageRendering: 'auto',
    imageRendering: 'auto',
    filter: 'brightness(1.05) contrast(1.1)',
    display: 'flex',
    flexDirection: 'column',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  sloganContainer: {
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    borderRadius: 12,
    padding: '15px 20px',
    marginBottom: 30,
    maxWidth: 500,
    textAlign: 'center',
    boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
  },
  sloganText: {
    color: '#FFFFFF',
    fontSize: '1.4rem',
    fontWeight: '700',
    textShadow: '2px 2px 6px rgba(0, 0, 0, 0.85)',
    fontStyle: 'italic',
    fontFamily: "'Poppins', sans-serif",
  },
  form: {
    backgroundColor: 'rgba(255, 255, 255, 0.85)', // blanco con 85% de opacidad
    borderRadius: 15,
    padding: '40px 30px',
    width: '100%',
    maxWidth: 450,
    boxShadow: '0 8px 24px rgba(0,0,0,0.15)', // sombra suave
    color: '#4B0082',
    fontFamily: 'Segoe UI, Tahoma, Geneva, Verdana, sans-serif',
  },
  title: {
    textAlign: 'center',
    color: '#DAA520',
    marginBottom: 25,
    fontWeight: 'bold',
    fontSize: 28,
  },
  label: {
    display: 'block',
    marginBottom: 6,
    marginTop: 18,
    fontWeight: '600',
    fontSize: 14,
  },
  input: {
    width: '100%',
    padding: '10px 12px',
    borderRadius: 8,
    border: '2px solid #4B0082',
    fontSize: 16,
    outline: 'none',
    transition: 'border-color 0.3s ease',
  },
  button: {
    width: '100%',
    marginTop: 30,
    padding: '12px',
    borderRadius: 8,
    backgroundColor: '#DAA520',
    color: '#4B0082',
    fontWeight: 'bold',
    fontSize: 18,
    cursor: 'pointer',
    border: 'none',
    boxShadow: '0 4px 8px rgba(218, 165, 32, 0.6)',
    transition: 'background-color 0.3s ease',
  },
  text: {
    marginTop: 20,
    textAlign: 'center',
    fontSize: 14,
    color: '#555',
  },
  link: {
    color: '#DAA520',
    fontWeight: 'bold',
    textDecoration: 'none',
  },
  error: {
    backgroundColor: '#f44336',
    color: 'white',
    padding: '10px 15px',
    borderRadius: 8,
    textAlign: 'center',
    marginBottom: 15,
  },
  backButtonWrapper: {
    width: '100%',
    display: 'flex',
    justifyContent: 'flex-start',
    padding: '20px',
    position: 'absolute',
    top: 0,
    left: 0,
    zIndex: 10,
  },
  backButton: {
    backgroundColor: '#4B0082',
    color: 'white',
    border: 'none',
    borderRadius: 8,
    padding: '10px 16px',
    fontSize: 14,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
    fontWeight: 'bold',
  },
};

export default LoginScreen;