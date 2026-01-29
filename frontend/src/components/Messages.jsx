import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { getMessages } from '../services/messageService';
import { initiateSocketConnection, getSocket } from '../services/socketService';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import '../styles/RegisterStyle.css';
import './Messages.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id, 10);
  const navigate = useNavigate();
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
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

  useEffect(() => {
    if (!user2Id) return;
    const socket = initiateSocketConnection();
    socket.on('receive_message', (newMessage) => {
      if (newMessage.id_user_1 === user2Id || newMessage.id_user_2 === user2Id) {
        setMessages((prev) => [...prev, newMessage]);
      }
    });
    return () => socket.off('receive_message');
  }, [user2Id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;
    const socket = getSocket();
    if (socket) {
      socket.emit('send_message', { toUserId: user2Id, content: content.trim() });
      setContent('');
    } else {
      setError('Connexion au chat indisponible.');
    }
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-messages">
        <div className="messages-wrap">
          <div className="messages-header">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate('/messages')}
            >
              ← Retour
            </button>
            <h1 className="messages-title">Discussion avec l&apos;utilisateur {user2Id}</h1>
          </div>

          {error && (
            <div className="alert alert-error" style={{ marginBottom: 'var(--space-lg)' }}>
              {error}
            </div>
          )}

          {loading && (
            <div className="messages-loading">Chargement…</div>
          )}

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
                      className={`message-bubble-wrap ${isMe ? '' : 'other'}`}
                    >
                      <div className="message-bubble">{msg.content}</div>
                    </div>
                  );
                })
              )}
              <div ref={messagesEndRef} />
            </div>
          )}

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
        </div>
      </div>
      <Footer />
    </>
  );
}
