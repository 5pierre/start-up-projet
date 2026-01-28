import React, { useState } from 'react';
import AudioAssistant from './AudioAssistant';
import { createAnnonceData } from '../services/annonceService'; 
import { useNavigate } from 'react-router-dom';

export default function CreateAnnonce() {
  const navigate = useNavigate();
  
  const [formData, setFormData] = useState({
    titre: '',
    description: '',
    prix: '',
    lieu: '',
    date: '',
    id_user: localStorage.getItem('userId')
  });

  // Cette fonction est appelée automatiquement quand l'IA a fini
  const handleAutoFill = (dataIA) => {
    console.log("Données reçues de l'IA :", dataIA);
    setFormData(prev => ({
      ...prev,
      titre: dataIA.titre || prev.titre,
      description: dataIA.description || prev.description,
      prix: dataIA.prix || prev.prix,
      lieu: dataIA.lieu || prev.lieu, // L'IA remplit le lieu si détecté
      date: dataIA.date || prev.date 
    }));
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      console.log("Annonce à envoyer :", formData);
      
      // --- CORRECTION MAJEURE ICI ---
      // On envoie l'objet entier 'formData' car votre service attend un objet unique
      const result = await createAnnonceData(formData);
      
      console.log("Annonce créée :", result);
      
      alert("Annonce créée avec succès !");
      navigate('/annonces');
      
    } catch (error) {
      console.error("Erreur lors de la création :", error);
      alert("Erreur lors de la création de l'annonce.");
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px", fontFamily: "Arial" }}>
      <h1>Créer une nouvelle annonce</h1>
      
      {/* Intégration du composant vocal */}
      <AudioAssistant onAnnonceGenerated={handleAutoFill} />

      <hr style={{ margin: "30px 0" }} />

      <form onSubmit={handleSubmit} style={{ display: "flex", flexDirection: "column", gap: "15px" }}>
        
        {/* TITRE */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Titre de la tâche *</label>
          <input 
            type="text" 
            name="titre" 
            value={formData.titre} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            placeholder="Ex: Réparation de fuite d'eau"
            required
          />
        </div>

        {/* DESCRIPTION */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Description détaillée *</label>
          <textarea 
            name="description" 
            value={formData.description} 
            onChange={handleChange}
            rows="5"
            style={{ width: "100%", padding: "8px" }}
            required
          />
        </div>

        {/* LIEU (Ajouté) */}
        <div>
          <label style={{ display: "block", marginBottom: "5px" }}>Lieu de la mission *</label>
          <input 
            type="text" 
            name="lieu" 
            value={formData.lieu} 
            onChange={handleChange}
            style={{ width: "100%", padding: "8px" }}
            placeholder="Ex: Lyon, Paris 15ème..."
            required
          />
        </div>

        <div style={{ display: "flex", gap: "20px" }}>
          {/* PRIX */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Prix proposé (€) *</label>
            <input 
              type="number" 
              name="prix" 
              value={formData.prix || ''} 
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
              required
            />
          </div>
          
          {/* DATE */}
          <div style={{ flex: 1 }}>
            <label style={{ display: "block", marginBottom: "5px" }}>Date souhaitée *</label>
            <input 
              type="date" 
              name="date" 
              value={formData.date || ''} 
              onChange={handleChange}
              style={{ width: "100%", padding: "8px" }}
              required
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