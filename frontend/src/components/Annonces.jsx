import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import BackButton from './BackButton';
import '../styles/RegisterStyle.css';
import './Annonces.css';
import { getAllAnnonces, deleteExistingAnnonce, updateExistingAnnonce } from '../services/annonceService';
import StoryWrite from './StoryWrite';

export default function Annonces() {
  const navigate = useNavigate();
  const [annonces, setAnnonces] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const currentUserId = parseInt(localStorage.getItem('userId'), 10);
  const userRole = localStorage.getItem('userRole');
  const isAdmin = userRole === 'admin';
  const isAuthenticated = !!localStorage.getItem('userId');
  const [showProfile, setShowProfile] = useState(false);
  const [search, setSearch] = useState('');
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingAnnonce, setEditingAnnonce] = useState(null);

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

  if (error) {
    return (
      <>
        <Navbar onProfileClick={() => setShowProfile(true)} />
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-annonces">
        <BackButton to="/" />
        <div className="annonces-header">
          <h1 className="annonces-title">Liste des annonces</h1>
          <div className="alert alert-error">{error}</div>
        </div>
        </div>
        <Footer />
      </>
    );
  }

  const formatDate = (d) => {
    if (!d) return '';
    const dt = new Date(d);
    return dt.toLocaleDateString('fr-FR', { day: 'numeric', month: 'long', year: 'numeric' });
  };

  const canEditAnnonce = (annonce) => {
    if (!currentUserId) return false;
    return isAdmin || currentUserId === annonce.id_user;
  };

  const canDeleteAnnonce = (annonce) => {
    if (!currentUserId) return false;
    return isAdmin || currentUserId === annonce.id_user;
  };

  const handleEdit = (annonce) => {
    setEditingAnnonce(annonce);
    setShowEditModal(true);
  };

  const handleDelete = async (annonceId) => {
    if (!window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
      return;
    }
    try {
      await deleteExistingAnnonce(annonceId);
      // Recharger la liste
      const data = await getAllAnnonces();
      setAnnonces(data.annonces || []);
    } catch (err) {
      console.error('Erreur suppression annonce:', err);
      alert(err.response?.data?.error || 'Erreur lors de la suppression de l\'annonce.');
    }
  };

  const handleEditSuccess = async () => {
    setShowEditModal(false);
    setEditingAnnonce(null);
    // Recharger la liste
    const data = await getAllAnnonces();
    setAnnonces(data.annonces || []);
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      {showEditModal && editingAnnonce && (
        <StoryWrite
          story={editingAnnonce}
          onClose={() => {
            setShowEditModal(false);
            setEditingAnnonce(null);
          }}
          onSuccess={handleEditSuccess}
        />
      )}
      <div className="page-annonces">
        <BackButton to="/" />
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
            {isAuthenticated && (
              <>
                <button
                  type="button"
                  className="btn btn-primary"
                  onClick={() => navigate('/create')}
                >
                  Créer une annonce
                </button>
                <button
                  type="button"
                  className="btn btn-donate"
                  onClick={() => navigate('/pay')}
                >
                  Soutenir le site (5€)
                </button>
              </>
            )}
          </div>
        </div>

      {/* <h2>GET /annonces</h2>
      {annonces.length === 0 ? (
        <p>Aucune annonce pour le moment.</p>
      ) : (
        <ul>
          {annonces.map((a, index) => {
              // 1. On ouvre les accolades pour calculer la variable
              const isMyAnnonce = currentUserId === a.id_user;

              // 2. IL FAUT AJOUTER "return" ICI
              return (
                <li key={a.id || index}>
                  <strong>{a.titre || "Sans titre"}</strong>
                  {a.prix && ` - ${a.prix}€`}
                  <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                    
                    {!isMyAnnonce && currentUserId ? (
                      <button
                        onClick={() => navigate(`/messages/${a.id_user}`)}
                        className="login100-form-btn"
                        style={{ 
                          width: 'auto', 
                          minWidth: '120px', 
                          backgroundColor: '#28a745', 
                          height: '40px', 
                          cursor: 'pointer',
                          color: 'white',
                          border: 'none',
                          borderRadius: '5px',
                          padding: '0 15px'
                        }}
                      >
                        Contacter le vendeur
                      </button>
                  ) : (null)}
                </div>
              </li>
            ); // Fin du return
          })}
        </ul>
      )} */}

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
            {filtered.map((a) => {
              const isMyAnnonce = currentUserId === a.id_user;
              const isTaken = !!a.is_valide;
              return(              <article
                key={a.id}
                className={`annonce-card card ${isTaken ? 'annonce-card--taken' : ''}`}
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
                  {a.lieu && <span className="annonce-meta-item">{a.lieu}</span>}
                  {a.date_publication && (
                    <span className="annonce-meta-item">
                      {formatDate(a.date_publication)}
                    </span>
                  )}
                </div>
                {a.author_name && (
                  <p className="annonce-card-author">Par {a.author_name}</p>
                )}
                {isTaken && (
                  <p className="annonce-card-author" style={{ marginTop: 8, fontWeight: 700 }}>
                    Annonce prise
                  </p>
                )}
                <div className="annonce-card-actions-bottom">
                  {!isMyAnnonce && currentUserId && !isTaken && (
                    <button
                      type="button"
                      className="btn btn-donate annonce-contact-btn"
                      onClick={() => {
                        navigate(`/messages/${a.id_user}?annonceId=${a.id}`);
                      }}
                    >
                      Contacter le vendeur
                    </button>
                  )}
                  {(canEditAnnonce(a) || canDeleteAnnonce(a)) && (
                    <div className="story-card-actions">
                      {canEditAnnonce(a) && (
                        <button
                          type="button"
                          className="story-card-btn-edit"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEdit(a);
                          }}
                        >
                          Modifier
                        </button>
                      )}
                      {canDeleteAnnonce(a) && (
                        <button
                          type="button"
                          className="story-card-btn-delete"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDelete(a.id);
                          }}
                        >
                          Supprimer
                        </button>
                      )}
                    </div>
                  )}
                </div>
              </article>
              );
})}
          </div>
        )}
      </div>
      <Footer />
    </>
  );
}
