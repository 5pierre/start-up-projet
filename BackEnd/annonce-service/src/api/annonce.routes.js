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
  generateAnnonceFromAudio ,
  createAnnonce,
  validateAnnonce
} = require('../core/annonce.services');

router.post("/from-audio", upload.single("audio"), async (req, res) => {
  console.log('🎤 Route appelée !'); // 👈 AJOUTE ICI
  console.log('📦 Body:', req.body);
  console.log('📁 Files:', req.files);
  try {
    if (!req.file) {
      return res.status(400).json({ error: "No audio file uploaded" });
    }
    const annonce = await generateAnnonceFromAudio(req.file.buffer, req.file.mimetype);
    res.json(annonce);

  } catch (err) {
    console.error("Error generating annonce:", err);
    res.status(500).json({ error: "Annonce generation failed", details: err.message });
  }
});

//CRUD operations
router.post('/annonces', createAnnonce);
router.get('/annonces', getAllAnnonces);           
router.get('/annonces/:id', getSingleAnnonce);     
router.post('/annonces/:id/validate', validateAnnonce);
router.put('/annonces/:id', updateExistingAnnonce);    
router.delete('/annonces/:id', deleteExistingAnnonce); 

module.exports = router;