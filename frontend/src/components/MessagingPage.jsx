import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/RegisterStyle.css';

export default function MessagingPage() {
  return (
    <>
      <Navbar />
      <div className="container-login100">
        <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <h1>Espace messagerie</h1>
          <p>
            Cet espace permettra d&apos;échanger des messages entre utilisateurs.
            L&apos;intégration avec le backend se fera en fonction des routes disponibles.
          </p>
          <div
            style={{
              width: '100%',
              maxWidth: '800px',
              minHeight: '300px',
              borderRadius: '8px',
              border: '1px solid #ddd',
              padding: '16px',
              backgroundColor: '#fafafa',
              marginTop: '16px',
            }}
          >
            <p style={{ color: '#777' }}>
              Zone de discussion (UI prête à être connectée au service de messagerie).
            </p>
          </div>
        </div>
        <Footer />
      </div>
    </>
  );
}

