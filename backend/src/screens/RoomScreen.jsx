import React from 'react';
import { useParams } from 'react-router-dom';
import ChatRoom from '../components/ChatRoom';

const RoomScreen = () => {
  const { signo } = useParams();

  // Capitalizar primera letra
  const displaySigno = signo.charAt(0).toUpperCase() + signo.slice(1);

  return (
    <div style={{ padding: 20 }}>
      <h2 style={{ color: '#DAA520' }}>Sala de {displaySigno}</h2>
      <p>Aquí podrás chatear e interactuar con personas de {displaySigno}.</p>

      <ChatRoom room={signo} />
    </div>
  );
};

export default RoomScreen;