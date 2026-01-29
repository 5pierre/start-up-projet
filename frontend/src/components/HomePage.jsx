import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import StoryCard from './StoryCard';
import { getRecentStories } from '../services/storyService';
import '../styles/RegisterStyle.css';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('userId');
  const [showProfile, setShowProfile] = useState(false);
  const [recentStories, setRecentStories] = useState([]);
  const [loadingStories, setLoadingStories] = useState(true);

  useEffect(() => {
    const fetchRecentStories = async () => {
      try {
        setLoadingStories(true);
        const data = await getRecentStories(3);
        // Gérer différents formats de réponse possibles
        const storiesList = Array.isArray(data) ? data : (data.stories || data.data || []);
        setRecentStories(storiesList);
      } catch (err) {
        // Ne pas afficher d'erreur si le backend n'est pas encore disponible
        console.log('Backend non disponible ou aucune annonce:', err);
        setRecentStories([]);
      } finally {
        setLoadingStories(false);
      }
    };

    fetchRecentStories();
  }, []);

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="container-login100">
        <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center', textAlign: 'center' }}>
          <h1 className="login100-form-title" style={{ fontSize: '32px', marginBottom: '20px' }}>
            Bienvenue sur les p&apos;tits vieux
          </h1>
          <p style={{ 
            color: '#171710', 
            fontSize: '18px', 
            marginBottom: '30px',
            lineHeight: '1.6',
            maxWidth: '600px'
          }}>
            Plateforme de discussion et d&apos;échange entre utilisateurs.
            Connectez-vous pour commencer à discuter avec d&apos;autres membres de la communauté.
          </p>

          {!isAuthenticated && (
            <div style={{ display: 'flex', gap: '16px', flexWrap: 'wrap', justifyContent: 'center' }}>
              <button
                className="login100-form-btn"
                onClick={() => navigate('/register')}
                style={{ width: 'auto', padding: '0 40px' }}
              >
                Se connecter / S&apos;inscrire
              </button>
            </div>
          )}

          {isAuthenticated && (
            <div style={{ 
              display: 'flex', 
              gap: '16px', 
              flexWrap: 'wrap', 
              justifyContent: 'center',
              marginTop: '20px'
            }}>
              <button
                className="login100-form-btn"
                onClick={() => navigate('/messages')}
                style={{ width: 'auto', padding: '0 40px' }}
              >
                Voir mes conversations
              </button>
            </div>
          )}

          {/* Section Annonces récentes */}
          {!loadingStories && recentStories.length > 0 && (
            <div style={{ 
              marginTop: '50px',
              width: '100%',
              maxWidth: '900px'
            }}>
              <div style={{ 
                display: 'flex', 
                justifyContent: 'space-between', 
                alignItems: 'center',
                marginBottom: '20px'
              }}>
                <h2 style={{ 
                  fontFamily: 'Montserrat-Bold, Poppins-Bold, sans-serif',
                  color: '#171710',
                  fontSize: '22px',
                  margin: 0
                }}>
                  Annonces récentes
                </h2>
                <button
                  onClick={() => navigate('/annonces')}
                  style={{
                    padding: '8px 16px',
                    backgroundColor: 'transparent',
                    color: '#171710',
                    border: '1px solid #DEF2CA',
                    borderRadius: '20px',
                    cursor: 'pointer',
                    fontSize: '14px',
                    fontFamily: 'Poppins-Medium, sans-serif',
                    transition: 'all 0.3s'
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.backgroundColor = '#DEF2CA';
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.backgroundColor = 'transparent';
                  }}
                >
                  Voir toutes →
                </button>
              </div>
              <div style={{ 
                display: 'flex',
                flexDirection: 'column',
                gap: '16px'
              }}>
                {recentStories.map((story, index) => (
                  <StoryCard
                    key={story.id || story.story_id || story.id_story || `story-${index}`}
                    story={story}
                    onView={() => navigate('/annonces')}
                    canEdit={false}
                    canDelete={false}
                  />
                ))}
              </div>
            </div>
          )}

          <div style={{ 
            marginTop: '50px',
            padding: '30px',
            backgroundColor: '#F0EEE8',
            borderRadius: '10px',
            width: '100%',
            maxWidth: '700px'
          }}>
            <h2 style={{ 
              fontFamily: 'Montserrat-Bold, Poppins-Bold, sans-serif',
              color: '#171710',
              fontSize: '22px',
              marginBottom: '15px'
            }}>
              Fonctionnalités
            </h2>
            <div style={{ 
              display: 'grid', 
              gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))',
              gap: '20px',
              textAlign: 'left'
            }}>
              <div>
                <h3 style={{ 
                  fontFamily: 'Montserrat-Bold, sans-serif',
                  color: '#171710',
                  fontSize: '16px',
                  marginBottom: '8px'
                }}>
                  Messagerie
                </h3>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  Échangez des messages en temps réel avec d&apos;autres utilisateurs.
                </p>
              </div>
              <div>
                <h3 style={{ 
                  fontFamily: 'Montserrat-Bold, sans-serif',
                  color: '#171710',
                  fontSize: '16px',
                  marginBottom: '8px'
                }}>
                  Annonces
                </h3>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  Consultez et publiez des annonces pour la communauté.
                </p>
              </div>
              <div>
                <h3 style={{ 
                  fontFamily: 'Montserrat-Bold, sans-serif',
                  color: '#171710',
                  fontSize: '16px',
                  marginBottom: '8px'
                }}>
                  Communauté
                </h3>
                <p style={{ color: '#666', fontSize: '14px', lineHeight: '1.5' }}>
                  Rejoignez une communauté active et bienveillante.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
      <Footer />
    </>
  );
}
