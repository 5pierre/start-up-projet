import React, { useState, useRef } from 'react';
import { generateAnnonceFromAudio } from '../services/annonceService';
import './AudioAssistant.css';

export default function AudioAssistant({ onAnnonceGenerated }) {
  const [isRecording, setIsRecording] = useState(false);
  const [isProcessing, setIsProcessing] = useState(false);
  const mediaRecorderRef = useRef(null);
  const audioChunksRef = useRef([]);
  const isUploadingRef = useRef(false);

  const startRecording = async () => {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      let options = {};
      if (MediaRecorder.isTypeSupported('audio/webm')) {
        options = { mimeType: 'audio/webm' };
      } else if (MediaRecorder.isTypeSupported('audio/mp4')) {
        options = { mimeType: 'audio/mp4' };
      }

      mediaRecorderRef.current = new MediaRecorder(stream, options);
      audioChunksRef.current = [];
      isUploadingRef.current = false;

      mediaRecorderRef.current.ondataavailable = (e) => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
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

        const blob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach((t) => t.stop());
        await handleAudioUpload(blob);

      };

      mediaRecorderRef.current.start(1000);
      setIsRecording(true);
    } catch (err) {
      console.error('Accès micro:', err);
      alert("Impossible d'accéder au microphone. Vérifiez les permissions.");
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current?.state === 'recording') {
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
    <div className="audio-assistant card">
      <h3 className="audio-assistant-title">Assistant vocal IA</h3>
      <p className="audio-assistant-desc">
        Décrivez votre tâche à l’oral (ex. : « Je cherche quelqu’un pour tondre ma pelouse à Lyon ce week-end pour 20 euros »). L’IA remplira le formulaire.
      </p>
      {isProcessing ? (
        <div className="audio-assistant-status">
          <span className="audio-assistant-spinner" />
          Analyse en cours…
        </div>
      ) : (
        <button
          type="button"
          className={`audio-assistant-btn ${isRecording ? 'audio-assistant-btn-stop' : ''}`}
          onClick={isRecording ? stopRecording : startRecording}
          disabled={isProcessing}
        >
          {isRecording ? "⏹ Arrêter l'enregistrement" : "🎤 Démarrer l'enregistrement"}
        </button>
      )}
    </div>
  );
}
