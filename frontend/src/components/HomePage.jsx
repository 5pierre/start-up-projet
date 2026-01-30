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
        <header className="home-hero">
          <div className="home-hero-inner">
            <p className="home-hero-badge">Plateforme d&apos;entraide</p>
            <h1 className="home-title">
              Bienvenue sur pour les p&apos;tits vieux
            </h1>
            <p className="home-subtitle">
              Échangez, publiez des annonces et discutez avec une communauté
              bienveillante. Tout se fait simplement, en texte ou à la voix.
            </p>
            {!isAuthenticated && (
              <div className="home-actions">
                <button
                  type="button"
                  className="btn btn-primary home-cta-primary"
                  onClick={() => navigate('/register')}
                >
                  Créer un compte / Se connecter
                </button>
              </div>
            )}
            {isAuthenticated && (
              <div className="home-actions">
                <button
                  type="button"
                  className="btn btn-primary home-cta-primary"
                  onClick={() => navigate('/annonces')}
                >
                  Voir les annonces
                </button>
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => navigate('/messages')}
                >
                  Mes conversations
                </button>
              </div>
            )}
          </div>
        </header>

        {!loading && recentAnnonces.length > 0 && (
          <section className="home-section home-section-annonces">
            <div className="home-section-inner">
              <div className="home-section-header">
                <h2 className="home-section-title">Annonces récentes</h2>
                <button
                  type="button"
                  className="btn btn-secondary btn-sm"
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
            </div>
          </section>
        )}

        <section className="home-section home-section-features">
          <div className="home-section-inner">
            <h2 className="home-features-title">Ce que vous pouvez faire</h2>
            <div className="home-features-grid">
              <article className="home-feature-card">
                <h3 className="home-feature-title">Messagerie</h3>
                <p className="home-feature-desc">
                  Échangez en temps réel avec d&apos;autres membres, en toute simplicité.
                </p>
              </article>
              <article className="home-feature-card">
                <h3 className="home-feature-title">Annonces</h3>
                <p className="home-feature-desc">
                  Consultez et publiez des annonces, en texte ou à la voix.
                </p>
              </article>
              <article className="home-feature-card">
                <h3 className="home-feature-title">Communauté</h3>
                <p className="home-feature-desc">
                  Rejoignez une communauté bienveillante et active.
                </p>
              </article>
            </div>
          </div>
        </section>
      </div>
      <Footer />
    </>
  );
}
