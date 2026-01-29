import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import Navbar from './Navbar';
import Footer from './Footer';
import UserProfile from './UserProfile';
import AudioAssistant from './AudioAssistant';
import { createAnnonceData } from '../services/annonceService';
import '../styles/RegisterStyle.css';
import './CreateAnnonce.css';

// --- AJOUT STRIPE ---
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Remplacez par votre clé publique (la même que dans le .env)
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

// --- COMPOSANT FORMULAIRE DE PAIEMENT ---
const PaymentForm = ({ commissionAmount, onSuccess, onCancel }) => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [msg, setMsg] = useState('');

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!stripe || !elements) return;

    setLoading(true);
    setMsg('');

    // Confirmation du paiement
    const { error, paymentIntent } = await stripe.confirmPayment({
      elements,
      redirect: 'if_required', 
    });

    if (error) {
      setMsg(error.message);
      setLoading(false);
    } else if (paymentIntent && paymentIntent.status === 'succeeded') {
      // Si paiement OK, on déclenche la création finale
      onSuccess();
    }
  };

  return (
    <form onSubmit={handleSubmit} className="create-annonce-form" style={{textAlign: 'center'}}>
      <h3 style={{marginBottom: '20px', color: '#28a745'}}>Paiement de la commission</h3>
      <p style={{marginBottom: '20px'}}>
        Pour valider votre annonce, veuillez régler les frais de service de <strong>{(commissionAmount / 100).toFixed(2)} €</strong>.
      </p>
      
      <div style={{marginBottom: '20px', textAlign: 'left'}}>
        <PaymentElement />
      </div>

      {msg && <div className="alert alert-error">{msg}</div>}

      <div className="create-annonce-actions">
        <button type="button" className="btn btn-secondary" onClick={onCancel}>
          Retour
        </button>
        <button type="submit" className="btn btn-primary" disabled={!stripe || loading}>
          {loading ? 'Validation...' : 'Payer et Publier'}
        </button>
      </div>
    </form>
  );
};

// --- COMPOSANT PRINCIPAL ---
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

  // --- ÉTATS POUR LE PAIEMENT ---
  const [showPayment, setShowPayment] = useState(false);
  const [clientSecret, setClientSecret] = useState('');
  const [commissionAmount, setCommissionAmount] = useState(0);

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

  // 1. D'abord on initie le paiement
  const handleProceedToPayment = async (e) => {
    e.preventDefault();
    setError(null);

    const prix = parseFloat(formData.prix);
    if (!prix || prix <= 0) {
      setError("Veuillez entrer un prix valide pour calculer la commission.");
      return;
    }

    setSubmitting(true);

    try {
      // Calcul des 5% en centimes (Stripe attend des centimes)
      // Ex: 50€ * 0.05 = 2.50€ = 250 centimes
      const amountInCents = Math.round((prix * 0.05) * 100);
      // Minimum de 50 centimes pour Stripe
      const finalAmount = amountInCents < 50 ? 50 : amountInCents;
      
      setCommissionAmount(finalAmount);

      // Appel au backend pour préparer le paiement (port 3002 pour annonce-service)
      const res = await fetch("http://localhost:3002/api/pay", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ amount: finalAmount }),
      });

      const data = await res.json();
      
      if (data.clientSecret) {
        setClientSecret(data.clientSecret);
        setShowPayment(true); // On bascule vers l'écran de paiement
      } else {
        setError("Erreur lors de l'initialisation du paiement.");
      }
    } catch (err) {
      console.error('Erreur Paiement Init:', err);
      setError("Impossible de contacter le service de paiement.");
    } finally {
      setSubmitting(false);
    }
  };

  // 2. Ensuite, une fois payé, on crée vraiment l'annonce
  const handleFinalizeCreation = async () => {
    setSubmitting(true);
    try {
      await createAnnonceData(formData);
      // Succès total
      alert("Paiement accepté et annonce publiée !");
      navigate('/annonces');
    } catch (err) {
      console.error('Création annonce:', err);
      setError(err.response?.data?.error || "Paiement réussi mais erreur lors de la sauvegarde de l'annonce.");
      // Ici on reste sur la page pour qu'il puisse réessayer de sauvegarder sans repayer (idéalement)
      setShowPayment(false); 
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

          {/* Assistant Audio (visible seulement si on n'est pas en train de payer) */}
          {!showPayment && <AudioAssistant onAnnonceGenerated={handleAutoFill} />}

          {/* MODE FORMULAIRE CLASSIQUE */}
          {!showPayment ? (
            <form onSubmit={handleProceedToPayment} className="create-annonce-form">
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
                  {/* Affichage de la commission estimée */}
                  {formData.prix > 0 && (
                    <small style={{display: 'block', marginTop: '5px', color: '#666'}}>
                      Frais de publication (5%) : <strong>{(formData.prix * 0.05).toFixed(2)} €</strong>
                    </small>
                  )}
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
                  {submitting ? 'Chargement...' : 'Suivant (Paiement)'}
                </button>
              </div>
            </form>
          ) : (
            /* MODE PAIEMENT */
            clientSecret && (
              <Elements stripe={stripePromise} options={{ clientSecret, theme: 'stripe' }}>
                <PaymentForm 
                  commissionAmount={commissionAmount}
                  onSuccess={handleFinalizeCreation}
                  onCancel={() => setShowPayment(false)}
                />
              </Elements>
            )
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}