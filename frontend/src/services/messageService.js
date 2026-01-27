// Vérifiez votre variable .env ou ajoutez /api/message ici
const BASE_URL_MESSAGE = (process.env.REACT_APP_API_MESSAGE_URL || 'http://localhost:5000') + '/api/message'; 

export const getMessages = async () => {
  // Appelle maintenant http://localhost:5000/api/message/messages
  const response = await fetch(`${BASE_URL_MESSAGE}/messages`, { 
    method: 'GET',
    credentials: 'include',
  });
  if (!response.ok) throw new Error('Erreur API: ' + response.statusText);
  return response.json();
};

export const postMessage = async (content, user2Id) => {
  // Correction du nom de la variable (suppression du S)
  const response = await fetch(`${BASE_URL_MESSAGE}/messages`, { 
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify({ content, id_user_2: user2Id }),
    credentials: "include", // si cookies
  });
  return await response.json();
};

