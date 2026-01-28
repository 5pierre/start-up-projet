import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterStyle.css';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import StoryCard from './StoryCard';
import StoryWrite from './StoryWrite';
import { getStories, deleteStory } from '../services/storyService';

export default function StoryRead() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [showWriteModal, setShowWriteModal] = useState(false);
  const [editingStory, setEditingStory] = useState(null);
  const [stories, setStories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const isAuthenticated = !!localStorage.getItem('userId');
  const userId = localStorage.getItem('userId');

  useEffect(() => {
    fetchStories();
  }, []);

  const fetchStories = async () => {
    try {
      setLoading(true);
      setError(null);
      const data = await getStories();
      // Gérer différents formats de réponse possibles
      const storiesList = Array.isArray(data) ? data : (data.stories || data.data || []);
      setStories(storiesList);
    } catch (err) {
      console.error('Erreur chargement annonces:', err);
      // Ne pas afficher d'erreur si le backend n'est pas encore disponible ou erreur CORS
      if (err.response?.status !== 404 && err.response?.status !== 403 && err.code !== 'ECONNREFUSED' && err.code !== 'ERR_NETWORK') {
        setError('Impossible de charger les annonces.');
      }
      // Si erreur CORS, c'est probablement que le backend n'autorise pas cette origine
      if (err.response?.status === 403) {
        console.log('Erreur CORS détectée. Assurez-vous que FRONTEND_ORIGIN dans le backend inclut votre origine (ex: http://localhost:3001)');
      }
      setStories([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateClick = () => {
    if (!isAuthenticated) {
      navigate('/register');
      return;
    }
    setEditingStory(null);
    setShowWriteModal(true);
  };

  const handleEdit = (story) => {
    setEditingStory(story);
    setShowWriteModal(true);
  };

  const handleDelete = async (storyId) => {
    try {
      await deleteStory(storyId);
      fetchStories(); // Recharger la liste
    } catch (err) {
      console.error('Erreur suppression annonce:', err);
      const errorMessage = err.response?.data?.message || 'Erreur lors de la suppression de l\'annonce.';
      alert(errorMessage);
    }
  };

  const handleWriteSuccess = () => {
    fetchStories(); // Recharger la liste après création/modification
  };

  const handleViewStory = (story) => {
    // Pour l'instant, on peut juste scroll vers l'annonce ou ouvrir un modal de détails
    // Vous pouvez adapter cela selon vos besoins
    console.log('Voir annonce:', story);
  };

  const canEditStory = (story) => {
    if (!isAuthenticated) return false;
    // Vérifier si l'utilisateur est l'auteur ou admin
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') return true;
    return story.user_id === userId || story.author_id === userId || story.id_user === userId || story.userId === userId;
  };

  const canDeleteStory = (story) => {
    if (!isAuthenticated) return false;
    // Vérifier si l'utilisateur est l'auteur ou admin
    const userRole = localStorage.getItem('userRole');
    if (userRole === 'admin') return true;
    return story.user_id === userId || story.author_id === userId || story.id_user === userId || story.userId === userId;
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      {showWriteModal && (
        <StoryWrite
          story={editingStory}
          onClose={() => {
            setShowWriteModal(false);
            setEditingStory(null);
          }}
          onSuccess={handleWriteSuccess}
        />
      )}
      <div className="container-login100">
        <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center', width: '90%', maxWidth: '900px' }}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', width: '100%', marginBottom: '30px' }}>
            <h1 className="login100-form-title" style={{ margin: 0 }}>Annonces</h1>
            {isAuthenticated && (
              <button
                className="login100-form-btn"
                onClick={handleCreateClick}
                style={{ width: 'auto', padding: '12px 24px' }}
              >
                Créer une annonce
              </button>
            )}
          </div>

          {loading && (
            <p style={{ color: '#171710', marginTop: '20px' }}>Chargement des annonces...</p>
          )}

          {error && (
            <div style={{
              backgroundColor: '#fdeaea',
              color: '#b91c1c',
              padding: '12px 20px',
              borderRadius: '8px',
              marginTop: '20px',
              border: '1px solid #f5a1a1',
              width: '100%'
            }}>
              {error}
            </div>
          )}

          {!loading && !error && stories.length === 0 && (
            <div style={{
              width: '100%',
              textAlign: 'center',
              padding: '40px 20px',
              backgroundColor: '#F0EEE8',
              borderRadius: '10px',
              marginTop: '20px'
            }}>
              <p style={{ color: '#171710', fontSize: '16px', marginBottom: '20px' }}>
                Aucune annonce disponible pour le moment.
              </p>
              {isAuthenticated && (
                <button
                  className="login100-form-btn"
                  onClick={handleCreateClick}
                  style={{ width: 'auto', padding: '12px 24px' }}
                >
                  Créer la première annonce
                </button>
              )}
            </div>
          )}

          {!loading && !error && stories.length > 0 && (
            <div style={{ width: '100%', marginTop: '20px' }}>
              {stories.map((story, index) => (
                <StoryCard
                  key={story.id || story.story_id || story.id_story || `story-${index}`}
                  story={story}
                  onView={() => handleViewStory(story)}
                  onEdit={canEditStory(story) ? handleEdit : null}
                  onDelete={canDeleteStory(story) ? handleDelete : null}
                  canEdit={canEditStory(story)}
                  canDelete={canDeleteStory(story)}
                />
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
