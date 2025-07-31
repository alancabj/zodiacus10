import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';

const HomeScreen = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  const handleGoToRooms = () => {
    navigate('/rooms');
  };

  const handleGoToProfile = () => {
    navigate('/profile');
  };

  const handleGoToRoulette = () => {
    navigate('/zodiac-roulette');
  };

  if (!user) {
    return <p>Cargando datos del usuario...</p>;
  }

  return (
    <div style={containerStyle}>
      <div style={overlayStyle}>
        <div style={cardStyle}>
          <h1 style={{ color: '#DAA520' }}>¡Bienvenido, {user.fullName}!</h1>
          <p style={sloganStyle}>
            La red social con mayor win rate % de compatibilidad zodiacal.
          </p>
          <p style={{ fontSize: '1.2rem' }}>
            Tu signo zodiacal es <strong>{user.zodiacSign}</strong>
          </p>
          <div style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', gap: '1rem', alignItems: 'center' }}>
            <button
              onClick={handleGoToProfile}
              style={buttonStyle}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,165,32,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = buttonStyle.boxShadow;
              }}
            >
              Mi Perfil
            </button>
            <button
              onClick={handleGoToRooms}
              style={buttonStyle}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,165,32,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = buttonStyle.boxShadow;
              }}
            >
              Salas de los signos
            </button>
            <button
              onClick={handleGoToRoulette}
              style={buttonStyle}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(218,165,32,0.4)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = buttonStyle.boxShadow;
              }}
            >
              🎲 Ruleta Zodiacal
            </button>
            <button
              onClick={handleLogout}
              style={{ ...buttonStyle, backgroundColor: '#ccc', color: '#4B0082' }}
              onMouseOver={e => {
                e.currentTarget.style.transform = 'scale(1.05)';
                e.currentTarget.style.boxShadow = '0 8px 24px rgba(76,0,130,0.12)';
              }}
              onMouseOut={e => {
                e.currentTarget.style.transform = 'scale(1)';
                e.currentTarget.style.boxShadow = buttonStyle.boxShadow;
              }}
            >
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

const containerStyle = {
  height: '100vh',
  backgroundImage: 'url("/logo/Zodiacus.jpeg")',
  backgroundSize: 'cover',
  backgroundPosition: 'center',
  backgroundRepeat: 'no-repeat',
  color: '#fff',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  textAlign: 'center',
  padding: '2rem',
  position: 'relative',
};

const overlayStyle = {
  background: 'rgba(40, 0, 60, 0.65)',
  borderRadius: '22px',
  boxShadow: '0 8px 32px 0 rgba(31, 38, 135, 0.22)',
  padding: '2.5rem',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  width: '100%',
  maxWidth: '520px',
  margin: '0 auto',
};

const sloganStyle = {
  fontSize: '1.4rem',
  color: '#FFFFFF',
  fontWeight: '700',
  textShadow: '2px 2px 6px rgba(0, 0, 0, 0.85)',
  fontStyle: 'italic',
  fontFamily: "'Poppins', sans-serif",
  margin: '0.5rem 0 1.5rem 0',
};

const buttonStyle = {
  width: 220,
  padding: '1rem',
  backgroundColor: '#DAA520',
  color: '#4B0082',
  border: 'none',
  borderRadius: '12px',
  fontSize: '1rem',
  cursor: 'pointer',
  fontWeight: 'bold',
  boxShadow: '0 4px 10px rgba(0, 0, 0, 0.4)',
  transition: 'transform 0.2s ease, background-color 0.3s ease, box-shadow 0.3s ease',
};

const cardStyle = {
  backgroundColor: 'rgba(255, 255, 255, 0.85)',
  color: '#4B0082',
  borderRadius: '16px',
  padding: '40px 30px',
  maxWidth: '450px',
  width: '90%',
  boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

export default HomeScreen;