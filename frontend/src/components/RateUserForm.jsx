import React, { useState } from 'react';
import StarRating from './StarRating';
import { rateUser } from '../services/noteService';
import '../styles/RegisterStyle.css';

export default function RateUserForm({ ratedUserId, ratedUserName, onSuccess, onClose }) {
  const [stars, setStars] = useState(0);
  const [comment, setComment] = useState('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [status, setStatus] = useState(null); // 'success' | 'error' | null
  const [errorMessage, setErrorMessage] = useState('');

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
      await rateUser({
        ratedUserId,
        stars,
        comment: comment.trim() || undefined
      });

      setStatus('success');
      setStars(0);
      setComment('');

      if (onSuccess) onSuccess();
      if (onClose) setTimeout(() => onClose(), 800);
    } catch (err) {
      setStatus('error');
      const msg = err.response?.data?.error || "Erreur lors de l'envoi de la note.";
      setErrorMessage(msg);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div
      style={{
        border: '1px solid #ddd',
        borderRadius: 10,
        padding: 20,
        backgroundColor: '#fff',
        marginBottom: 20
      }}
    >
      <h3 style={{ marginTop: 0, marginBottom: 16 }}>
        {ratedUserName ? `Noter ${ratedUserName}` : 'Noter cet utilisateur'}
      </h3>

      <form onSubmit={handleSubmit}>
        <div style={{ marginBottom: 16 }}>
          <label style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Note (étoiles) *
          </label>
          <StarRating value={stars} onChange={setStars} size={20} />
          {stars > 0 && (
            <span style={{ marginLeft: 12, color: '#666', fontSize: 14 }}>
              {stars} étoile{stars > 1 ? 's' : ''}
            </span>
          )}
        </div>

        <div style={{ marginBottom: 16 }}>
          <label htmlFor="comment" style={{ display: 'block', marginBottom: 8, fontWeight: 600 }}>
            Commentaire (optionnel)
          </label>
          <textarea
            id="comment"
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Partagez votre expérience..."
            rows={4}
            maxLength={1000}
            style={{
              width: '100%',
              padding: 10,
              border: '1px solid #ddd',
              borderRadius: 5,
              fontSize: 14,
              fontFamily: 'inherit',
              resize: 'vertical'
            }}
          />
          <div style={{ fontSize: 12, color: '#666', marginTop: 4 }}>
            {comment.length}/1000 caractères
          </div>
        </div>

        {status === 'error' && (
          <div
            style={{
              padding: 10,
              backgroundColor: '#fee',
              border: '1px solid #fcc',
              borderRadius: 5,
              color: '#c33',
              marginBottom: 12,
              fontSize: 14
            }}
          >
            {errorMessage}
          </div>
        )}

        {status === 'success' && (
          <div
            style={{
              padding: 10,
              backgroundColor: '#efe',
              border: '1px solid #cfc',
              borderRadius: 5,
              color: '#3c3',
              marginBottom: 12,
              fontSize: 14
            }}
          >
            ✓ Note envoyée !
          </div>
        )}

        <div style={{ display: 'flex', gap: 10 }}>
          <button
            type="submit"
            className="login100-form-btn"
            disabled={isSubmitting || stars === 0}
            style={{
              flex: 1,
              opacity: isSubmitting || stars === 0 ? 0.6 : 1,
              cursor: isSubmitting || stars === 0 ? 'not-allowed' : 'pointer'
            }}
          >
            {isSubmitting ? 'Envoi...' : 'Envoyer la note'}
          </button>
          {onClose && (
            <button
              type="button"
              onClick={onClose}
              className="login100-form-btn-logout"
              disabled={isSubmitting}
            >
              Annuler
            </button>
          )}
        </div>
      </form>
    </div>
  );
}

