import React, { useState, useRef } from 'react';
import { generateAnnonceFromAudio } from '../services/annonceService';

const AudioAssistant = ({ onAnnonceGenerated }) => {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isUploadingRef = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // On essaie d'utiliser un format standard supporté par le navigateur
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      isUploadingRef.current = false;

      mediaRecorderRef.current.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorderRef.current.onstop = async () => {
        // Création du blob final
        if (isUploadingRef.current) {
          console.log('⚠️ Upload déjà en cours, abandon de ce déclenchement');
          return;
        }
        
        isUploadingRef.current = true;
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' }); // Webm est souvent le défaut
        
        // Arrêt des pistes (micro)
        stream.getTracks().forEach(track => track.stop());

        await handleAudioUpload(audioBlob);
      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error("Erreur d'accès au micro:", err);
      alert("Impossible d'accéder au microphone. Vérifiez vos permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleAudioUpload = async (audioBlob) => {
    // ✅ Double protection au niveau de la fonction aussi
    if (isProcessing) {
      console.log('⚠️ Traitement déjà en cours, requête ignorée');
      return;
    }
    
    setIsProcessing(true);
    try {
      console.log('📤 Envoi de l\'audio à l\'API...');
      const data = await generateAnnonceFromAudio(audioBlob);
      console.log('✅ Réponse reçue:', data);
      
      if (onAnnonceGenerated) {
        onAnnonceGenerated(data);
      }
    } catch (error) {
      console.error('❌ Erreur:', error);
      alert("Une erreur est survenue lors de l'analyse audio.");
    } finally {
      setIsProcessing(false);
      isUploadingRef.current = false; // ✅ Libérer le flag
    }
  };

  return (
    <div style={{ 
      margin: "20px 0", 
      padding: "20px", 
      border: "2px dashed #007bff", 
      borderRadius: "10px", 
      backgroundColor: "#f0f8ff",
      textAlign: "center"
    }}>
      <h4 style={{ marginTop: 0 }}>🎙️ Assistant Vocal IA</h4>
      <p style={{ fontSize: "0.9em", color: "#555" }}>
        Décrivez votre tâche (ex: "Je cherche quelqu'un pour tondre ma pelouse à Lyon ce weekend pour 20 euros").
      </p>

      {isProcessing ? (
        <div style={{ color: "#007bff", fontWeight: "bold" }}>
          ⏳ Analyse en cours, veuillez patienter...
        </div>
      ) : (
        <button 
          type="button" // Important pour ne pas soumettre le formulaire parent
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
          style={{
            backgroundColor: isRecording ? "#dc3545" : "#007bff",
            color: "white",
            padding: "12px 24px",
            border: "none",
            borderRadius: "30px",
            cursor: "pointer",
            fontSize: "16px",
            fontWeight: "bold",
            boxShadow: "0 4px 6px rgba(0,0,0,0.1)"
          }}
        >
          {isRecording ? "⏹️ Arrêter l'enregistrement" : "🎤 Démarrer l'enregistrement"}
        </button>
      )}
    </div>
  );
};

export default AudioAssistant;