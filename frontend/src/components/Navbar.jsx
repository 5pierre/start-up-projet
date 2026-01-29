import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { logout } from '../services/authService';
import logo from '../logostartup.png';

export default function Navbar({ onSearchChange, onProfileClick }) {
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const isAuthenticated = !!localStorage.getItem('userId');
  const userName = localStorage.getItem('userName');

  useEffect(() => {
    const close = () => setMenuOpen(false);
    window.addEventListener('resize', close);
    return () => window.removeEventListener('resize', close);
  }, []);

  useEffect(() => {
    if (menuOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [menuOpen]);

  const handleAuthClick = async () => {
    if (isAuthenticated) {
      await logout();
    } else {
      navigate('/register');
    }
    setMenuOpen(false);
  };

  const handleSearchInputChange = (e) => {
    if (typeof onSearchChange === 'function') onSearchChange(e.target.value);
  };

  const handleLinkClick = () => setMenuOpen(false);

  return (
    <header className="navbar">
      <div className="navbar-left">
        <div
          className="navbar-logo"
          onClick={() => { navigate('/'); setMenuOpen(false); }}
          role="button"
          tabIndex={0}
          onKeyDown={(e) => e.key === 'Enter' && navigate('/')}
          aria-label="Accueil"
        >
          <img src={logo} alt="Logo" className="navbar-logo-img" />
        </div>

        <nav className="navbar-links">
          <Link to="/" className="navbar-link" onClick={handleLinkClick}>
            Accueil
          </Link>
          <Link to="/annonces" className="navbar-link" onClick={handleLinkClick}>
            Annonces
          </Link>
          <Link to="/messages" className="navbar-link" onClick={handleLinkClick}>
            Messagerie
          </Link>
        </nav>
      </div>

      <div className="navbar-right">
        <div className="navbar-search">
          <input
            type="search"
            placeholder="Rechercher…"
            className="navbar-search-input"
            onChange={handleSearchInputChange}
            aria-label="Rechercher une annonce"
          />
        </div>

        {isAuthenticated && (
          <button
            type="button"
            className="navbar-profile-btn"
            onClick={onProfileClick}
            aria-label="Mon profil"
          >
            {userName ? userName.charAt(0).toUpperCase() : 'P'}
          </button>
        )}

        <button
          type="button"
          className="navbar-auth-btn"
          onClick={handleAuthClick}
        >
          {isAuthenticated ? 'Déconnexion' : 'Connexion'}
        </button>
      </div>

      <button
        type="button"
        className="navbar-burger"
        onClick={() => setMenuOpen(!menuOpen)}
        aria-expanded={menuOpen}
        aria-label="Menu"
      >
        <span className="navbar-burger-bar" />
        <span className="navbar-burger-bar" />
        <span className="navbar-burger-bar" />
      </button>
      <div
        className={`navbar-overlay ${menuOpen ? 'navbar-overlay-open' : ''}`}
        onClick={() => setMenuOpen(false)}
        aria-hidden="true"
      />
      <div className={`navbar-drawer ${menuOpen ? 'navbar-drawer-open' : ''}`}>
        <nav className="navbar-drawer-links">
          <Link to="/" className="navbar-drawer-link" onClick={handleLinkClick}>
            Accueil
          </Link>
          <Link to="/annonces" className="navbar-drawer-link" onClick={handleLinkClick}>
            Annonces
          </Link>
          <Link to="/messages" className="navbar-drawer-link" onClick={handleLinkClick}>
            Messagerie
          </Link>
        </nav>
        <div className="navbar-drawer-search">
          <input
            type="search"
            placeholder="Rechercher une annonce…"
            className="navbar-search-input navbar-drawer-search-input"
            onChange={handleSearchInputChange}
            aria-label="Rechercher une annonce"
          />
        </div>
      </div>
    </header>
  );
}
