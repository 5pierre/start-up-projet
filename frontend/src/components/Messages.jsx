import React, { useState, useEffect, useRef } from 'react';
import { getMessages } from '../services/messageService';
import { useParams, useNavigate } from 'react-router-dom'; 
import { initiateSocketConnection, getSocket } from '../services/socketService';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import '../styles/RegisterStyle.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id);
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
        if (
            (newMessage.id_user_1 === user2Id) || 
            (newMessage.id_user_2 === user2Id)
        ) {
            setMessages((prevMessages) => [...prevMessages, newMessage]);
        }
    });

    return () => {
        socket.off('receive_message');
    };
  }, [user2Id]);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const socket = getSocket();
    if (socket) {
        socket.emit('send_message', {
            toUserId: user2Id,
            content: content
        });
        setContent('');
    } else {
        console.error("Socket non connecté");
        setError("Erreur de connexion au chat");
    }
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="container-login100" style={{ minHeight: '100vh', paddingBottom: '20px' }}>
        <div className="wrap-login100" style={{ 
          flexDirection: 'column', 
          alignItems: 'stretch',
          width: '90%',
          maxWidth: '900px',
          marginTop: '20px',
          padding: '30px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', marginBottom: '20px', gap: '16px' }}>
            <button 
              onClick={() => navigate('/messages')} 
              className="login100-form-btn-logout"
              style={{ width: 'auto', padding: '0 20px', margin: 0 }}
            >
              ← Retour
            </button>
            <h1 className="login100-form-title" style={{ margin: 0, fontSize: '20px' }}>
              Discussion avec l&apos;utilisateur {user2Id}
            </h1>
          </div>

          {error && (
            <div style={{ 
              backgroundColor: '#fdeaea', 
              color: '#b91c1c', 
              padding: '12px 20px', 
              borderRadius: '8px', 
              marginBottom: '20px',
              border: '1px solid #f5a1a1'
            }}>
              {error}
            </div>
          )}

          {loading && (
            <div style={{ textAlign: 'center', padding: '40px', color: '#171710' }}>
              Chargement des messages...
            </div>
          )}

          {/* ZONE DE CHAT SCROLLABLE */}
          <div style={{ 
            flex: 1, 
            minHeight: '400px',
            maxHeight: '500px',
            overflowY: 'auto', 
            border: '1px solid #E2E2E2', 
            borderRadius: '10px', 
            padding: '20px', 
            background: '#F9F7F2', 
            display: 'flex', 
            flexDirection: 'column',
            marginBottom: '20px'
          }}>
            {!loading && messages.length === 0 && (
              <div style={{ 
                textAlign: 'center', 
                padding: '40px', 
                color: '#666' 
              }}>
                Aucun message pour le moment. Commencez la conversation !
              </div>
            )}
            
            {messages.map((msg, index) => {
                const isMe = msg.id_user_1 !== user2Id;
                
                return (
                    <div key={index} style={{ 
                        display: 'flex', 
                        justifyContent: isMe ? 'flex-end' : 'flex-start',
                        marginBottom: '12px'
                    }}>
                        <div style={{ 
                            maxWidth: '70%',
                            padding: '12px 18px',
                            borderRadius: isMe ? '20px 20px 4px 20px' : '20px 20px 20px 4px',
                            backgroundColor: isMe ? '#DEF2CA' : '#ffffff',
                            color: '#171710',
                            textAlign: 'left',
                            boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                            border: isMe ? 'none' : '1px solid #E2E2E2',
                            fontFamily: 'Poppins-Regular, sans-serif',
                            fontSize: '15px',
                            lineHeight: '1.5'
                        }}>
                            {msg.content}
                        </div>
                    </div>
                );
            })}
            
            <div ref={messagesEndRef} />
          </div>

          {/* ZONE DE SAISIE */}
          <form onSubmit={handleSend} style={{ display: 'flex', gap: '12px', alignItems: 'center' }}>
            <input
                type="text"
                value={content}
                onChange={(e) => setContent(e.target.value)}
                placeholder="Écrire un message..."
                className="input100"
                style={{ 
                  flex: 1, 
                  borderRadius: '25px',
                  padding: '0 30px',
                  height: '50px',
                  fontSize: '15px'
                }}
            />
            <button 
              type="submit" 
              className="login100-form-btn"
              style={{ 
                width: 'auto', 
                padding: '0 30px',
                height: '50px',
                fontSize: '15px'
              }}
            >
              Envoyer
            </button>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}