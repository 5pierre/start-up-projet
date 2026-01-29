import React, { useEffect, useState } from 'react';
// Importez la fonction existante getUser
import { getUser } from '../services/usersService'; 
import { getUserRatingSummary } from '../services/noteService';
import StarRating from './StarRating';
import '../styles/RegisterStyle.css'; 

export default function UserProfile({ onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [ratingSummary, setRatingSummary] = useState({ average: 0, count: 0 });
    const userIdRaw = localStorage.getItem('userId');
    const userId = Number.parseInt(userIdRaw, 10); 

    useEffect(() => {
        if (Number.isNaN(userId) || userId <= 0) { 
            setError("Aucun utilisateur connecté ou ID invalide.");
            setLoading(false);
            return;
        }

        const fetchProfile = async () => {
            try {
                setLoading(true);
                const response = await getUser(userId); 
                setProfile(response.data); 
                setError(null);
            } catch (err) {
                console.error("Erreur lors de la récupération du profil:", err);
                const errorMessage = err.response?.data || "Impossible de charger les données du profil. Veuillez vous reconnecter.";
                setError(errorMessage);
            } finally {
                setLoading(false);
            }
        };

        fetchProfile();
    }, [userId]);

    useEffect(() => {
        if (Number.isNaN(userId) || userId <= 0) return;
        const fetchRating = async () => {
            try {
                const res = await getUserRatingSummary(userId);
                setRatingSummary({
                    average: res.data?.average ?? 0,
                    count: res.data?.count ?? 0
                });
            } catch (err) {
                // On n'affiche pas d'erreur bloquante: le profil doit rester visible
                console.error("Erreur lors de la récupération de la note moyenne:", err);
            }
        };
        fetchRating();
    }, [userId]);

    return (
        <div className="profile-modal-overlay" onClick={(e) => e.target === e.currentTarget && onClose()}>
            <div className="wrap-login100 profile-modal-content">
                <button
                    type="button"
                    className="profile-modal-close"
                    onClick={onClose}
                    aria-label="Fermer"
                >
                    &times;
                </button>

                <h2 className="login100-form-title profile-modal-title">Mon Profil</h2>

                {loading && (
                    <p className="profile-modal-loading">Chargement…</p>
                )}

                {error && (
                    <div className="alert alert-error profile-modal-error">
                        Erreur: {error}
                    </div>
                )}

                {profile && (
                    <div className="profile-modal-body">
                        <div className="profile-modal-avatar-wrap">
                            <img
                                src={profile.photo || '/default-avatar.png'}
                                alt="Photo de profil"
                                className="profile-modal-avatar"
                            />
                        </div>
                        <div className="profile-modal-rating">
                            <StarRating value={Number(ratingSummary.average) || 0} readOnly size={20} />
                            <span className="profile-modal-rating-count">{ratingSummary.count} avis</span>
                        </div>
                        <div className="profile-modal-fields">
                            <p><strong>Nom :</strong> {profile.name}</p>
                            <p><strong>Email :</strong> {profile.email}</p>
                            <p><strong>Rôle :</strong> {profile.role}</p>
                            <p><strong>Ville :</strong> {profile.ville || 'Non renseignée'}</p>
                        </div>
                        <button
                            type="button"
                            onClick={() => { window.location.href = `/users/${userId}/comments`; }}
                            className="login100-form-btn profile-modal-btn"
                        >
                            Voir les commentaires
                        </button>
                    </div>
                )}
            </div>
        </div>
    );
}