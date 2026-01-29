import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import StoryCard from './StoryCard';
import { getAllAnnonces } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './HomePage.css';

export default function HomePage() {
  const navigate = useNavigate();
  const isAuthenticated = !!localStorage.getItem('userId');
  const [showProfile, setShowProfile] = useState(false);
  const [recentAnnonces, setRecentAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetch = async () => {
      try {
        setLoading(true);
        const data = await getAllAnnonces();
        const list = data.annonces || [];
        setRecentAnnonces(list.slice(0, 3));
      } catch (err) {
        console.log('Annonces non disponibles:', err);
        setRecentAnnonces([]);
      } finally {
        setLoading(false);
      }
    };
    fetch();
  }, []);

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-home">
        <div className="home-hero card">
          <h1 className="home-title">Bienvenue sur les p&apos;tits vieux</h1>
          <p className="home-subtitle">
            Plateforme d&apos;entraide et d&apos;échange entre particuliers.
            Connectez-vous pour discuter et consulter les annonces.
          </p>
          {!isAuthenticated && (
            <div className="home-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/register')}
              >
                Se connecter / S&apos;inscrire
              </button>
            </div>
          )}
          {isAuthenticated && (
            <div className="home-actions">
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/messages')}
              >
                Voir mes conversations
              </button>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/annonces')}
              >
                Voir les annonces
              </button>
            </div>
          )}
        </div>

        {!loading && recentAnnonces.length > 0 && (
          <section className="home-section">
            <div className="home-section-header">
              <h2 className="home-section-title">Annonces récentes</h2>
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/annonces')}
              >
                Voir toutes →
              </button>
            </div>
            <div className="home-cards">
              {recentAnnonces.map((a, i) => (
                <StoryCard
                  key={a.id || `annonce-${i}`}
                  story={a}
                  onView={() => navigate('/annonces')}
                  canEdit={false}
                  canDelete={false}
                />
              ))}
            </div>
          </section>
        )}

        <section className="home-features card">
          <h2 className="home-features-title">Fonctionnalités</h2>
          <div className="home-features-grid">
            <div className="home-feature">
              <h3 className="home-feature-title">Messagerie</h3>
              <p className="home-feature-desc">
                Échangez en temps réel avec d&apos;autres membres.
              </p>
            </div>
            <div className="home-feature">
              <h3 className="home-feature-title">Annonces</h3>
              <p className="home-feature-desc">
                Consultez et publiez des annonces (texte ou vocal).
              </p>
            </div>
            <div className="home-feature">
              <h3 className="home-feature-title">Communauté</h3>
              <p className="home-feature-desc">
                Rejoignez une communauté bienveillante et active.
              </p>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
