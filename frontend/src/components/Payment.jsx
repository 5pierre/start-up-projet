import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import { Elements, PaymentElement, useStripe, useElements } from "@stripe/react-stripe-js";
import Navbar from "./Navbar";
import Footer from "./Footer";
import BackButton from "./BackButton";
import "../styles/RegisterStyle.css";
import "./Payment.css";

const stripePublishableKey = process.env.REACT_APP_STRIPE_PUBLIC_KEY;
const stripePromise = stripePublishableKey ? loadStripe(stripePublishableKey) : null;

function CheckoutForm() {
  const stripe = useStripe();
  const elements = useElements();
  const [message, setMessage] = useState(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!stripe || !elements) return;

    setIsProcessing(true);

    const { error } = await stripe.confirmPayment({
      elements,
      confirmParams: {
        return_url: `${window.location.origin}/`,
      },
    });

    if (error) setMessage(error.message);

    setIsProcessing(false);
  };

  return (
    <form onSubmit={handleSubmit} className="payment-form">
      <PaymentElement />
      <button
        type="submit"
        className="btn btn-primary payment-submit"
        disabled={isProcessing || !stripe || !elements}
      >
        {isProcessing ? "Traitement…" : "Payer 5,00 €"}
      </button>
      {message && <div className="alert alert-error payment-message">{message}</div>}
    </form>
  );
}

export default function Payment() {
  const [clientSecret, setClientSecret] = useState("");

  useEffect(() => {
    fetch("http://localhost:3002/api/pay", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ amount: 500 }),
    })
      .then((res) => res.json())
      .then((data) => setClientSecret(data.clientSecret));
  }, []);

  const options = {
    clientSecret,
    theme: "stripe",
  };

  if (!stripePromise) {
    return (
      <>
        <Navbar />
        <div className="page-payment">
          <BackButton to="/" />
          <div className="payment-wrap card">
            <h1 className="payment-title">Paiement sécurisé</h1>
            <div className="alert alert-error">
              Clé Stripe manquante. Ajoutez <code>REACT_APP_STRIPE_PUBLIC_KEY</code> dans un fichier <code>.env</code> à la racine du dossier <code>frontend</code>, puis redémarrez l&apos;application.
            </div>
          </div>
        </div>
        <Footer />
      </>
    );
  }

  return (
    <>
      <Navbar />
      <div className="page-payment">
        <BackButton to="/" />
        <div className="payment-wrap card">
          <h1 className="payment-title">Paiement sécurisé</h1>
          <p className="payment-desc">Soutenez le site avec un don de 5 €.</p>
          {clientSecret ? (
            <Elements options={options} stripe={stripePromise}>
              <CheckoutForm />
            </Elements>
          ) : (
            <p className="payment-loading">Chargement du formulaire de paiement…</p>
          )}
        </div>
      </div>
      <Footer />
    </>
  );
}
