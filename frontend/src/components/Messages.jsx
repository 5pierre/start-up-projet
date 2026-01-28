import React, { useState, useEffect } from 'react';
import { getMessages, postMessage } from '../services/messageService';
import { useParams, useNavigate } from 'react-router-dom'; 

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const loadMessages = async () => {
    if (!user2Id) return;
    try {
      const data = await getMessages(user2Id);
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.message);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await postMessage(content, user2Id);
      setContent('');
      loadMessages(); // recharge la liste
    } catch (err) {
      console.error('Erreur en envoyant le message:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user2Id]);

  return (
    <div style={{ padding: '20px' }}>
      {/* Bouton retour pour revenir aux histoires */}
      <button onClick={() => navigate('/')} style={{ marginBottom: '10px', cursor: 'pointer' }}>
        ⬅ Retour aux histoires
      </button>

      <h2>Discussion avec l'utilisateur {user2Id}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}
      <div style={{ border: '1px solid gray', padding: '10px', marginBottom: '10px', height: '300px', overflowY: 'scroll' }}>
        {messages.map((msg) => (
          <div key={msg.id}>
            <strong>{msg.id_user_1}</strong>: {msg.content}
          </div>
        ))}
      </div>

      
      <input
        type="text"
        value={content}
        onChange={(e) => setContent(e.target.value)}
        placeholder="Écrire un message..."
        style={{ width: '70%', padding: '5px' }}
      />
      <button onClick={handleSend} style={{ padding: '5px 10px', marginLeft: '10px' }}>
        Envoyer
      </button>
    </div>
  );
}
