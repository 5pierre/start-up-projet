import React from 'react';
import './StoryCard.css';

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

  const handleCardClick = (e) => {
    if (onView && !e.target.closest('.story-card-actions')) onView();
  };

  return (
    <div
      className={`story-card ${onView ? 'story-card-clickable' : ''}`}
      onClick={handleCardClick}
      onKeyDown={(e) => onView && (e.key === 'Enter' || e.key === ' ') && onView()}
      role={onView ? 'button' : 'article'}
      tabIndex={onView ? 0 : -1}
    >
      <div className="story-card-header">
        <h3 className="story-card-title">
          {story.title || story.titre || 'Sans titre'}
        </h3>
        {(canEdit || canDelete) && (
          <div className="story-card-actions">
            {canEdit && onEdit && (
              <button
                type="button"
                className="story-card-btn-edit"
                onClick={(e) => {
                  e.stopPropagation();
                  onEdit(story);
                }}
              >
                Modifier
              </button>
            )}
            {canDelete && onDelete && (
              <button
                type="button"
                className="story-card-btn-delete"
                onClick={(e) => {
                  e.stopPropagation();
                  if (window.confirm('Êtes-vous sûr de vouloir supprimer cette annonce ?')) {
                    const storyId = story.id || story.story_id || story.id_story;
                    onDelete(storyId);
                  }
                }}
              >
                Supprimer
              </button>
            )}
          </div>
        )}
      </div>

      <p className="story-card-body">
        {story.content || story.contenu || story.description || 'Aucun contenu'}
      </p>

      <div className="story-card-meta">
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
