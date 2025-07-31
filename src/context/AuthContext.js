import React, { createContext, useState, useEffect } from 'react';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(() => {
    const savedUser = localStorage.getItem('user');
    return savedUser ? JSON.parse(savedUser) : null;
  });

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem('user', JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem('user');
    localStorage.removeItem('token');
  };

  // Refrescar perfil desde backend
 const refreshProfile = async () => {
  const token = localStorage.getItem('token');
  if (!token) return;

  try {
    const res = await fetch('https://zodiacus-api-production.up.railway.app/api/auth/profile', {
      headers: {
        'Authorization': `Bearer ${token}`,
      }
    });

    console.log('refreshProfile status:', res.status);
    console.log('refreshProfile content-type:', res.headers.get('content-type'));

    if (!res.ok) {
      // Intentamos obtener el texto para mostrar qué error envió el backend
      const errorText = await res.text();
      console.error('Error response text:', errorText);
      throw new Error(`HTTP error! status: ${res.status}`);
    }

    const contentType = res.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      const text = await res.text();
      console.error('Response text when expected JSON:', text);
      throw new Error('Respuesta no es JSON');
    }

    const data = await res.json();
    setUser(data);
    localStorage.setItem('user', JSON.stringify(data));
  } catch (error) {
    console.error('Error refrescando perfil:', error);
  }
};
  useEffect(() => {
    refreshProfile();
  }, []);

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshProfile }}>
      {children}
    </AuthContext.Provider>
  );
};