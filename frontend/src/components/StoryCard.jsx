import React from 'react';

export default function StoryCard({ story, onView, onEdit, onDelete, canEdit, canDelete }) {
  const formatDate = (dateString) => {
    if (!dateString) return '';
    const date = new Date(dateString);
    return date.toLocaleDateString('fr-FR', {
      day: 'numeric',
      month: 'long',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  };

  return (
    <div
      style={{
        backgroundColor: '#ffffff',
        border: '1px solid #E2E2E2',
        borderRadius: '10px',
        padding: '20px',
        marginBottom: '16px',
        transition: 'all 0.3s ease',
        boxShadow: '0 2px 4px rgba(0,0,0,0.05)',
        cursor: onView ? 'pointer' : 'default'
      }}
      onMouseEnter={(e) => {
        if (onView) {
          e.currentTarget.style.backgroundColor = '#F9F7F2';
          e.currentTarget.style.borderColor = '#DEF2CA';
          e.currentTarget.style.boxShadow = '0 4px 8px rgba(0,0,0,0.1)';
        }
      }}
      onMouseLeave={(e) => {
        if (onView) {
          e.currentTarget.style.backgroundColor = '#ffffff';
          e.currentTarget.style.borderColor = '#E2E2E2';
          e.currentTarget.style.boxShadow = '0 2px 4px rgba(0,0,0,0.05)';
        }
      }}
      onClick={onView}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '12px' }}>
        <h3 style={{
          fontFamily: 'Montserrat-Bold, Poppins-Bold, sans-serif',
          color: '#171710',
          margin: 0,
          fontSize: '20px',
          flex: 1,
          wordBreak: 'break-word'
        }}>
          {story.title || story.titre || 'Sans titre'}
        </h3>
        {(canEdit || canDelete) && (
          <div style={{ display: 'flex', gap: '8px', marginLeft: '16px' }}>
            {canEdit && onEdit && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#DEF2CA',
                  color: '#171710',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Poppins-Medium, sans-serif',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#c6e6a8';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#DEF2CA';
                }}
              >
                Modifier
              </button>
            )}
            {canDelete && onDelete && (
              <button
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                    const storyId = story.id || story.story_id || story.id_story;
                    onDelete(storyId);
                  }
                }}
                style={{
                  padding: '6px 12px',
                  backgroundColor: '#fdeaea',
                  color: '#b91c1c',
                  border: 'none',
                  borderRadius: '6px',
                  cursor: 'pointer',
                  fontSize: '14px',
                  fontFamily: 'Poppins-Medium, sans-serif',
                  transition: 'all 0.3s'
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.backgroundColor = '#f5a1a1';
                  e.currentTarget.style.color = '#ffffff';
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.backgroundColor = '#fdeaea';
                  e.currentTarget.style.color = '#b91c1c';
                }}
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      <p style={{
        color: '#666',
        fontSize: '15px',
        lineHeight: '1.6',
        marginBottom: '12px',
        fontFamily: 'Poppins-Regular, sans-serif',
        display: '-webkit-box',
        WebkitLineClamp: 3,
        WebkitBoxOrient: 'vertical',
        overflow: 'hidden',
        wordBreak: 'break-word'
      }}>
        {story.content || story.contenu || story.description || story.description || 'Aucun contenu'}
      </p>

      <div style={{
        display: 'flex',
        justifyContent: 'space-between',
        alignItems: 'center',
        fontSize: '13px',
        color: '#999',
        fontFamily: 'Poppins-Regular, sans-serif'
      }}>
        <span>
          {story.author_name || story.authorName || story.user_name || story.nom_auteur || story.auteur || 'Auteur inconnu'}
        </span>
        {(story.created_at || story.createdAt || story.date_creation || story.date_publication) && (
          <span>
            {formatDate(story.created_at || story.createdAt || story.date_creation || story.date_publication)}
          </span>
        )}
      </div>
    </div>
  );
}
