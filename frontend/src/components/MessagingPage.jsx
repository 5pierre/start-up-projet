import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import { getConversations } from '../services/messageService';
import '../styles/RegisterStyle.css';
import './MessagingPage.css';

export default function MessagingPage() {
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const isAuthenticated = !!localStorage.getItem('userId');

  useEffect(() => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    const fetchConversations = async () => {
      try {
        setLoading(true);
        const data = await getConversations();
        setConversations(data.conversations || []);
        setError(null);
      } catch (err) {
        console.error('Erreur chargement conversations', err);
        setError('Impossible de charger vos conversations.');
      } finally {
        setLoading(false);
      }
    };
    fetchConversations();
  }, [isAuthenticated]);

  if (!isAuthenticated) {
    return (
      <>
        <Navbar />
        <div className="page-messaging">
          <div className="messaging-wrap messaging-gate card">
            <h1 className="messaging-title">Espace messagerie</h1>
            <p className="messaging-gate-desc">
              Connectez-vous pour accéder à vos messages.
            </p>
            <button type="button" className="btn btn-primary" onClick={() => navigate('/register')}>
              Se connecter
            </button>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-messaging">
        <div className="messaging-wrap">
          <h1 className="messaging-title">Mes conversations</h1>

          {loading && (
            <div className="messaging-loading">
              <p>Chargement…</p>
            </div>
          )}

          {error && (
            <div className="messaging-error-wrap">
              <div className="alert alert-error">{error}</div>
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div className="messaging-empty card">
              <p>Vous n&apos;avez pas encore de conversations.</p>
              <p>Commencez une discussion depuis votre profil ou en contactant un utilisateur.</p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div className="messaging-list">
              {conversations.map((c) => (
                <div
                  key={c.id_user}
                  className="messaging-item"
                  onClick={() => navigate(`/messages/${c.id_user}`)}
                  role="button"
                  tabIndex={0}
                  onKeyDown={(e) => e.key === 'Enter' && navigate(`/messages/${c.id_user}`)}
                >
                  <div className="messaging-avatar">
                    {c.name ? c.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div className="messaging-item-body">
                    <h3>{c.name || `Utilisateur ${c.id_user}`}</h3>
                    <p>Cliquez pour ouvrir la conversation</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
