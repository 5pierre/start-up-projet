const express = require('express');
const multer = require('multer');
const router = express.Router();

// Stockage en mémoire au lieu d'un dossier
const upload = multer({ storage: multer.memoryStorage() });

const { 
  getAllAnnonces, 
  getSingleAnnonce,
  updateExistingAnnonce,
  deleteExistingAnnonce,
  generateAnnonceFromAudio 
} = require('../core/annonce.services');

router.post("/from-audio", upload.single("audio"), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }

    // Passe le buffer directement au lieu du chemin fichier
    const annonce = await generateAnnonceFromAudio(req.file.buffer, req.file.mimetype);
    res.json(annonce);

  } catch (err) {
    console.error("Error generating annonce:", err);
    res.status(500).json({ error: "Annonce generation failed", details: err.message });
  }
});

router.get('/annonces', getAllAnnonces);           
router.get('/annonces/:id', getSingleAnnonce);     
router.put('/annonces/:id', updateExistingAnnonce);    
router.delete('/annonces/:id', deleteExistingAnnonce); 

module.exports = router;