import React from 'react';
import Navbar from './Navbar';
import Footer from './Footer';
import '../styles/RegisterStyle.css';

export default function HomePage() {
  return (
    <>
      <Navbar />
      <div className="container-login100">
        <div className="wrap-login100" style={{ flexDirection: 'column', alignItems: 'center' }}>
          <h1>Bienvenue sur Discute Potins 🎉</h1>
          <p>
            Plateforme de discussion et d&apos;échange entre utilisateurs.
          </p>
        </div>
      </div>
      <Footer />
    </>
  );
}
