import React, { useEffect, useState } from 'react';
import StoryWrite from "./StoryWrite";
import { useNavigate } from 'react-router-dom';
import '../styles/RegisterStyle.css';
import Footer from './Footer';
import { getStories } from '../services/storyService';
import { getConversations } from '../services/messageService';
import { logout } from '../services/authService';
import UserProfile from './UserProfile';


export default function StoryRead() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const navigate = useNavigate();
  const [stories, setStories] = useState([]);
  const [conversations, setConversations] = useState([]);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);

  const fetchStories = async () => {
    try {
      setError(null);
      const response = await getStories(); 
      
      if (response && response.data && response.data.stories) {
        setStories(response.data.stories); 
      } else {
        setStories([]);
      }
    } catch (err) {
      console.error('Erreur lors du chargement des histoires:', err);
      setError('Impossible de charger les histoires. Veuillez vérifier la connexion à l\'API.');
      setStories([]);
    }
  };

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
    
    fetchStories();

    // Si connecté, on charge aussi les conversations
    if (isAuth) {
        fetchConversations();
    }
  }, []);

  const handleLogout = async () => {
    await logout();
    setIsAuthenticated(false); // Mise à jour de l'état local
    setStories([]); // Optionnel : vider les histoires
    setConversations([]); // Optionnel : vider les conversations
    // navigate('/register'); // Optionnel : rediriger
  };

  const handleAuthClick = () => {
    if (isAuthenticated) {
      handleLogout();
    } else {
      navigate('/register');
    }
  };

  const addStory = (newStory) => {
    setStories([newStory, ...stories]);
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
        <h1>Bienvenue sur Discute Potins 🎉</h1>

        {/* --- NOUVELLE SECTION : MES DISCUSSIONS --- */}
        {isAuthenticated && conversations.length > 0 && (
            <div style={{ width: '100%', marginBottom: '30px' }}>
                <h3>Mes discussions</h3>
                <div style={{ display: 'flex', gap: '10px', flexWrap: 'wrap', justifyContent: 'center', marginTop: '10px' }}>
                    {conversations.map((user) => (
                        <button
                            key={user.id_user}
                            onClick={() => navigate(`/messages/${user.id_user}`)} // REDIRECTION
                            className="login100-form-btn" // Ou une autre classe CSS
                            style={{ width: 'auto', padding: '0 20px', minWidth: '150px' }}
                        >
                            {user.name} 💬
                        </button>
                    ))}
                </div>
            </div>
        )}

        {/* 2. NOUVELLE SECTION : BOUTONS DE TEST (Ajoutez ceci) */}
      {isAuthenticated && (
        <div style={{ width: '100%', marginBottom: '30px', padding: '20px', border: '2px dashed #ccc', borderRadius: '10px' }}>
            <h3>🚀 Démarrer une nouvelle discussion (Test)</h3>
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
      <div className="wrap-login100-write" style={{ flexDirection: 'column', alignItems: 'center' }}>
        {isAuthenticated && ( 
          <StoryWrite onSave={addStory} />
        )}        
      </div>
      <Footer />
    </div>
  );
}
