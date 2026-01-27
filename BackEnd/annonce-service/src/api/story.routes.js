const express = require('express');
import multer from "multer";
import fs from "fs";
import { processAnnonceFromAudio } from "../core/annonce.services.js";

const router = express.Router();
const { getAllStories, createNewStory } = require('../core/annonce.services');
const upload = multer({ dest: "uploads/" });


router.get('/stories', getAllStories);
router.post('/stories', createNewStory);

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


module.exports = router;
