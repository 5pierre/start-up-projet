import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import StarRating from './StarRating';
import RateUserForm from './RateUserForm';
import { getUserComments, getUserRatingSummary } from '../services/noteService';
import { getUser } from '../services/usersService';
import '../styles/RegisterStyle.css';
import './UserComments.css';

export default function UserComments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number.parseInt(id, 10);
  const currentUserId = Number.parseInt(localStorage.getItem('userId'), 10);

  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [comments, setComments] = useState([]);
  const [ratedUserName, setRatedUserName] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [showRateForm, setShowRateForm] = useState(false);
  const [showProfile, setShowProfile] = useState(false);

  useEffect(() => {
    if (!Number.isInteger(userId) || userId <= 0) {
      setError('ID utilisateur invalide.');
      setLoading(false);
      return;
    }
    const fetchAll = async () => {
      try {
        setLoading(true);
        setError(null);
        const [sRes, cRes, userRes] = await Promise.all([
          getUserRatingSummary(userId),
          getUserComments(userId),
          getUser(userId).catch(() => ({ data: { name: '' } })),
        ]);
        setSummary({ average: sRes.data?.average ?? 0, count: sRes.data?.count ?? 0 });
        setComments(cRes.data?.comments ?? []);
        setRatedUserName(userRes.data?.name || '');
      } catch (err) {
        console.error('Erreur chargement commentaires:', err);
        setError('Impossible de charger les commentaires.');
      } finally {
        setLoading(false);
      }
    };
    fetchAll();
  }, [userId]);

  const handleRateSuccess = () => {
    const fetchAll = async () => {
      try {
        const [sRes, cRes] = await Promise.all([
          getUserRatingSummary(userId),
          getUserComments(userId),
        ]);
        setSummary({ average: sRes.data?.average ?? 0, count: sRes.data?.count ?? 0 });
        setComments(cRes.data?.comments ?? []);
      } catch (err) {
        console.error('Erreur rafraîchissement:', err);
      }
    };
    fetchAll();
  };

  const canRate = Number.isInteger(currentUserId) && currentUserId > 0 && currentUserId !== userId;

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-comments">
        <div className="comments-wrap">
          <div className="comments-header">
            <button
              type="button"
              className="btn btn-secondary"
              onClick={() => navigate(-1)}
              style={{ marginBottom: 'var(--space-md)' }}
            >
              ← Retour
            </button>
            <h2 className="comments-title">Commentaires</h2>
          </div>

          <div className="comments-summary">
            <StarRating value={Number(summary.average) || 0} readOnly size={20} />
            <span className="comments-count">({summary.count} avis)</span>
          </div>

          {canRate && (
            <div className="comments-rate-cta">
              {!showRateForm ? (
                <button
                  type="button"
                  className="btn btn-primary"
                  style={{ maxWidth: 320 }}
                  onClick={() => setShowRateForm(true)}
                >
                  ✨ Noter cet utilisateur
                </button>
              ) : (
                <RateUserForm
                  ratedUserId={userId}
                  ratedUserName={ratedUserName}
                  onSuccess={handleRateSuccess}
                  onClose={() => setShowRateForm(false)}
                />
              )}
            </div>
          )}

          {loading && <div className="comments-loading">Chargement…</div>}
          {error && <div className="comments-error alert alert-error">{error}</div>}
          {!loading && !error && comments.length === 0 && (
            <p className="comments-empty">Aucun commentaire pour le moment.</p>
          )}

          {!loading && !error && comments.length > 0 && (
            <div className="comments-list">
              {comments.map((c) => (
                <div key={c.id} className="comment-card card">
                  <div className="comment-card-header">
                    <strong>{c.author_name || `User #${c.author_user_id}`}</strong>
                    <StarRating value={c.stars} readOnly size={18} />
                  </div>
                  <div className="comment-card-body">
                    {c.comment || <em>Pas de commentaire.</em>}
                  </div>
                  <div className="comment-card-date">
                    {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
