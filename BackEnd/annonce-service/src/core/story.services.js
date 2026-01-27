import fs from "fs";
import OpenAI from "openai";
import { buildAnnonce } from "../data/annonce.js";

const { getStories, createStory } = require('../data/story');
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

// GET ALL STORIES
async function getAllStories(req, res) {
  try {
    const stories = await getStories();
    
    if (!stories || stories.length === 0) {
      return res.status(200).json({ message: "No stories found", stories: [] });
    }
    res.status(200).json({ stories });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Stories fetched successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching stories: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching stories" });
  }
}

// CREATE STORY
async function createNewStory(req, res) {
  const token = req.cookies.token;
  if (!token) return res.status(403).send("Access denied");
  const { content } = req.body;
  const decodedToken = verifyToken(token);
  try {
      if (!content || typeof content !== 'string' || content.trim().length === 0) {
        return res.status(400).json({ error: "Story content is required and must be a non-empty string" });
      }

      if (content.length > 5000) {
        return res.status(400).json({ error: "Story is too long (max 5000 characters)" });
      }

      if (content.length < 5) {
        return res.status(400).json({ error: "Story is too short (min 5 characters)" });
      }
      const id_user = decodedToken.id;
      const newStory = await createStory(id_user, content);

      res.status(201).json({
        message: "Story created successfully",
        story: newStory
      });
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Story created successfully\n");

  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error creating story: " + err + "\n");
    res.status(500).json({ error: "Internal error while creating story" });
  }
}

module.exports = { getAllStories, createNewStory };