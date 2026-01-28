import React, { useEffect, useState } from 'react';
// Importez la fonction existante getUser
import { getUser } from '../services/usersService'; 
import '../styles/RegisterStyle.css'; 

export default function UserProfile({ onClose }) {
    const [profile, setProfile] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
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

    return (
        <div className="profile-modal-overlay" style={{
            position: 'fixed',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(23, 23, 16, 0.7)',
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
                position: 'relative',
                marginTop: 0
            }}>
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
                    Mon Profil
                </h2>

                {loading && (
                    <p style={{ color: '#171710', textAlign: 'center', padding: '20px' }}>
                        Chargement...
                    </p>
                )}

                {error && (
                    <div style={{ 
                        backgroundColor: '#fdeaea', 
                        color: '#b91c1c', 
                        padding: '12px 20px', 
                        borderRadius: '8px', 
                        marginBottom: '20px',
                        border: '1px solid #f5a1a1'
                    }}>
                        Erreur: {error}
                    </div>
                )}

                {profile && (
                    <div style={{ width: '100%' }}>
                        <div style={{ 
                            marginBottom: '20px',
                            padding: '15px',
                            backgroundColor: '#F0EEE8',
                            borderRadius: '8px'
                        }}>
                            <p style={{ 
                                marginBottom: '12px',
                                fontFamily: 'Montserrat-Bold, sans-serif',
                                color: '#171710',
                                fontSize: '16px'
                            }}>
                                <strong>Nom :</strong> <span style={{ fontFamily: 'Poppins-Regular, sans-serif', fontWeight: 'normal' }}>{profile.name}</span>
                            </p>
                            <p style={{ 
                                marginBottom: '12px',
                                fontFamily: 'Montserrat-Bold, sans-serif',
                                color: '#171710',
                                fontSize: '16px'
                            }}>
                                <strong>Email :</strong> <span style={{ fontFamily: 'Poppins-Regular, sans-serif', fontWeight: 'normal' }}>{profile.email}</span>
                            </p>
                            <p style={{ 
                                marginBottom: 0,
                                fontFamily: 'Montserrat-Bold, sans-serif',
                                color: '#171710',
                                fontSize: '16px'
                            }}>
                                <strong>Rôle :</strong> <span style={{ fontFamily: 'Poppins-Regular, sans-serif', fontWeight: 'normal' }}>{profile.role}</span>
                            </p>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}