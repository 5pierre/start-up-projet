import React from 'react';
import { useNavigate } from 'react-router-dom';
import './BackButton.css';

/**
 * Bouton de retour : utilise useNavigate(-1) ou la route optionnelle `to`.
 * @param {string} [to] - Route optionnelle (ex: "/annonces"). Si absent, retour historique.
 * @param {string} [label] - Texte du bouton (défaut : "← Retour")
 * @param {string} [className] - Classes CSS additionnelles
 */
export default function BackButton({ to, label = '← Retour', className = '' }) {
  const navigate = useNavigate();

  const handleClick = () => {
    if (to) {
      navigate(to);
    } else {
      navigate(-1);
    }
  };

  return (
    <button
      type="button"
      className={`back-btn ${className}`.trim()}
      onClick={handleClick}
      aria-label={label}
    >
      {label}
    </button>
  );
}
