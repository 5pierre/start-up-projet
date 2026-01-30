import React, { useState, useEffect } from 'react';
import { createAnnonceData, updateExistingAnnonce } from '../services/annonceService';
import '../styles/RegisterStyle.css';

export default function StoryWrite({ story, onClose, onSuccess }) {
  const [title, setTitle] = useState('');
  const [content, setContent] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const isEditMode = !!story;

  useEffect(() => {
    if (story) {
      setTitle(story.title || story.titre || '');
      setContent(story.content || story.contenu || story.description || '');
    }
  }, [story]);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);

    try {
      const annonceData = {
        titre: title.trim(),
        description: content.trim(),
        id_user: localStorage.getItem('userId')
      };

      if (isEditMode) {
        const annonceId = story.id || story.story_id || story.id_story;
        await updateExistingAnnonce(annonceId, annonceData);
      } else {
        await createAnnonceData(annonceData);
      }

      if (onSuccess) {
        onSuccess();
      }
      if (onClose) {
        onClose();
      }
    } catch (err) {
      console.error('Erreur lors de la sauvegarde:', err);
      setError(err.response?.data?.error || err.response?.data?.message || 'Une erreur est survenue lors de la sauvegarde.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(23, 23, 16, 0.7)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        zIndex: 1000,
        padding: '20px'
      }}
      onClick={onClose}
    >
      <div
        style={{
          backgroundColor: '#ffffff',
          borderRadius: '10px',
          padding: '40px',
          width: '100%',
          maxWidth: '600px',
          maxHeight: '90vh',
          overflowY: 'auto',
          position: 'relative'
        }}
        onClick={(e) => e.stopPropagation()}
      >
        <button
          onClick={onClose}
          style={{
            position: 'absolute',
            top: '15px',
            right: '15px',
            backgroundColor: 'transparent',
            border: 'none',
            fontSize: '28px',
            cursor: 'pointer',
            color: '#666',
            width: '32px',
            height: '32px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            borderRadius: '50%',
            transition: 'all 0.3s'
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.backgroundColor = '#F0EEE8';
            e.currentTarget.style.color = '#171710';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.backgroundColor = 'transparent';
            e.currentTarget.style.color = '#666';
          }}
        >
          &times;
        </button>

        <h2 className="login100-form-title" style={{ marginBottom: '30px', fontSize: '24px' }}>
          {isEditMode ? 'Modifier l\'annonce' : 'Créer une annonce'}
        </h2>

        {error && (
          <div style={{
            backgroundColor: '#fdeaea',
            color: '#b91c1c',
            padding: '12px 20px',
            borderRadius: '8px',
            marginBottom: '20px',
            border: '1px solid #f5a1a1'
          }}>
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit}>
          <div style={{ marginBottom: '20px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'Montserrat-Bold, sans-serif',
              color: '#171710',
              fontSize: '16px'
            }}>
              Titre *
            </label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="input100"
              placeholder="Titre de l'annonce"
              required
              maxLength={200}
            />
          </div>

          <div style={{ marginBottom: '30px' }}>
            <label style={{
              display: 'block',
              marginBottom: '8px',
              fontFamily: 'Montserrat-Bold, sans-serif',
              color: '#171710',
              fontSize: '16px'
            }}>
              Contenu *
            </label>
            <textarea
              value={content}
              onChange={(e) => setContent(e.target.value)}
              className="story-textarea"
              placeholder="Contenu de l'annonce"
              required
              rows={8}
              style={{
                width: '100%',
                padding: '15px',
                borderRadius: '8px',
                border: '1px solid #E2E2E2',
                fontSize: '15px',
                fontFamily: 'Poppins-Regular, sans-serif',
                color: '#171710',
                backgroundColor: '#F0EEE8',
                resize: 'vertical'
              }}
            />
          </div>

          <div style={{ display: 'flex', gap: '12px', justifyContent: 'flex-end' }}>
            <button
              type="button"
              onClick={onClose}
              style={{
                padding: '12px 24px',
                backgroundColor: '#F0EEE8',
                color: '#171710',
                border: 'none',
                borderRadius: '25px',
                cursor: 'pointer',
                fontSize: '15px',
                fontFamily: 'Poppins-Medium, sans-serif',
                transition: 'all 0.3s'
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = '#E2E2E2';
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = '#F0EEE8';
              }}
            >
              Annuler
            </button>
            <button
              type="submit"
              className="login100-form-btn"
              disabled={loading}
              style={{ width: 'auto', padding: '12px 32px' }}
            >
              {loading ? 'Enregistrement...' : (isEditMode ? 'Modifier' : 'Publier')}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
