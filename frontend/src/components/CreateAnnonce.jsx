import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import AudioAssistant from './AudioAssistant';
import { createAnnonceData } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './CreateAnnonce.css';

export default function CreateAnnonce() {
  const navigate = useNavigate();
  const [showProfile, setShowProfile] = useState(false);
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    lieu: '',
    date: '',
    id_user: localStorage.getItem('userId'),
  });
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState(null);

  const handleAutoFill = (dataIA) => {
    setFormData((prev) => ({
      ...prev,
      titre: dataIA.titre || prev.titre,
      description: dataIA.description || prev.description,
      prix: dataIA.prix != null ? dataIA.prix : prev.prix,
      lieu: dataIA.lieu || prev.lieu,
      date: dataIA.date || prev.date,
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setSubmitting(true);
    try {
      await createAnnonceData(formData);
      navigate('/annonces');
    } catch (err) {
      console.error('Création annonce:', err);
      setError(err.response?.data?.error || "Erreur lors de la création de l'annonce.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <>
      <Navbar onProfileClick={() => setShowProfile(true)} />
      {showProfile && <UserProfile onClose={() => setShowProfile(false)} />}
      <div className="page-create-annonce">
        <div className="create-annonce-wrap card">
          <h1 className="create-annonce-title">Créer une annonce</h1>
          <p className="create-annonce-subtitle">
            Décrivez la tâche ou le service que vous proposez ou recherchez.
          </p>

          <AudioAssistant onAnnonceGenerated={handleAutoFill} />

          <form onSubmit={handleSubmit} className="create-annonce-form">
            <div className="form-group">
              <label htmlFor="titre">Titre de la tâche *</label>
              <input
                id="titre"
                type="text"
                name="titre"
                value={formData.titre}
                onChange={handleChange}
                placeholder="Ex. : Réparation de fuite d'eau, Aide jardinage…"
                required
                className="input100"
              />
            </div>

            <div className="form-group">
              <label htmlFor="description">Description détaillée *</label>
              <textarea
                id="description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                rows={5}
                placeholder="Décrivez la mission, les compétences requises, etc."
                required
                className="story-textarea"
              />
            </div>

            <div className="form-group">
              <label htmlFor="lieu">Lieu *</label>
              <input
                id="lieu"
                type="text"
                name="lieu"
                value={formData.lieu}
                onChange={handleChange}
                placeholder="Ex. : Lyon, Paris 15e…"
                required
                className="input100"
              />
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="prix">Prix proposé (€) *</label>
                <input
                  id="prix"
                  type="number"
                  name="prix"
                  value={formData.prix || ''}
                  onChange={handleChange}
                  min="0"
                  step="1"
                  required
                  className="input100"
                />
              </div>
              <div className="form-group">
                <label htmlFor="date">Date souhaitée *</label>
                <input
                  id="date"
                  type="date"
                  name="date"
                  value={formData.date || ''}
                  onChange={handleChange}
                  required
                  className="input100"
                />
              </div>
            </div>

            {error && (
              <div className="alert alert-error" role="alert">
                {error}
              </div>
            )}

            <div className="create-annonce-actions">
              <button
                type="button"
                className="btn btn-secondary"
                onClick={() => navigate('/annonces')}
              >
                Annuler
              </button>
              <button
                type="submit"
                className="btn btn-primary"
                disabled={submitting}
              >
                {submitting ? 'Envoi…' : 'Publier l\'annonce'}
              </button>
            </div>
          </form>
        </div>
      </div>
      <Footer />
    </>
  );
}
