import React, { useEffect, useState } from 'react';
import StoryWrite from './StoryWrite';
import '../styles/RegisterStyle.css';
import Footer from './Footer';
import { getStories } from '../services/storyService';
import { logout } from '../services/authService';
import UserProfile from './UserProfile';
import Navbar from './Navbar';

export default function StoryRead() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [stories, setStories] = useState([]);
  const [error, setError] = useState(null);
  const [showProfile, setShowProfile] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');

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

  useEffect(() => {
    const userId = localStorage.getItem('userId');
    setIsAuthenticated(!!userId);
    fetchStories();
  }, []);

  const handleLogout = async () => {
    await logout();
  };

  const handleSearchChange = (value) => {
    setSearchTerm(value);
  };

  const addStory = (newStory) => {
    setStories([newStory, ...stories]);
  };

  const filteredStories = stories.filter((story) => {
    const text = `${story.content || ''} ${story.author_name || ''}`.toLowerCase();
    return text.includes(searchTerm.toLowerCase());
  });

  return (
    <>
      <Navbar
        onSearchChange={handleSearchChange}
        onProfileClick={() => setShowProfile(true)}
      />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="container-login100">
      <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
        <h1>Bienvenue sur Discute Potins 🎉</h1>
        <h2>Histoires</h2>
        <div id="story" className="story">
            {error && <p style={{color: 'red'}}>Erreur: {error}</p>}
            {!error && filteredStories.length === 0 ? (
                <p>Aucune histoire pour le moment.</p>
            ) : (
                !error && filteredStories.map((story, index) => (
                <div key={index} className="story-item">
                    <div className="story-content">
                      {story.content || story}
                    </div>
                    {story.author_name && (
                      <div className="story-meta">
                        <span className="story-author">Par {story.author_name}</span>
                        {story.created_at && (
                          <span className="story-date">
                            {new Date(story.created_at).toLocaleString('fr-FR')}
                          </span>
                        )}
                      </div>
                    )}
                </div>
                ))
            )}
            
        </div>
      </div>
      <div className="wrap-login100-write" style={{ flexDirection: 'column', alignItems: 'center' }}>
        {isAuthenticated && ( 
          <StoryWrite onSave={addStory} />
        )}        
      </div>
      <Footer />
      </div>
    </>
  );
}
