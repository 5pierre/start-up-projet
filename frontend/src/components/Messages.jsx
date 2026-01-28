import React, { useState, useEffect, useRef } from 'react'; // ✅ Ajout de useRef
import { getMessages } from '../services/messageService'; // On garde getMessages pour l'historique
import { useParams, useNavigate } from 'react-router-dom'; 
import { initiateSocketConnection, getSocket } from '../services/socketService';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id); // On s'assure que c'est un entier
  const navigate = useNavigate();
  
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  
  // ✅ Référence pour le scroll automatique
  const messagesEndRef = useRef(null);

  // 1. Charger l'historique au démarrage (via API REST)
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

  useEffect(() => {
    loadMessages();
  }, [user2Id]);

  // 2. Gestion WebSocket (Écoute des messages)
  useEffect(() => {
    if (!user2Id) return;

    // Connexion
    const socket = initiateSocketConnection();

    // Écouter les messages entrants
    socket.on('receive_message', (newMessage) => {
        // On vérifie que le message appartient bien à CETTE conversation
        // (Soit l'autre m'écrit, soit c'est mon message qui revient confirmé par le serveur)
        if (
            (newMessage.id_user_1 === user2Id) || 
            (newMessage.id_user_2 === user2Id)
        ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
    });

    // Nettoyage
    return () => {
        socket.off('receive_message');
    };
  }, [user2Id]);

  // 3. Scroll automatique vers le bas
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // 4. Envoyer un message (Via WebSocket uniquement)
  const handleSend = (e) => {
    e.preventDefault(); // Empêche le rechargement du formulaire
    if (!content.trim()) return;

    const socket = getSocket();
    if (socket) {
        socket.emit('send_message', {
            toUserId: user2Id,
            content: content
        });
        // On vide l'input immédiatement pour la fluidité
        setContent('');
    } else {
        console.error("Socket non connecté");
        setError("Erreur de connexion au chat");
    }
  };

  return (
    <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh' }}>
      <button onClick={() => navigate('/')} style={{ alignSelf: 'flex-start', marginBottom: '10px', cursor: 'pointer' }}>
        ⬅ Retour aux histoires
      </button>

      <h2>Discussion avec l'utilisateur {user2Id}</h2>
      {error && <p style={{ color: 'red' }}>{error}</p>}

      {/* ZONE DE CHAT SCROLLABLE */}
      <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
        
        {messages.map((msg, index) => {
            // Est-ce moi qui parle ? (Si l'expéditeur n'est PAS l'interlocuteur user2Id)
            const isMe = msg.id_user_1 !== user2Id;
            
            return (
                <div key={index} style={{ 
                    display: 'flex', 
                    justifyContent: isMe ? 'flex-end' : 'flex-start',
                    marginBottom: '10px'
                }}>
                    <div style={{ 
                        maxWidth: '70%',
                        padding: '10px 15px',
                        borderRadius: '20px',
                        // Bleu pour moi, Gris pour l'autre
                        backgroundColor: isMe ? '#007bff' : '#e5e5ea',
                        color: isMe ? 'white' : 'black',
                        textAlign: 'left',
                        boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
                    }}>
                        {msg.content}
                    </div>
                </div>
            );
        })}
        
        {/* ✅ L'élément invisible pour scroller en bas */}
        <div ref={messagesEndRef} />
      </div>

      {/* ZONE DE SAISIE (FORMULAIRE) */}
      <form onSubmit={handleSend} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
        <input
            type="text"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            placeholder="Écrire un message..."
            style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
        />
        <button type="submit" style={{ padding: '10px 20px', borderRadius: '20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
            Envoyer 🚀
        </button>
      </form>
    </div>
  );
}