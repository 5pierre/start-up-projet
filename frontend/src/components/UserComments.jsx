import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import Footer from './Footer';
import StarRating from './StarRating';
import { getUserComments, getUserRatingSummary } from '../services/noteService';
import '../styles/RegisterStyle.css';

export default function UserComments() {
  const { id } = useParams();
  const navigate = useNavigate();
  const userId = Number.parseInt(id, 10);

  const [summary, setSummary] = useState({ average: 0, count: 0 });
  const [comments, setComments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

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
        const [sRes, cRes] = await Promise.all([
          getUserRatingSummary(userId),
          getUserComments(userId)
        ]);
        setSummary({
          average: sRes.data?.average ?? 0,
          count: sRes.data?.count ?? 0
        });
        setComments(cRes.data?.comments ?? []);
      } catch (err) {
        console.error('Erreur chargement commentaires:', err);
        setError("Impossible de charger les commentaires.");
      } finally {
        setLoading(false);
      }
    };

    fetchAll();
  }, [userId]);

  return (
    <div className="container-login100" style={{ flexDirection: 'column' }}>
      <div className="wrap-login100" style={{ flexDirection: 'column', width: '800px', maxWidth: '95vw' }}>
        <button
          onClick={() => navigate(-1)}
          className="login100-form-btn-logout"
          style={{ alignSelf: 'flex-start', marginBottom: '12px' }}
        >
          ← Retour
        </button>

        <h2 style={{ marginBottom: 10 }}>Commentaires</h2>

        <div style={{ marginBottom: 18 }}>
          <StarRating value={Number(summary.average) || 0} readOnly size={20} />
          <span style={{ marginLeft: 10, color: '#555' }}>
            ({summary.count} avis)
          </span>
        </div>

        {loading && <p>Chargement...</p>}
        {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Erreur: {error}</p>}

        {!loading && !error && comments.length === 0 && <p>Aucun commentaire pour le moment.</p>}

        {!loading && !error && comments.length > 0 && (
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            {comments.map((c) => (
              <div
                key={c.id}
                style={{
                  border: '1px solid #eee',
                  borderRadius: 10,
                  padding: 14,
                  background: '#fff'
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 12 }}>
                  <strong>{c.author_name || `User #${c.author_user_id}`}</strong>
                  <StarRating value={c.stars} readOnly size={18} />
                </div>
                <div style={{ marginTop: 8, color: '#333' }}>
                  {c.comment ? c.comment : <em>Pas de commentaire.</em>}
                </div>
                <div style={{ marginTop: 8, fontSize: 12, color: '#777' }}>
                  {c.created_at ? new Date(c.created_at).toLocaleString() : ''}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
      <Footer />
    </div>
  );
}

