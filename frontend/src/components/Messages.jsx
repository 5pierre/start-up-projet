import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages } from '../services/messageService';
import { initiateSocketConnection, getSocket } from '../services/socketService';
import RateUserForm from './RateUserForm'; // Import du formulaire de notation
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import '../styles/RegisterStyle.css';
import './Messages.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id, 10);
  const navigate = useNavigate();
  
  // Récupération de l'ID connecté pour vérifier les permissions de notation
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  
  // État pour le Popup de notation
  const [showRatePopup, setShowRatePopup] = useState(false);
  
  // 1. Charger l'historique (via API REST)
  const messagesEndRef = useRef(null);

  const loadMessages = async () => {
    if (!user2Id) return;
    try {
      setLoading(true);
      const data = await getMessages(user2Id);
      setMessages(data.messages || []);
      setError(null);
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadMessages();
  }, [user2Id]);

  // 2. Gestion WebSocket
  useEffect(() => {
    if (!user2Id) return;
    const socket = initiateSocketConnection();

    socket.on('receive_message', (newMessage) => {
      if (
        newMessage.id_user_1 === user2Id ||
        newMessage.id_user_2 === user2Id
      ) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });

    return () => socket.off('receive_message');
  }, [user2Id]);

  // 3. Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Envoyer un message (WebSocket)
  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', {
        toUserId: user2Id,
        content: content.trim(),
      });
      setContent('');
    } else {
      setError('Connexion au chat indisponible.');
    }
  };

  // Logique pour savoir si on peut noter (Connecté + Pas soi-même)
  const canRate = currentUserId && user2Id && currentUserId !== user2Id;

  // Essayer de trouver le nom de l'interlocuteur pour un affichage plus sympa
  const targetUserName =
    messages.find(
      (m) => m.id_user_1 === user2Id || m.id_user_2 === user2Id
    )?.sender_name || `Utilisateur ${user2Id}`;

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}

      <div className="page-messages">
        <div className="messages-wrap">

          {/* HEADER */}
          <div className="messages-header">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/')}
            >
              ← Retour
            </button>

            <h1 className="messages-title">
              Discussion avec {targetUserName}
            </h1>

            {/* Bouton Noter */}
            {canRate && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRatePopup(true)}
              >
                Noter ⭐
              </button>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="alert alert-error" style={{ marginBottom: '20px' }}>
              {error}
            </div>
          )}

          {/* Chargement */}
          {loading && (
            <div className="messages-loading">Chargement…</div>
          )}

          {/* ZONE DE CHAT */}
          {!loading && (
            <div className="messages-chat">
              {messages.length === 0 ? (
                <div className="messages-chat-empty">
                  Aucun message. Commencez la conversation !
                </div>
              ) : (
                messages.map((msg, index) => {
                  const isMe = msg.id_user_1 !== user2Id;

                  return (
                    <div
                      key={index}
                      className={`message-bubble-wrap ${
                        isMe ? '' : 'other'
                      }`}
                    >
                      <div className="message-bubble">
                        {msg.content}
                      </div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

          {/* ZONE DE SAISIE */}
          {!loading && (
            <form onSubmit={handleSend} className="messages-form">
              <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrire un message…"
                className="input100"
              />
              <button type="submit" className="btn btn-primary">
                Envoyer
              </button>
            </form>
          )}

          {/* POPUP DE NOTATION */}
          {showRatePopup && (
            <div
              className="popup-overlay"
              onClick={() => setShowRatePopup(false)}
            >
              <div
                className="popup-content"
                onClick={(e) => e.stopPropagation()}
              >
                <RateUserForm
                  ratedUserId={user2Id}
                  ratedUserName={targetUserName}
                  onClose={() => setShowRatePopup(false)}
                  onSuccess={() => setShowRatePopup(false)}
                />
              </div>
            </div>
          )}

        </div>
      </div>

      <Footer />
    </>
  );
}
