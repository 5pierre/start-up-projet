import React, { useState, useEffect } from 'react';
import { getMessages, postMessage } from '../services/messageService';

export default function Messages({ user2Id }) {
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);

  const loadMessages = async () => {
    try {
      const data = await getMessages();
      setMessages(data.messages || []);
    } catch (err) {
      console.error('Erreur API:', err);
      setError(err.message);
    }
  };

  const handleSend = async () => {
    if (!content.trim()) return;
    try {
      await postMessage(content);
      setContent('');
      loadMessages(); // recharge la liste
    } catch (err) {
      console.error('Erreur en envoyant le message:', err);
      setError(err.message);
    }
  };

  useEffect(() => {
    loadMessages();
  }, []);

  return (
    <div style={{ padding: '20px' }}>
      <h2>Messages</h2>
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
