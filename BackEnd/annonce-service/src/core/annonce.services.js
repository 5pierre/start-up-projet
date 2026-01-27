import fs from "fs";
import OpenAI from "openai";
import { buildAnnonce } from "../data/annonce.js";
const { 
  getAnnonces, 
  getAnnonceById,
  updateAnnonce, 
  deleteAnnonce
} = require('../data/annonce');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, Key);
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


export async function generateAnnonceFromAudio(audioPath) {
  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    language: "fr"
  });

  const speechText = transcription.text;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    messages: [
      {
        role: "system",
        content: `
Tu transformes un texte parlé en annonce claire et professionnelle.

Retourne UNIQUEMENT un JSON strict :
{
  "titre": string,
  "description": string,
  "prix": number | null,
  "date": string | null
}

Règles :
- Reformule proprement et clairement
- Sois concis
- Utilise un langage professionnel
- Si une information est absente, mets null
- Prix en nombre
- Date au format ISO YYYY-MM-DD si présente
`
      },
      {
        role: "user",
        content: speechText
      }
    ]
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  return buildAnnonce(parsed);
}


/**
 * GET ALL ANNONCES with optional global search
 * Query params: search (global search term)
 */
async function getAllAnnonces(req, res) {
  try {
    const { search } = req.query;

    const annonces = await getAnnonces(search);
    
    if (!annonces || annonces.length === 0) {
      return res.status(200).json({ 
        message: "No annonces found", 
        annonces: [],
        search: search || null
      });
    }

    res.status(200).json({ 
      annonces,
      count: annonces.length,
      search: search || null
    });

    fs.appendFileSync('../../Log.txt', new Date().toISOString() + 
      ` Annonces fetched successfully (search: ${search || 'none'})\n`);

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching annonces: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching annonces" });
  }
}

/**
 * GET SINGLE ANNONCE by ID
 */
async function getSingleAnnonce(req, res) {
  try {
    const id = Number.parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid annonce ID" });
    }

    const annonce = await getAnnonceById(id);

    if (!annonce) {
      return res.status(404).json({ error: "Annonce not found" });
    }

    res.status(200).json({ annonce });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ` Annonce ${id} fetched successfully\n`);

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching annonce: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching annonce" });
  }
}

/**
 * UPDATE ANNONCE (Protected user can only update their own annonces)
 */
async function updateExistingAnnonce(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ error: "Access denied" });

  try {
    const decodedToken = verifyToken(token);
    const id = Number.parseInt(req.params.id);
    const { titre, description, lieu, prix, photo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid annonce ID" });
    }

    // Validation
    if (titre && (titre.length < 3 || titre.length > 255)) {
      return res.status(400).json({ error: "Title must be between 3 and 255 characters" });
    }

    if (description && description.length > 5000) {
      return res.status(400).json({ error: "Description is too long (max 5000 characters)" });
    }

    const id_user = decodedToken.id;
    const updatedAnnonce = await updateAnnonce(id, id_user, {
      titre,
      description,
      lieu,
      prix,
      photo
    });

    if (!updatedAnnonce) {
      return res.status(404).json({ error: "Annonce not found or you don't have permission to update it" });
    }

    res.status(200).json({
      message: "Annonce updated successfully",
      annonce: updatedAnnonce
    });

    fs.appendFileSync('../../Log.txt', new Date().toISOString() + 
      ` Annonce ${id} updated by user ${id_user}\n`);

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error updating annonce: " + err + "\n");
    
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    res.status(500).json({ error: "Internal error while updating annonce" });
  }
}

/**
 * DELETE ANNONCE (Protected user can only delete their own annonces)
 */
async function deleteExistingAnnonce(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(403).json({ error: "Access denied" });

  try {
    const decodedToken = verifyToken(token);
    const id = Number.parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid annonce ID" });
    }

    const id_user = decodedToken.id;
    const deletedAnnonce = await deleteAnnonce(id, id_user);

    if (!deletedAnnonce) {
      return res.status(404).json({ error: "Annonce not found or you don't have permission to delete it" });
    }

    res.status(200).json({
      message: "Annonce deleted successfully",
      annonce: deletedAnnonce
    });

    fs.appendFileSync('../../Log.txt', new Date().toISOString() + 
      ` Annonce ${id} deleted by user ${id_user}\n`);

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error deleting annonce: " + err + "\n");
    
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    
    res.status(500).json({ error: "Internal error while deleting annonce" });
  }
}


module.exports = { 
  getAllAnnonces, 
  getSingleAnnonce,
  updateExistingAnnonce,
  deleteExistingAnnonce
};