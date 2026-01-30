import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { getMessages } from '../services/messageService';
import { initiateSocketConnection, getSocket } from '../services/socketService';
import RateUserForm from './RateUserForm';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import BackButton from './BackButton';
import { getSingleAnnonce, validateAnnonce } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './Messages.css';

export default function Messages() {
  const { id } = useParams();
  const user2Id = parseInt(id, 10);
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const annonceIdRaw = searchParams.get('annonceId');
  const annonceId = annonceIdRaw ? Number.parseInt(annonceIdRaw, 10) : null;
  const [conversationAnnonceId, setConversationAnnonceId] = useState(null);
  const effectiveAnnonceId = annonceId || conversationAnnonceId;
  
  // Récupération de l'ID connecté pour vérifier les permissions de notation
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);
  const [messages, setMessages] = useState([]);
  const [content, setContent] = useState('');
  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(true);
  const [showProfile, setShowProfile] = useState(false);
  const [annonce, setAnnonce] = useState(null);
  const [annonceStatus, setAnnonceStatus] = useState(null); // message success/error
  
  // État pour le Popup de notation
  const [showRatePopup, setShowRatePopup] = useState(false);
  
  // 1. Charger l'historique (via API REST)
  const messagesEndRef = useRef(null);

  const loadMessages = useCallback(async () => {
    if (!user2Id) return;
    try {
      setLoading(true);
      const data = await getMessages(user2Id);
      const msgs = data.messages || [];
      setMessages(msgs);
      if (!annonceId) {
        const firstAnnonceId = msgs.find((m) => m.annonce_id)?.annonce_id || null;
        if (firstAnnonceId && Number.isInteger(firstAnnonceId)) {
          setConversationAnnonceId(firstAnnonceId);
        }
      }
      setError(null);
    } catch (err) {
      console.error('Erreur API:', err);
      setError('Impossible de charger les messages.');
    } finally {
      setLoading(false);
    }
  }, [user2Id, annonceId]);

  useEffect(() => {
    loadMessages();
  }, [loadMessages]);

  // Charger les infos de l'annonce si on est dans une discussion liée à une annonce
  useEffect(() => {
    const loadAnnonce = async () => {
      if (!effectiveAnnonceId || Number.isNaN(effectiveAnnonceId) || effectiveAnnonceId <= 0) return;
      try {
        const res = await getSingleAnnonce(effectiveAnnonceId);
        setAnnonce(res.annonce || null);
      } catch (err) {
        console.error("Erreur chargement annonce:", err);
        setAnnonce(null);
      }
    };
    loadAnnonce();
  }, [effectiveAnnonceId]);

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
        annonceId: effectiveAnnonceId || undefined
      });
      setContent('');
    } else {
      setError('Connexion au chat indisponible.');
    }
  };

  // Logique pour savoir si on peut noter (Connecté + Pas soi-même)
  const canRate = currentUserId && user2Id && currentUserId !== user2Id;

  const canValidateAnnonce =
    annonce &&
    !annonce.is_valide &&
    Number.isInteger(currentUserId) &&
    currentUserId > 0 &&
    currentUserId === annonce.id_user &&
    Number.isInteger(user2Id) &&
    user2Id > 0 &&
    user2Id !== currentUserId;

  const handleValidateAnnonce = async () => {
    if (!annonce || !effectiveAnnonceId) return;
    try {
      setAnnonceStatus(null);
      const res = await validateAnnonce(effectiveAnnonceId);
      setAnnonce(res.annonce || null);
      setAnnonceStatus({ type: 'success', text: "Annonce validée. Elle apparaîtra grisée dans la liste." });
    } catch (err) {
      const msg = err.response?.data?.error || "Erreur lors de la validation de l'annonce.";
      setAnnonceStatus({ type: 'error', text: msg });
    }
  };

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
            <BackButton to="/messages" />

            <h1 className="messages-title">
              Discussion avec {targetUserName}
            </h1>

            {/* Bouton Valider l'annonce (visible seulement pour le destinataire: l'auteur de l'annonce) */}
            {canValidateAnnonce && (
              <button
                type="button"
                className="btn btn-success"
                onClick={handleValidateAnnonce}
              >
                Valider l'annonce
              </button>
            )}

            {/* Bouton Noter */}
            {canRate && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => setShowRatePopup(true)}
              >
                Noter
              </button>
            )}
          </div>

          {/* Affichage des erreurs */}
          {error && (
            <div className="alert alert-error messages-alert">
              {error}
            </div>
          )}

          {annonce && (
            <div className="alert messages-annonce-alert">
              <strong>Annonce :</strong> {annonce.titre || `#${effectiveAnnonceId}`}{" "}
              {annonce.is_valide ? "— déjà validée" : ""}
            </div>
          )}

          {annonceStatus && (
            <div className={`alert ${annonceStatus.type === 'error' ? 'alert-error' : 'alert-success'} messages-alert`}>
              {annonceStatus.text}
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
