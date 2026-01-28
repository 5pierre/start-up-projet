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
        <div className="profile-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0, 0, 0, 0.7)',
            display: 'flex',
            justifyContent: 'center',
            alignItems: 'center',
            zIndex: 1000 
        }}>
            <div className="wrap-login100" style={{ 
                flexDirection: 'column', 
                alignItems: 'flex-start',
                padding: '40px',
                width: '400px', 
                position: 'relative' 
            }}>
                <button 
                    onClick={onClose} 
                    style={{
                        position: 'absolute',
                        top: '10px',
                        right: '10px',
                        backgroundColor: 'transparent',
                        border: 'none',
                        fontSize: '20px',
                        cursor: 'pointer',
                        color: '#999'
                    }}
                >
                    &times; 
                </button>

                <h2 style={{ color: '#333', marginBottom: '20px' }}>👤 Mon Profil</h2>

                {loading && <p>Chargement...</p>}

                {error && <p style={{ color: 'red', fontWeight: 'bold' }}>Erreur: {error}</p>}

                {profile && (
                    <div style={{ width: '100%', textAlign: 'center' }}>
                        <div style={{ marginBottom: '20px' }}>
                            <img
                                src={profile.photo || '/default-avatar.png'}
                                alt="Photo de profil"
                                style={{
                                width: '120px',
                                height: '120px',
                                borderRadius: '50%',
                                objectFit: 'cover',
                                border: '3px solid #4CAF50'
                                }}
                            />
                        </div>
                        <div style={{ marginBottom: '18px' }}>
                            <StarRating value={Number(ratingSummary.average) || 0} readOnly size={20} />
                            <div style={{ fontSize: 12, color: '#666', marginTop: 6 }}>
                                {ratingSummary.count} avis
                            </div>
                        </div>
                        <div style={{ textAlign: 'left' }}>
                            <p><strong>Nom :</strong> {profile.name}</p>
                            <p><strong>Email :</strong> {profile.email}</p>
                            <p><strong>Rôle :</strong> {profile.role}</p>
                            <p><strong>Ville :</strong> {profile.ville || 'Non renseignée'}</p>
                        </div>
                        <div style={{ marginTop: 18 }}>
                            <button
                                type="button"
                                onClick={() => { window.location.href = `/users/${userId}/comments`; }}
                                className="login100-form-btn"
                                style={{ width: '100%', maxWidth: 260, margin: '0 auto' }}
                            >
                                Voir les commentaires
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}