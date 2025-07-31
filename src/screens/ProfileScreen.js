import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom'; // <-- Importar useNavigate
import { AuthContext } from '../context/AuthContext';

const API_BASE = 'https://zodiacus10-backend.up.railway.app';

const ProfileScreen = () => {
  const { user, refreshProfile } = useContext(AuthContext);
  const navigate = useNavigate(); // <-- Inicializar useNavigate

  const [fullName, setFullName] = useState('');
  const [bio, setBio] = useState('');
  const [photo, setPhoto] = useState(null);
  const [previewPhoto, setPreviewPhoto] = useState(null);
  const [message, setMessage] = useState('');
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (user) {
      setFullName(user.fullName || '');
      setBio(user.bio || '');
      setPreviewPhoto(user.photoPath ? `${API_BASE}/${user.photoPath}` : null);
    }
  }, [user]);

  const handlePhotoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setPhoto(file);
      setPreviewPhoto(URL.createObjectURL(file));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setMessage('');
    setLoading(true);

    try {
      const token = localStorage.getItem('token');
      if (!token) {
        setMessage('No autorizado');
        setLoading(false);
        return;
      }

      const formData = new FormData();
      formData.append('fullName', fullName);
      formData.append('bio', bio);
      if (photo) {
        formData.append('photo', photo);
      }

      const res = await fetch(`${API_BASE}/api/auth/profile`, {
        method: 'PUT',
        headers: {
          'Authorization': `Bearer ${token}`,
        },
        body: formData,
      });

      if (res.ok) {
        setMessage('Perfil actualizado correctamente.');
        await refreshProfile();
        setPreviewPhoto(null);
      } else {
        setMessage('Error al actualizar perfil.');
      }
    } catch (error) {
      setMessage('Error de conexión con el servidor.');
    } finally {
      setLoading(false);
    }
  };

  // Función para volver atrás
  const handleGoBack = () => {
    navigate(-1);
  };

  return (
    <div style={styles.container}>
      {/* Botón Volver */}
      <button onClick={handleGoBack} style={styles.backButton}>
        ← Volver
      </button>

      <h2 style={styles.title}>Mi Perfil</h2>

      <form onSubmit={handleSubmit} style={styles.form}>
        <label style={styles.label}>
          Nombre completo:
          <input
            type="text"
            value={fullName}
            onChange={e => setFullName(e.target.value)}
            style={styles.input}
            placeholder="Tu nombre completo"
            required
          />
        </label>

        <label style={styles.label}>
          Bio:
          <textarea
            value={bio}
            onChange={e => setBio(e.target.value)}
            style={styles.textarea}
            placeholder="Cuéntanos sobre vos"
            rows={4}
          />
        </label>

        <label style={styles.label}>
          Foto de perfil:
          <input
            type="file"
            accept="image/*"
            onChange={handlePhotoChange}
            style={styles.fileInput}
          />
        </label>

        {previewPhoto && (
          <div style={styles.previewContainer}>
            <img
              src={previewPhoto}
              alt="Preview"
              style={styles.previewImage}
              onError={() => console.warn('No se pudo cargar la foto de perfil desde:', previewPhoto)}
            />
          </div>
        )}

        <button type="submit" style={styles.button} disabled={loading}>
          {loading ? 'Actualizando...' : 'Actualizar Perfil'}
        </button>
      </form>

      {message && <p style={styles.message}>{message}</p>}
    </div>
  );
};

const styles = {
  container: {
    maxWidth: 500,
    margin: '2rem auto',
    padding: '2rem',
    backgroundColor: '#4B0082',
    borderRadius: '12px',
    color: '#DAA520',
    boxShadow: '0 0 10px rgba(218, 165, 32, 0.7)',
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
  },
  title: {
    textAlign: 'center',
    marginBottom: '1.5rem',
    fontWeight: 'bold',
    fontSize: '2rem',
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
  },
  label: {
    marginBottom: '1rem',
    fontWeight: '600',
    display: 'flex',
    flexDirection: 'column',
    fontSize: '1rem',
  },
  input: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    backgroundColor: '#DAA520',
    color: '#4B0082',
    fontWeight: 'bold',
  },
  textarea: {
    marginTop: '0.5rem',
    padding: '0.5rem',
    borderRadius: '8px',
    border: 'none',
    fontSize: '1rem',
    resize: 'vertical',
    backgroundColor: '#DAA520',
    color: '#4B0082',
    fontWeight: 'bold',
  },
  fileInput: {
    marginTop: '0.5rem',
    color: '#DAA520',
  },
  previewContainer: {
    marginBottom: '1rem',
    textAlign: 'center',
  },
  previewImage: {
    width: 120,
    height: 120,
    objectFit: 'cover',
    borderRadius: '50%',
    border: '3px solid #DAA520',
  },
  button: {
    backgroundColor: '#DAA520',
    color: '#4B0082',
    fontWeight: 'bold',
    padding: '0.75rem',
    fontSize: '1rem',
    border: 'none',
    borderRadius: '12px',
    cursor: 'pointer',
    transition: 'background-color 0.3s ease',
  },
  message: {
    marginTop: '1rem',
    textAlign: 'center',
    fontWeight: '600',
  },
};

export default ProfileScreen;