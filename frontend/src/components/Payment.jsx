import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";

// Charge la clé publique
const stripePromise = loadStripe(process.env.REACT_APP_STRIPE_PUBLIC_KEY);

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    // Confirmer le paiement
    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        // Redirection après succès (page d'accueil ou page de confirmation)
        return_url: `${window.location.origin}/`, 
      },
    });

    // Si on arrive ici, c'est qu'il y a eu une erreur immédiate (ex: carte refusée)
    if (error) setMessage(error.message);
    
    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} style={{ marginTop: "20px" }}>
      {/* C'est ce composant magique qui crée le joli formulaire complet */}
      <PaymentElement />
      
      <button 
        disabled={isProcessing || !stripe || !elements} 
        style={{
          marginTop: "20px", 
          width: "100%", 
          padding: "12px", 
          backgroundColor: "#28a745", 
          color: "white", 
          border: "none", 
          borderRadius: "5px",
          fontSize: "16px",
          cursor: "pointer"
        }}
      >
        {isProcessing ? "Traitement..." : "Payer 5.00 €"}
      </button>
      
      {message && <div style={{ color: "red", marginTop: "10px" }}>{message}</div>}
    </form>
  );
}

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    // On crée l'intention de paiement dès le chargement de la page
    fetch("http://localhost:3002/api/pay", { // Assurez-vous que le port est bon (5002 pour annonce-service)
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500 }), // 5€
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = {
    clientSecret,
    theme: 'stripe', // Thème automatique
  };

  return (
    <div style={{ maxWidth: "500px", margin: "50px auto", padding: "30px", boxShadow: "0 0 10px rgba(0,0,0,0.1)", borderRadius: "8px" }}>
      <h2 style={{ textAlign: "center", marginBottom: "20px" }}>Paiement Sécurisé</h2>
      
      {clientSecret ? (
        <Elements options={options} stripe={stripePromise}>
          <CheckoutForm />
        </Elements>
      ) : (
        <p style={{ textAlign: "center" }}>Chargement du paiement...</p>
      )}
    </div>
  );
}