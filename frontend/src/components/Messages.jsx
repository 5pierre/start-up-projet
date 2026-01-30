import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMessages } from '../services/messageService';
import { initiateSocketConnection, getSocket } from '../services/socketService';
import RateUserForm from './RateUserForm';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import BackButton from './BackButton';
import { getSingleAnnonce } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './Messages.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id, 10);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  
  // ID provenant de l'URL (prioritaire)
  const annonceIdRaw = searchParams.get('annonceId');
  const urlAnnonceId = annonceIdRaw ? Number.parseInt(annonceIdRaw, 10) : null;
  
  // ID provenant de la conversation (historique ou nouveau message)
  const [conversationAnnonceId, setConversationAnnonceId] = useState(null);
  
  // L'ID effectif est celui de l'URL s'il existe, sinon celui de la conversation
  const effectiveAnnonceId = urlAnnonceId || conversationAnnonceId;
  
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [annonce, setAnnonce] = useState(null);
  const [annonceStatus, setAnnonceStatus] = useState(null);
  
  const [showRatePopup, setShowRatePopup] = useState(false);
  
  const messagesEndRef = useRef(null);

  // 1. Charger l'historique
  const loadMessages = useCallback(async () => {
    if (!user2Id) return;
    try {
      setLoading(true);
      const data = await getMessages(user2Id);
      const msgs = data.messages || [];
      setMessages(msgs);
      
      // Si pas d'ID dans l'URL, on cherche le sujet le plus RÉCENT dans l'historique
      if (!urlAnnonceId) {
        // On inverse pour chercher depuis la fin (le plus récent)
        const lastMsgWithAnnonce = [...msgs].reverse().find((m) => m.annonce_id);
        const lastAnnonceId = lastMsgWithAnnonce?.annonce_id || null;
        
        if (lastAnnonceId && Number.isInteger(lastAnnonceId)) {
          setConversationAnnonceId(lastAnnonceId);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, [user2Id, urlAnnonceId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Charger les infos de l'annonce quand l'ID effectif change
  useEffect(() => {
    const loadAnnonce = async () => {
      // Si pas d'annonce ou ID invalide, on vide l'annonce affichée
      if (!effectiveAnnonceId || Number.isNaN(effectiveAnnonceId) || effectiveAnnonceId <= 0) {
        setAnnonce(null);
        return;
      }
      
      // Petite optimisation : si on a déjà la bonne annonce chargée, on évite l'appel
      if (annonce && annonce.id === effectiveAnnonceId) return;

      try {
        const res = await getSingleAnnonce(effectiveAnnonceId);
        setAnnonce(res.annonce || null);
      } catch (err) {
        console.error("Erreur chargement annonce:", err);
        setAnnonce(null);
      }
    };
    loadAnnonce();
  }, [effectiveAnnonceId, annonce]);

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
        
        // CORRECTION ICI : Si le nouveau message concerne une annonce, on met à jour le contexte
        // Cela permet au vendeur de voir le titre changer instantanément
        if (newMessage.annonce_id) {
          setConversationAnnonceId(newMessage.annonce_id);
        }
      }
    });

    return () => socket.off('receive_message');
  }, [user2Id]);

  // 3. Scroll automatique
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  // 4. Envoyer un message
  const handleSend = (e) => {
    e.preventDefault();
    if (!content.trim()) return;

    const socket = getSocket();
    if (socket) {
      const msgData = {
        toUserId: user2Id,
        content: content.trim(),
        annonceId: effectiveAnnonceId || undefined
      };
      
      socket.emit('send_message', msgData);
      
      // Optionnel : On fixe le contexte localement pour être sûr qu'il reste affiché
      if (effectiveAnnonceId) {
        setConversationAnnonceId(effectiveAnnonceId);
      }
      
      setContent('');
    } else {
      setError('Connexion au chat indisponible.');
    }
  };

  const canRate = currentUserId && user2Id && currentUserId !== user2Id;
  
  // Validation de l'annonce (seulement si je suis l'auteur de l'annonce)

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
            <BackButton to="/messages" />

            <h1 className="messages-title">
              Discussion avec {targetUserName}
            </h1>

            {canRate && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRatePopup(true)}
                style={{ marginLeft: '10px' }}
              >
                Noter
              </button>
            )}
          </div>

          {error && (
            <div className="alert alert-error messages-alert">
              {error}
            </div>
          )}

          {annonceStatus && (
            <div className={`alert ${annonceStatus.type === 'error' ? 'alert-error' : 'alert-success'} messages-alert`}>
              {annonceStatus.text}
            </div>
          )}

          {loading && (
            <div className="messages-loading">Chargement…</div>
          )}

          {/* ZONE DE CHAT */}
          {!loading && (
            <div className="messages-chat">
              
              {/* BANDEAU CONTEXTE (TITRE ANNONCE) */}
              {annonce && (
                <div className="context-separator">
                  <div className="context-badge">
                    Contexte : <strong>{annonce.titre}</strong>
                    {annonce.is_valide && <span style={{fontStyle:'italic', marginLeft:'5px'}}> (Déjà validée)</span>}
                  </div>
                </div>
              )}

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