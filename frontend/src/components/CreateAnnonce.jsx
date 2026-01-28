import React, { useState } from 'react';
import AudioAssistant from './AudioAssistant';
// import { createAnnonce } from '../services/annonceService'; // Si vous avez une fonction de création

export default function CreateAnnonce() {
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    lieu: '',
    date: ''
  });

  // Cette fonction est appelée automatiquement quand l'IA a fini
  const handleAutoFill = (dataIA) => {
    console.log("Données reçues de l'IA :", dataIA);
    setFormData(prev => ({
      ...prev,
      titre: dataIA.titre || prev.titre,
      description: dataIA.description || prev.description,
      prix: dataIA.prix || prev.prix,
      // On garde la date si format compatible, sinon on laisse vide
      date: dataIA.date || prev.date 
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    console.log("Annonce à envoyer :", formData);
    // Appeler ici votre service de création d'annonce (POST /annonces)
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial" }}>
      <h1>Créer une nouvelle annonce</h1>
      
      {/* Intégration du composant vocal */}
      <AudioAssistant onAnnonceGenerated={handleAutoFill} />

      <hr style={{ margin: "30px 0" }} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Titre de la tâche</label>
          <input 
            type="text" 
            name="titre" 
            value={formData.titre} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            placeholder="Ex: Réparation de fuite d'eau"
          />
        </div>

        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Description détaillée</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows="5"
            style={{ width: "100%", padding: "8px" }}
          />
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Prix proposé (€)</label>
            <input 
              type="number" 
              name="prix" 
              value={formData.prix || ''} 
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Date souhaitée</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date || ''} 
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>
        </div>

        <button 
          type="submit" 
          style={{ 
            marginTop: "20px", 
            padding: "15px", 
            backgroundColor: "#28a745", 
            color: "white", 
            border: "none", 
            fontSize: "18px", 
            cursor: "pointer" 
          }}
        >
          Valider l'annonce
        </button>
      </form>
    </div>
  );
}