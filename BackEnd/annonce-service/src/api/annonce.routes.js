const express = require('express');
import multer from "multer";
import fs from "fs";
import { processAnnonceFromAudio } from "../core/annonce.services.js";
const router = express.Router();
const upload = multer({ dest: "uploads/" });
const { 
  getAllAnnonces, 
  getSingleAnnonce,
  updateExistingAnnonce,
  deleteExistingAnnonce
} = require('../core/annonce.services');


router.post(
  "/from-audio",
  upload.single("audio"),
  async (req, res) => {
    try {
      const annonce = await generateAnnonceFromAudio(req.file.path);
      fs.unlinkSync(req.file.path);
      res.json(annonce);
    } catch (err) {
      console.error(err);
      res.status(500).json({ error: "Annonce generation failed" });
    }
  }
);


// Public routes
router.get('/annonces', getAllAnnonces);           // GET all annonces with optional global search: ?search=Paris
router.get('/annonces/:id', getSingleAnnonce);     // GET single annonce by ID

// Protected routes (require authentication)
router.put('/annonces/:id', updateExistingAnnonce);    // UPDATE annonce
router.delete('/annonces/:id', deleteExistingAnnonce); // DELETE annonce


module.exports = router;