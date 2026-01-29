import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import logo from '../logostartup.png';

export default function Navbar({ onSearchChange, onProfileClick }) {
  const navigate = useNavigate();

  const isAuthenticated = !!localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      navigate('/register');
    }
  };

  const handleSearchInputChange = (e) => {
    if (onSearchChange) {
      onSearchChange(e.target.value);
    }
  };

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div className="navbar-logo" onClick={() => navigate('/')}>
          <img src={logo} alt="Logo" className="navbar-logo-img" />
        </div>
        <nav className="navbar-links">
          <Link to="/" className="navbar-link">
            Accueil
          </Link>
          <Link to="/annonces" className="navbar-link">
            Annonces
          </Link>
          <Link to="/messages" className="navbar-link">
            Messagerie
          </Link>
        </nav>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <input
            type="text"
            placeholder="Rechercher une annonce..."
            className="navbar-search-input"
            onChange={handleSearchInputChange}
          />
        </div>

        {isAuthenticated && (
          <button
            type="button"
            className="navbar-profile-btn"
            onClick={onProfileClick}
          >
            {userName ? userName.charAt(0).toUpperCase() : 'P'}
          </button>
        )}

        <button
          type="button"
          className="navbar-auth-btn"
          onClick={handleAuthClick}
        >
          {isAuthenticated ? 'Se déconnecter' : 'Connexion / Inscription'}
        </button>
      </div>
    </header>
  );
}

