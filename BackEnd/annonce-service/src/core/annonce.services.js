const fs = require('fs');
const OpenAI = require("openai");
const jwt = require('jsonwebtoken');


const { 
  getAllAnnonces: getAllAnnoncesData,
  getSingleAnnonce: getSingleAnnonceData,
  updateExistingAnnonce: updateExistingAnnonceData,
  deleteExistingAnnonce: deleteExistingAnnonceData,
  buildAnnonce,
  createAnnonceData 
} = require('../data/annonce');

const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
  if (!token) throw new Error("No token provided");
  return jwt.verify(token, Key);
};

const openai = new OpenAI({
  apiKey: process.env.OPENAI_API_KEY
});


const FormData = require('form-data');


async function generateAnnonceFromAudio(audioBuffer, mimeType) {
  
  // Créer un FormData avec le buffer
  const form = new FormData();
  form.append('file', audioBuffer, {
    filename: 'audio.webm',
    contentType: mimeType || 'audio/webm'
  });
  form.append('model', 'whisper-1');
  form.append('language', 'fr');

  // Faire l'appel directement avec axios
  const axios = require('axios');
  const transcriptionResponse = await axios.post(
    'https://api.openai.com/v1/audio/transcriptions',
    form,
    {
      headers: {
        ...form.getHeaders(),
        'Authorization': `Bearer ${process.env.OPENAI_API_KEY}`
      }
    }
  );

  const speechText = transcriptionResponse.data.text;
  
  const completion = await openai.chat.completions.create({
    model: "gpt-4o-mini",
    temperature: 0.2,
    response_format: { type: "json_object" }, 
    messages: [
      {
        role: "system",
        content: `
Tu es un assistant expert en aide a domicile et services entre particuliers. Tu transformes un texte parlé décrivant un vieux demandant une tâche à réaliser en une annonce structurée JSON.

Retourne UNIQUEMENT un JSON respectant cette structure exacte :
{
  "titre": string,
  "description": string,
  "prix": number | null,
  "date": string | null,
  "lieu": string | null
}

Règles :
- Le champ "titre" doit être clair et concret (ex: "Changement d'ampoules au plafond", "Aide pour petits travaux de jardinage", "Réparation de robinet qui fuit").
- Reformule la "description" de manière professionnelle et bienveillante en détaillant la tâche à réaliser. Sois précis sur ce qui est attendu.
- Si un budget ou prix est mentionné, convertis-le en nombre (ex: "20 euros" → 20). Sinon estime a peu pres le prix de la tâche.
- Si une date ou période de disponibilité est mentionnée, format YYYY-MM-DD. Pour "la semaine prochaine", "dans 3 jours", calcule la date approximative. Sinon null.
- Le champ "lieu" doit être la ville où la tâche doit être réalisée.
- Garde un ton respectueux et encourageant, adapté à des personnes âgées qui demandent de l'aide.

Exemples de tâches courantes :
- Bricolage (changer ampoule, accrocher tableau, monter meuble)
- Jardinage (tondre pelouse, tailler haies, désherber)
- Ménage (grand nettoyage, vitres, rangement)
- Informatique (aide ordinateur, smartphone)
- Courses et accompagnement
- Petites réparations
`
      },
      {
        role: "user",
        content: `Voici la transcription audio : "${speechText}"`
      }
    ]
  });

  const parsed = JSON.parse(completion.choices[0].message.content);

  return buildAnnonce(parsed);
}



async function getAllAnnonces(req, res) {
  try {
    const { search } = req.query;
    const annonces = await getAllAnnoncesData(search);
    
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

    const annonce = await getSingleAnnonceData(id);

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
    const isAdmin = decodedToken.role === 'admin';
    const id = Number.parseInt(req.params.id);
    const { titre, description, lieu, prix, photo } = req.body;

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid annonce ID" });
    }

    const id_user = isAdmin ? null : decodedToken.id;
    const updatedAnnonce = await updateExistingAnnonceData(id, id_user, {
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
    const isAdmin = decodedToken.role === 'admin';
    const id = Number.parseInt(req.params.id);

    if (!Number.isInteger(id) || id <= 0) {
      return res.status(400).json({ error: "Invalid annonce ID" });
    }

    const id_user = isAdmin ? null : decodedToken.id;
    const deletedAnnonce = await deleteExistingAnnonceData(id, id_user);

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

async function createAnnonce(req, res) {
  try {
    const { titre, description, prix, lieu, date, id_user } = req.body;
    const annonce = await createAnnonceData(titre, description, prix, lieu, date, id_user);
    res.status(201).json({ annonce });
  } catch (err) {
    console.error(err);
    res.status(500).json({ error: "Internal error while creating annonce" });
  }
}

module.exports = { 
  getAllAnnonces, 
  getSingleAnnonce,
  updateExistingAnnonce,
  deleteExistingAnnonce,
  generateAnnonceFromAudio,
  createAnnonce
};