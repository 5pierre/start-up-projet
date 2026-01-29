import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import { getAllAnnonces } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './Annonces.css';

export default function Annonces() {
  const navigate = useNavigate();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');

  useEffect(() => {
    const fetchData = async () => {
      try {
        setLoading(true);
        const data = await getAllAnnonces();
        setAnnonces(data.annonces || []);
        setError(null);
      } catch (e) {
        console.error('Erreur chargement annonces:', e);
        setError("Impossible de charger les annonces.");
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  const filtered = search.trim()
    ? annonces.filter(
        (a) =>
          (a.titre || '').toLowerCase().includes(search.toLowerCase()) ||
          (a.description || '').toLowerCase().includes(search.toLowerCase()) ||
          (a.lieu || '').toLowerCase().includes(search.toLowerCase()) ||
          (a.author_name || '').toLowerCase().includes(search.toLowerCase())
      )
    : annonces;

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-annonces">
        <div className="annonces-header">
          <h1 className="annonces-title">Annonces</h1>
          <p className="annonces-subtitle">
            Consultez les demandes d&apos;aide et de services entre particuliers.
          </p>
          <div className="annonces-actions">
            <input
              type="text"
              placeholder="Rechercher (titre, lieu, auteur…)"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="annonces-search"
            />
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => navigate('/create')}
            >
              Créer une annonce
            </button>
          </div>
        </div>

        {loading && (
          <div className="annonces-loading">
            <div className="annonces-spinner" />
            <p>Chargement des annonces…</p>
          </div>
        )}

        {error && (
          <div className="alert alert-error annonces-alert">
            {error}
          </div>
        )}

        {!loading && !error && filtered.length === 0 && (
          <div className="annonces-empty card">
            <p className="annonces-empty-title">Aucune annonce</p>
            <p className="annonces-empty-text">
              {search.trim()
                ? 'Aucun résultat pour cette recherche.'
                : 'Aucune annonce pour le moment. Soyez le premier à en créer une !'}
            </p>
            {!search.trim() && (
              <button
                type="button"
                className="btn btn-primary"
                onClick={() => navigate('/create')}
              >
                Créer une annonce
              </button>
            )}
          </div>
        )}

        {!loading && !error && filtered.length > 0 && (
          <div className="annonces-grid">
            {filtered.map((a) => (
              <article
                key={a.id}
                className="annonce-card card"
              >
                <div className="annonce-card-header">
                  <h2 className="annonce-card-title">{a.titre || 'Sans titre'}</h2>
                  {a.prix != null && (
                    <span className="annonce-card-prix">{a.prix} €</span>
                  )}
                </div>
                <p className="annonce-card-desc">
                  {a.description
                    ? a.description.length > 140
                      ? a.description.slice(0, 140) + '…'
                      : a.description
                    : 'Aucune description.'}
                </p>
                <div className="annonce-card-meta">
                  {a.lieu && <span className="annonce-meta-item">📍 {a.lieu}</span>}
                  {a.date_publication && (
                    <span className="annonce-meta-item">
                      📅 {formatDate(a.date_publication)}
                    </span>
                  )}
                </div>
                {a.author_name && (
                  <p className="annonce-card-author">Par {a.author_name}</p>
                )}
              </article>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
