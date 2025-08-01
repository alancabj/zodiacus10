import React, { useState } from 'react';
import { useNavigate, Link } from 'react-router-dom';

const RegisterScreen = () => {
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    name: '',
    birthdate: '',
    password: '',
    confirmPassword: '',
    dni: null,
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);

  const handleChange = e => {
    const { name, value, files } = e.target;
    if (name === 'dni') {
      setFormData(prev => ({ ...prev, dni: files[0] }));
    } else {
      setFormData(prev => ({ ...prev, [name]: value }));
    }
  };

  const handleSubmit = async e => {
    e.preventDefault();
    setError('');

    if (!formData.name || !formData.birthdate || !formData.password || !formData.confirmPassword || !formData.dni) {
      setError('Por favor completá todos los campos.');
      return;
    }

    if (formData.password !== formData.confirmPassword) {
      setError('Las contraseñas no coinciden.');
      return;
    }

    try {
      setLoading(true);
      const formPayload = new FormData();
      formPayload.append('fullName', formData.name);
formPayload.append('dob', formData.birthdate);
      formPayload.append('password', formData.password);
      formPayload.append('dni', formData.dni);

      const res = await fetch(`${process.env.REACT_APP_API_URL}/auth/register`, {
        method: 'POST',
        body: formPayload,
      });

      const data = await res.json();
      setLoading(false);

      if (!res.ok) {
        setError(data.message || 'Error al registrar usuario.');
        return;
      }

      navigate('/login');
    } catch (err) {
      console.error(err);
      setLoading(false);
      setError('Error de conexión con el servidor.');
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.sloganContainer}>
        <p style={styles.sloganText}>
          La red social con mayor win rate % de compatibilidad zodiacal.
        </p>
      </div>
      <button onClick={() => navigate('/')} style={styles.backButton}>
        ⬅ Volver
      </button>
      <form onSubmit={handleSubmit} style={styles.form} encType="multipart/form-data">
        <h2 style={styles.title}>Registrarse</h2>

        {error && <div style={styles.error}>{error}</div>}

        <label style={styles.label}>Nombre Completo</label>
        <input
          type="text"
          name="name"
          placeholder="Tu nombre completo"
          value={formData.name}
          onChange={handleChange}
          style={styles.input}
          autoComplete="off"
        />

        <label style={styles.label}>Fecha de Nacimiento</label>
        <input
          type="date"
          name="birthdate"
          value={formData.birthdate}
          onChange={handleChange}
          style={styles.input}
        />

        <label style={styles.label}>Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showPassword ? 'text' : 'password'}
            name="password"
            placeholder="Tu contraseña"
            value={formData.password}
            onChange={handleChange}
            style={styles.input}
            autoComplete="off"
          />
          <span
            onClick={() => setShowPassword(!showPassword)}
            style={styles.toggleIcon}
          >
            {showPassword ? '🙈' : '👁️'}
          </span>
        </div>

        <label style={styles.label}>Confirmar Contraseña</label>
        <div style={{ position: 'relative' }}>
          <input
            type={showConfirmPassword ? 'text' : 'password'}
            name="confirmPassword"
            placeholder="Confirmá tu contraseña"
            value={formData.confirmPassword}
            onChange={handleChange}
            style={styles.input}
            autoComplete="off"
          />
          <span
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            style={styles.toggleIcon}
          >
            {showConfirmPassword ? '🙈' : '👁️'}
          </span>
        </div>

        {formData.confirmPassword && formData.confirmPassword !== formData.password && (
          <small style={{ color: 'red' }}>Las contraseñas no coinciden.</small>
        )}

        <label style={styles.label}>Subí tu DNI (imagen)</label>
        <input
          type="file"
          name="dni"
          accept="image/*"
          onChange={handleChange}
          style={{ marginTop: 5 }}
        />

        <button
          type="submit"
          disabled={loading}
          style={{
            ...styles.button,
            opacity: loading ? 0.6 : 1,
          }}
        >
          {loading ? 'Registrando...' : 'Registrarse'}
        </button>

        <p style={styles.text}>
          ¿Ya tenés cuenta?{' '}
          <Link to="/login" style={styles.link}>
            Iniciá sesión acá
          </Link>
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
  backgroundColor: 'transparent',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  backgroundImageRendering: 'auto',
  imageRendering: 'auto',
  filter: 'brightness(1.05) contrast(1.1)',
  display: 'flex',
  flexDirection: 'column',
  justifyContent: 'flex-start',  // cambio aquí
  alignItems: 'center',
  paddingTop: 60,                // agrega padding arriba
  paddingLeft: 20,
  paddingRight: 20,
  paddingBottom: 20,
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
  toggleIcon: {
    position: 'absolute',
    right: 10,
    top: '50%',
    transform: 'translateY(-50%)',
    cursor: 'pointer',
    color: '#DAA520',
    fontSize: 18,
  },
  backButton: {
    alignSelf: 'flex-start',
    marginBottom: 10,
    padding: '8px 14px',
    backgroundColor: '#4B0082',
    color: '#fff',
    fontWeight: 'bold',
    border: 'none',
    borderRadius: 6,
    cursor: 'pointer',
    boxShadow: '0 2px 6px rgba(0,0,0,0.3)',
  },
};

export default RegisterScreen;