import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import { getConversations } from '../services/messageService';
import '../styles/RegisterStyle.css';

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
        <div className="container-login100">
          <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
            <h1 className="login100-form-title">Espace messagerie</h1>
            <p style={{ color: '#171710', marginBottom: '20px' }}>
              Vous devez être connecté pour accéder à vos messages.
            </p>
            <button
              className="login100-form-btn"
              onClick={() => navigate('/register')}
              style={{ width: 'auto', padding: '0 30px' }}
            >
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
      <div className="container-login100">
        <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center', width: '90%', maxWidth: '900px' }}>
          <h1 className="login100-form-title">Mes conversations</h1>
          
          {loading && (
            <p style={{ color: '#171710', marginTop: '20px' }}>Chargement de vos conversations...</p>
          )}

          {error && (
            <div style={{ 
              backgroundColor: '#fdeaea', 
              color: '#b91c1c', 
              padding: '12px 20px', 
              borderRadius: '8px', 
              marginTop: '20px',
              border: '1px solid #f5a1a1'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && conversations.length === 0 && (
            <div style={{ 
              width: '100%', 
              textAlign: 'center', 
              padding: '40px 20px',
              backgroundColor: '#F0EEE8',
              borderRadius: '10px',
              marginTop: '20px'
            }}>
              <p style={{ color: '#171710', fontSize: '16px', marginBottom: '20px' }}>
                Vous n&apos;avez pas encore de conversations.
              </p>
              <p style={{ color: '#666', fontSize: '14px' }}>
                Commencez une nouvelle discussion depuis votre profil ou en recherchant un utilisateur.
              </p>
            </div>
          )}

          {!loading && !error && conversations.length > 0 && (
            <div style={{ 
              width: '100%', 
              marginTop: '30px',
              display: 'flex',
              flexDirection: 'column',
              gap: '12px'
            }}>
              {conversations.map((conversation) => (
                <div
                  key={conversation.id_user}
                  onClick={() => navigate(`/messages/${conversation.id_user}`)}
                  style={{
                    backgroundColor: '#ffffff',
                    border: '1px solid #E2E2E2',
                    borderRadius: '10px',
                    padding: '20px',
                    cursor: 'pointer',
                    transition: 'all 0.3s ease',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '16px',
                    boxShadow: '0 2px 4px rgba(0,0,0,0.05)'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#F9F7F2';
                    e.currentTarget.style.borderColor = '#DEF2CA';
                    e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = '#ffffff';
                    e.currentTarget.style.borderColor = '#E2E2E2';
                    e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
                  }}
                >
                  <div style={{
                    width: '50px',
                    height: '50px',
                    borderRadius: '50%',
                    backgroundColor: '#DEF2CA',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    fontSize: '20px',
                    fontWeight: 'bold',
                    color: '#171710',
                    flexShrink: 0
                  }}>
                    {conversation.name ? conversation.name.charAt(0).toUpperCase() : 'U'}
                  </div>
                  <div style={{ flex: 1 }}>
                    <h3 style={{ 
                      fontFamily: 'Montserrat-Bold, Poppins-Bold, sans-serif',
                      color: '#171710',
                      margin: 0,
                      marginBottom: '4px',
                      fontSize: '18px'
                    }}>
                      {conversation.name || `Utilisateur ${conversation.id_user}`}
                    </h3>
                    <p style={{ 
                      color: '#666',
                      margin: 0,
                      fontSize: '14px'
                    }}>
                      Cliquez pour ouvrir la conversation
                    </p>
                  </div>
                  <div style={{ 
                    color: '#999',
                    fontSize: '24px'
                  }}>
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

