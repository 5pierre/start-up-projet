import React, { useState, useEffect } from 'react';
import StarRating from './StarRating';
import { rateUser, getMyRating } from '../services/noteService';
import '../styles/RegisterStyle.css';
import './RateUserForm.css';

export default function RateUserForm({ ratedUserId, ratedUserName, onSuccess, onClose }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null);
  const [errorMessage, setErrorMessage] = useState('');

  useEffect(() => {
    if (ratedUserId) {
      getMyRating(ratedUserId)
        .then((response) => {
          if (response.data) {
            // Si une note existe, on pré-remplit les champs
            setStars(response.data.stars);
            setComment(response.data.comment || '');
          }
        })
        .catch((err) => {
          console.error("Erreur lors de la récupération de l'avis existant", err);
        });
    }
  }, [ratedUserId]);


  const handleSubmit = async (e) => {
    e.preventDefault();
    if (stars === 0) {
      setStatus('error');
      setErrorMessage("Veuillez sélectionner un nombre d'étoiles.");
      return;
    }
    setIsSubmitting(true);
    setStatus(null);
    setErrorMessage('');
    try {
      await rateUser({ ratedUserId, stars, comment: comment.trim() || undefined });
      setStatus('success');
      if (onSuccess) onSuccess();
      if (onClose) setTimeout(onClose, 800);
    } catch (err) {
      setStatus('error');
      setErrorMessage(err.response?.data?.error || "Erreur lors de l'envoi de la note.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="rate-form card">
      <h3 className="rate-form-title">
        {ratedUserName ? `Noter ${ratedUserName}` : 'Noter cet utilisateur'}
      </h3>
      <form onSubmit={handleSubmit}>
        <div className="rate-form-group">
          <label className="rate-form-label">Note (étoiles) *</label>
          <div className="rate-form-stars">
            <StarRating value={stars} onChange={setStars} size={24} />
            {stars > 0 && (
              <span className="rate-form-stars-hint">
                {stars} étoile{stars > 1 ? 's' : ''}
              </span>
            )}
          </div>
        </div>
        <div className="rate-form-group">
          <label htmlFor="rate-comment" className="rate-form-label">
            Commentaire (optionnel)
          </label>
          <textarea
            id="rate-comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience…"
            rows={4}
            maxLength={1000}
            className="rate-form-textarea"
          />
          <span className="rate-form-chars">{comment.length}/1000</span>
        </div>
        {status === 'error' && (
          <div className="alert alert-error" style={{ marginBottom: 'var(--space-md)' }}>
            {errorMessage}
          </div>
        )}
        {status === 'success' && (
          <div className="alert alert-success" style={{ marginBottom: 'var(--space-md)' }}>
            ✓ Note envoyée !
          </div>
        )}
        <div className="rate-form-actions">
          {onClose && (
            <button
              type="button"
              className="btn btn-secondary"
              onClick={onClose}
              disabled={isSubmitting}
            >
              Annuler
            </button>
          )}
          <button
            type="submit"
            className="btn btn-primary"
            disabled={isSubmitting || stars === 0}
          >
            {isSubmitting ? 'Envoi…' : 'Envoyer la note'}
          </button>
        </div>
      </form>
    </div>
  );
}
