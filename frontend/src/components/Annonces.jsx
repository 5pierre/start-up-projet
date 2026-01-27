import React, { useState, useEffect, useRef } from 'react';

export default function TestAnnonce() {
  // États pour l'enregistrement
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState(null);
  const [audioUrl, setAudioUrl] = useState(null); // Pour réécouter ce qu'on vient de dire
  
  // États pour l'IA et les données
  const [generatedData, setGeneratedData] = useState(null);
  const [allAnnonces, setAllAnnonces] = useState([]);
  const [status, setStatus] = useState("");

  // Référence pour stocker l'objet MediaRecorder sans provoquer de re-render
  const mediaRecorderRef = useRef(null);
  const chunksRef = useRef([]);

  useEffect(() => {
    fetchAnnonces();
  }, []);

  const fetchAnnonces = async () => {
    try {
      // Vérifiez bien votre PORT (3002 direct ou via Gateway)
      const res = await fetch("http://localhost:3002/api/annonce/annonces");
      const data = await res.json();
      setAllAnnonces(data.annonces || []);
    } catch (e) {
      console.error("Erreur fetch:", e);
    }
  };

  // --- 1. LOGIQUE D'ENREGISTREMENT MICROPHONE ---

  const startRecording = async () => {
    try {
      // Demander la permission du micro
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Créer le MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = []; // Réinitialiser les morceaux d'audio

      // Quand des données sont disponibles (pendant l'enregistrement)
      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      // Quand on arrête l'enregistrement
      mediaRecorder.onstop = () => {
        // Créer un "Blob" (fichier binaire) à partir des morceaux
        // Le type 'audio/webm' est standard sur Chrome/Firefox
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        
        // Créer une URL pour pouvoir réécouter l'audio dans le navigateur
        const url = URL.createObjectURL(blob);
        setAudioUrl(url);
        
        // Couper le micro (éteindre la lumière rouge du navigateur)
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
      setStatus("🔴 Enregistrement en cours... Parlez !");
      setAudioBlob(null); // Reset ancien enregistrement
      setGeneratedData(null); // Reset anciennes données IA

    } catch (err) {
      console.error("Erreur micro:", err);
      alert("Impossible d'accéder au micro. Vérifiez vos permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
      setStatus("✅ Enregistrement terminé. Cliquez sur 'Envoyer à l'IA'.");
    }
  };

  // --- 2. ENVOI À L'IA ---

  const handleSendAudioToIA = async () => {
    if (!audioBlob) return alert("Aucun audio enregistré !");
    
    setStatus("⏳ Envoi et analyse par l'IA (Whisper + GPT)...");

    const formData = new FormData();
    // IMPORTANT : On donne un nom de fichier avec extension (.webm) 
    // pour que le backend et OpenAI comprennent le format.
    formData.append("audio", audioBlob, "recording.webm");

    try {
      const res = await fetch("http://localhost:3002/api/annonce/from-audio", {
        method: "POST",
        body: formData,
      });

      if (!res.ok) throw new Error("Erreur serveur");

      const data = await res.json();
      setGeneratedData(data);
      setStatus("✨ Analyse terminée ! Vérifiez les données ci-dessous.");
    } catch (e) {
      console.error(e);
      setStatus("❌ Erreur: " + e.message);
    }
  };

  // --- 3. SAUVEGARDE FINALE (Simulation) ---
  const handleSaveAnnonce = async () => {
    alert("Ici, vous appellerez la route POST /annonces pour sauvegarder définitivement.");
    console.log("Données finales :", generatedData);
  };

  return (
    <div style={{ padding: "20px", fontFamily: "Arial, sans-serif" }}>
      <h1>🎤 Créer une annonce par la voix</h1>
      
      {/* ZONE MICROPHONE */}
      <div style={{ 
        border: "2px solid #333", 
        padding: "20px", 
        borderRadius: "10px", 
        marginBottom: "20px",
        textAlign: "center",
        backgroundColor: isRecording ? "#ffecec" : "#fff"
      }}>
        <h3>1. Décrivez votre bien</h3>
        <p><i>"Je vends une guitare électrique Fender, très bon état, 500 euros..."</i></p>
        
        {!isRecording ? (
          <button 
            onClick={startRecording}
            style={{ 
              backgroundColor: "#d32f2f", color: "white", padding: "10px 20px", 
              fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" 
            }}
          >
            🔴 Commencer l'enregistrement
          </button>
        ) : (
          <button 
            onClick={stopRecording}
            style={{ 
              backgroundColor: "#333", color: "white", padding: "10px 20px", 
              fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" 
            }}
          >
            ⬛ Arrêter
          </button>
        )}

        <br /><br />
        
        {/* LECTEUR AUDIO POUR VÉRIFIER */}
        {audioUrl && (
          <div>
            <audio src={audioUrl} controls />
            <br /><br />
            <button 
              onClick={handleSendAudioToIA}
              style={{ 
                backgroundColor: "#1976d2", color: "white", padding: "10px 20px", 
                fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" 
              }}
            >
              🚀 Envoyer à l'IA
            </button>
          </div>
        )}
        
        <p style={{ marginTop: "10px", fontWeight: "bold" }}>{status}</p>
      </div>

      {/* FORMULAIRE PRÉ-REMPLI PAR L'IA */}
      {generatedData && (
        <div style={{ 
          border: "1px solid #ccc", padding: "20px", marginBottom: "20px", 
          background: "#f9f9f9", borderRadius: "8px" 
        }}>
          <h3>2. Vérification (Résultat IA)</h3>
          
          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Titre suggéré :</label>
            <input 
              type="text" 
              value={generatedData.titre || ""} 
              onChange={(e) => setGeneratedData({...generatedData, titre: e.target.value})}
              style={{ width: "100%", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Description :</label>
            <textarea 
              value={generatedData.description || ""} 
              onChange={(e) => setGeneratedData({...generatedData, description: e.target.value})}
              style={{ width: "100%", height: "100px", padding: "8px" }}
            />
          </div>

          <div style={{ marginBottom: "10px" }}>
            <label style={{ display: "block", fontWeight: "bold" }}>Prix (€) :</label>
            <input 
              type="number" 
              value={generatedData.prix || ""} 
              onChange={(e) => setGeneratedData({...generatedData, prix: Number(e.target.value)})}
              style={{ padding: "8px" }}
            />
          </div>

          <button 
            onClick={handleSaveAnnonce}
            style={{ 
              backgroundColor: "#2e7d32", color: "white", padding: "10px 20px", 
              fontSize: "16px", border: "none", borderRadius: "5px", cursor: "pointer" 
            }}
          >
            💾 Valider et Publier l'annonce
          </button>
        </div>
      )}

      {/* LISTE */}
      <div style={{ borderTop: "1px solid #ccc", paddingTop: "20px" }}>
        <h3>Annonces existantes</h3>
        <ul>
          {allAnnonces.map((a, index) => (
            <li key={index}>
              <strong>{a.titre}</strong> - {a.prix ? a.prix + "€" : "Prix non défini"}
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}