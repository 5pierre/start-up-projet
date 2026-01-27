const fs = require('fs');
const OpenAI = require("openai");
const jwt = require('jsonwebtoken');
const { 
  getAnnonces, 
  getAnnonceById,
  updateAnnonce, 
  deleteAnnonce,
  buildAnnonce 
} = require('../data/annonce');

const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, Key);
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


async function generateAnnonceFromAudio(audioPath) {

  const transcription = await openai.audio.transcriptions.create({
    file: fs.createReadStream(audioPath),
    model: "whisper-1",
    language: "fr"
  });

  const speechText = transcription.text;
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" }, 
    messages: [
      {
        role: "system",
        content: `
Tu es un assistant expert en immobilier. Tu transformes un texte parlé en une annonce structurée JSON.

Retourne UNIQUEMENT un JSON respectant cette structure exacte :
{
  "titre": string,
  "description": string,
  "prix": number | null,
  "date": string | null
}

Règles :
- Le champ "titre" doit être accrocheur (ex: "Charmant T2 centre-ville").
- Reformule la "description" pour qu'elle soit professionnelle.
- Si le prix est mentionné, convertis-le en nombre. Sinon null.
- Si une date de disponibilité est mentionnée, format YYYY-MM-DD. Sinon null.
`
      },
      {
        role: "user",
        content: `Voici la transcription audio : "${speechText}"`
      }
    ]
  });

  // Parsing sécurisé grâce au response_format
  const parsed = JSON.parse(completion.choices[0].message.content);

  return buildAnnonce(parsed);
}


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

    try {
        fs.appendFileSync('../../Log.txt', new Date().toISOString() + 
        ` Annonces fetched successfully (search: ${search || 'none'})\n`);
    } catch (e) { console.error("Log error:", e.message); }

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error while fetching annonces" });
  }
}


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

  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error while fetching annonce" });
  }
}


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

    const id_user = decodedToken.id;
    const updatedAnnonce = await updateAnnonce(id, id_user, {
      titre, description, lieu, prix, photo
    });

    if (!updatedAnnonce) {
      return res.status(404).json({ error: "Annonce not found or permission denied" });
    }

    res.status(200).json({
      message: "Annonce updated successfully",
      annonce: updatedAnnonce
    });

  } catch (err) {
    console.error(err);
    if (err.name === 'JsonWebTokenError' || err.name === 'TokenExpiredError') {
      return res.status(401).json({ error: "Invalid or expired token" });
    }
    res.status(500).json({ error: "Internal error while updating annonce" });
  }
}

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
      return res.status(404).json({ error: "Annonce not found or permission denied" });
    }

    res.status(200).json({
      message: "Annonce deleted successfully",
      annonce: deletedAnnonce
    });

  } catch (err) {
    console.error(err);
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
  deleteExistingAnnonce,
  generateAnnonceFromAudio
};