import io from 'socket.io-client';

let socket;

export const initiateSocketConnection = () => {
  // Le token est dans le cookie HttpOnly, socket.io l'enverra auto avec withCredentials
  if (socket) return socket;

  socket = io(process.env.REACT_APP_API_MESSAGE_URL || 'http://localhost:5000', {
    withCredentials: true, // IMPORTANT pour envoyer le cookie
    transports: ['websocket'] // Force websocket pour la perf
  });

  console.log('🔗 Connexion Socket initiée...');
  return socket;
};

export const disconnectSocket = () => {
  if (socket) {
      socket.disconnect();
      socket = null;
  }
};

export const getSocket = () => socket;