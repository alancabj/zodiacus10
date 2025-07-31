import React, { useContext, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";

const WelcomeScreen = () => {
  const navigate = useNavigate();
  const { user } = useContext(AuthContext);

  useEffect(() => {
    if (user) {
      navigate("/home");
    }
  }, [user, navigate]);

  return (
    <div
      style={{
        minHeight: "100vh",
        backgroundImage: 'url("/logo/Zodiacus.jpeg")',
        backgroundSize: "cover",
        backgroundPosition: "center",
        backgroundRepeat: "no-repeat",
        display: "flex",
        flexDirection: "column",
        alignItems: "center",
        justifyContent: "center",
        padding: "2rem",
        color: "#fff",
        textAlign: "center",
      }}
    >
      <h1 style={{ fontSize: "3rem", marginBottom: "1.5rem", color: "#DAA520" }}>
        Zodiacus
      </h1>
      <div style={{
        backgroundColor: 'rgba(0, 0, 0, 0.5)',
        borderRadius: 12,
        padding: '15px 20px',
        marginBottom: 30,
        maxWidth: 500,
        textAlign: 'center',
        boxShadow: '0 4px 10px rgba(0,0,0,0.4)',
      }}>
        <p style={{
          color: '#FFFFFF',
          fontSize: '1.4rem',
          fontWeight: '700',
          textShadow: '2px 2px 6px rgba(0, 0, 0, 0.85)',
          fontStyle: 'italic',
          fontFamily: "'Poppins', sans-serif",
          margin: 0,
        }}>
          Conecta con la gente según su signo zodiacal.
        </p>
      </div>

      <div
        style={{
          display: "flex",
          flexDirection: "column",
          gap: "1rem",
          width: "100%",
          maxWidth: "300px",
        }}
      >
        <button
          onClick={() => navigate("/login")}
          style={{
            backgroundColor: "#DAA520",
            color: "#4B0082",
            padding: "0.8rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Iniciar Sesión
        </button>

        <button
          onClick={() => navigate("/register")}
          style={{
            backgroundColor: "#DAA520",
            color: "#4B0082",
            padding: "0.8rem",
            border: "none",
            borderRadius: "8px",
            fontSize: "1rem",
            cursor: "pointer",
            fontWeight: "bold",
          }}
        >
          Registrarse
        </button>
      </div>
    </div>
  );
};

export default WelcomeScreen;