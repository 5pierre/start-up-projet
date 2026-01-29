import React, { useState, useEffect, useRef } from 'react'; 
import { getMessages } from '../services/messageService'; 
import { useParams, useNavigate } from 'react-router-dom'; 
import { initiateSocketConnection, getSocket } from '../services/socketService';
import RateUserForm from './RateUserForm'; // Import du formulaire de notation
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import '../styles/RegisterStyle.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id);
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

  // 3. Scroll automatique

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);


  // 4. Envoyer un message (WebSocket
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

  // Logique pour savoir si on peut noter (Connecté + Pas soi-même)
  const canRate = currentUserId && user2Id && currentUserId !== user2Id;

  // Essayer de trouver le nom de l'interlocuteur pour un affichage plus sympa
  const targetUserName = messages.find(m => m.id_user_1 === user2Id || m.id_user_2 === user2Id)?.sender_name || `Utilisateur ${user2Id}`;

  return (
    // <div style={{ padding: '20px', display: 'flex', flexDirection: 'column', height: '90vh', position: 'relative' }}>
      
    //   {/* HEADER (Nettoyé et Unique) */}
    //   <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
    //       {/* Bouton Retour */}
    //       <button 
    //         onClick={() => navigate('/')} 
    //         style={{ cursor: 'pointer', padding: '5px 10px', fontSize: '1rem' }}
    //       >
    //         ⬅ Retour
    //       </button>

    //       {/* Titre */}
    //       <h2 style={{ margin: 0, fontSize: '1.2rem' }}>Discussion avec {targetUserName}</h2>

    //       {/* Bouton Noter (Public) */}
    //       <div style={{ display: 'flex', gap: '10px' }}>
    //         {canRate && (
    //             <button
    //                 onClick={() => setShowRatePopup(true)}
    //                 style={{ 
    //                     backgroundColor: '#6f42c1', // Violet pour distinguer
    //                     color: 'white', 
    //                     border: 'none', 
    //                     padding: '5px 15px', 
    //                     borderRadius: '5px', 
    //                     cursor: 'pointer',
    //                     fontWeight: 'bold'
    //                 }}
    //             >
    //                 Noter ⭐
    //             </button>
    //         )}
    //       </div>
    //   </div>

    //   {error && <p style={{ color: 'red', textAlign: 'center' }}>{error}</p>}

    //   {/* ZONE DE CHAT */}
    //   <div style={{ flex: 1, overflowY: 'auto', border: '1px solid #ccc', borderRadius: '8px', padding: '15px', background: '#f9f9f9', display: 'flex', flexDirection: 'column' }}>
        
    //     {messages.map((msg, index) => {
    //         const isMe = msg.id_user_1 !== user2Id;
    //         return (
    //             <div key={index} style={{ 
    //                 display: 'flex', 
    //                 justifyContent: isMe ? 'flex-end' : 'flex-start',
    //                 marginBottom: '10px'
    //             }}>
    //                 <div style={{ 
    //                     maxWidth: '70%',
    //                     padding: '10px 15px',
    //                     borderRadius: '20px',
    //                     backgroundColor: isMe ? '#007bff' : '#e5e5ea',
    //                     color: isMe ? 'white' : 'black',
    //                     textAlign: 'left',
    //                     boxShadow: '0 1px 2px rgba(0,0,0,0.1)'
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
    //             </div>
    //         );
    //     })}
    //     <div ref={messagesEndRef} />
    //   </div>

    //   {/* ZONE DE SAISIE */}
    //   <form onSubmit={handleSend} style={{ marginTop: '10px', display: 'flex', gap: '10px' }}>
    //     <input
    //         type="text"
    //         value={content}
    //         onChange={(e) => setContent(e.target.value)}
    //         placeholder="Écrire un message..."
    //         style={{ flex: 1, padding: '12px', borderRadius: '20px', border: '1px solid #ddd', outline: 'none' }}
    //     />
    //     <button type="submit" style={{ padding: '10px 20px', borderRadius: '20px', background: '#28a745', color: 'white', border: 'none', cursor: 'pointer', fontWeight: 'bold' }}>
    //         Envoyer 🚀
    //     </button>
    //   </form>

    //   {/* POPUP DE NOTATION */}
    //   {showRatePopup && (
    //     <div className="popup-overlay" onClick={() => setShowRatePopup(false)}>
    //         <div className="popup-content" onClick={(e) => e.stopPropagation()} style={{ padding: '0', background: 'transparent', boxShadow: 'none' }}>
    //             <RateUserForm 
    //                 ratedUserId={user2Id}
    //                 ratedUserName={targetUserName}
    //                 onClose={() => setShowRatePopup(false)}
    //                 onSuccess={() => {
    //                     setShowRatePopup(false);
    //                 }}
    //             />
    //         </div>
    //     </div>
    //   )}

    // </div>
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