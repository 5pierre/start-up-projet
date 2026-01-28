import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterStyle.css';
import Footer from './Footer';
import { getConversations } from '../services/messageService';
import { logout } from '../services/authService';
import UserProfile from './UserProfile';


export default function StoryRead() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [conversations, setConversations] = useState([]);
  const [showProfile, setShowProfile] = useState(false);
  const [showContacts, setShowContacts] = useState(false);

  const fetchConversations = async () => {
    try {
      const data = await getConversations();
      // On s'assure que c'est bien un tableau
      setConversations(data.conversations || []);
    } catch (err) {
      console.error("Erreur chargement contacts", err);
    }
  };

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    const isAuth = !!userId;
    setIsAuthenticated(isAuth);

    // Si connecté, on charge aussi les conversations
    if (isAuth) {
        fetchConversations();
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false); // Mise à jour de l'état local 
    setConversations([]); // Optionnel : vider les conversations
    setShowContacts(false);
    // navigate('/register'); // Optionnel : rediriger
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/register');
    }
  };


  return (
    <div className="container-login100">
        <button
            onClick={handleAuthClick}
            className="login100-form-btn-logout"
            style={{ textAlign: 'center' }}
            >
            {isAuthenticated ? 'Se déconnecter' : 'Inscription'}
        </button>
        {isAuthenticated && (
            <button
                onClick={() => navigate('/messages')}
                className="login100-form-btn-logout"
                style={{ textAlign: 'center', marginLeft: '10px' }}
            >
                Voir mes messages
            </button>
        )}
        {isAuthenticated && (
            <button
                onClick={() => setShowProfile(true)}
                className="login100-form-btn-logout"
                style={{ textAlign: 'center', right: '150px' }} 
            >
                Voir Mon Profil
            </button>
        )}
        {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <h1>Bienvenue sur Discute Potins</h1>

        {/* --- SECTION CONTACTS (TABLEAU) --- */}
        {isAuthenticated && (
            <div style={{ width: '100%', maxWidth: '800px', marginBottom: '30px', textAlign: 'center' }}>
                
                {/* 1. Le Bouton pour afficher/masquer */}
                <button 
                    onClick={() => setShowContacts(!showContacts)}
                    className="login100-form-btn"
                    style={{ margin: '0 auto 20px auto', backgroundColor: '#333' }}
                >
                    {showContacts ? 'Masquer mes discussions' : 'Voir avec qui j\'ai discuté'}
                </button>

                {/* 2. Le Tableau qui s'affiche au clic */}
                {showContacts && (
                    <div style={{ overflowX: 'auto', backgroundColor: 'white', borderRadius: '10px', padding: '10px', boxShadow: '0 4px 6px rgba(0,0,0,0.1)' }}>
                        {conversations.length === 0 ? (
                            <p style={{ padding: '20px' }}>Vous n'avez pas encore de discussions.</p>
                        ) : (
                            <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                                <thead>
                                    <tr style={{ backgroundColor: '#f2f2f2', borderBottom: '2px solid #ddd' }}>
                                        <th style={{ padding: '12px', textAlign: 'center' }}>Utilisateur</th>
                                    </tr>
                                </thead>
                                <tbody>
                                    {conversations.map((user) => (
                                        <tr key={user.id_user} style={{ borderBottom: '1px solid #eee' }}>
                                            <td style={{ padding: '12px', textAlign: 'center' }}>
                                                <button
                                                    onClick={() => navigate(`/messages/${user.id_user}`)}
                                                    style={{
                                                        backgroundColor: '#007bff',
                                                        color: 'white',
                                                        border: 'none',
                                                        padding: '8px 15px',
                                                        borderRadius: '5px',
                                                        cursor: 'pointer'
                                                    }}
                                                >
                                                     <span style={{ marginRight: '10px', backgroundColor: '#ddd', borderRadius: '50%', padding: '5px 10px' }}>
                                                        {user.name.charAt(0).toUpperCase()}
                                                    </span>
                                                     {user.name}
                                                </button>
                                            </td>
                                        </tr>
                                    ))}
                                </tbody>
                            </table>
                        )}
                    </div>
                )}
            </div>
        )}


      {/* 2. NOUVELLE SECTION : BOUTONS DE TEST (Ajoutez ceci) */}
      {isAuthenticated && (
        <div style={{ width: '100%', marginBottom: '30px', padding: '20px', border: '2px dashed #ccc', borderRadius: '10px' }}>
            <h3> Démarrer une nouvelle discussion (Test)</h3>
            <p style={{fontSize: '0.9rem', marginBottom: '10px'}}>Cliquez pour écrire à :</p>
            
            <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center' }}>
                {/* Bouton vers User 3 */}
                <button
                    onClick={() => navigate('/messages/3')}
                    className="login100-form-btn"
                    style={{ width: 'auto', minWidth: '120px', backgroundColor: '#007bff' }}
                >
                    User 3
                </button>

                {/* Bouton vers User 4 */}
                <button
                    onClick={() => navigate('/messages/4')}
                    className="login100-form-btn"
                    style={{ width: 'auto', minWidth: '120px', backgroundColor: '#28a745' }}
                >
                    User 4
                </button>

                {/* Bouton vers User 5 */}
                <button
                    onClick={() => navigate('/messages/5')}
                    className="login100-form-btn"
                    style={{ width: 'auto', minWidth: '120px', backgroundColor: '#dc3545' }}
                >
                    User 5
                </button>
            </div>
        </div>
      )}

      </div>
      <Footer />
    </div>
  );
}
