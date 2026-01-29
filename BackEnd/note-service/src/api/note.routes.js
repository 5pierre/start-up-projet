const express = require('express');
const jwt = require('jsonwebtoken');

const { createNote, getRatingSummary, getCommentsForUser, getNoteByAuthorAndRated } = require('../data/notes');

const router = express.Router();
const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
  if (!token) throw new Error('Access denied');
  return jwt.verify(token, Key);
};

// POST /api/note/ratings
// body: { ratedUserId, stars, comment? }
router.post('/ratings', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).send('Access denied');

  try {
    const decoded = verifyToken(token);
    const authorUserId = decoded.id;

    const ratedUserId = Number.parseInt(req.body.ratedUserId, 10);
    const stars = Number.parseInt(req.body.stars, 10);
    const comment = typeof req.body.comment === 'string' ? req.body.comment.trim() : '';

    if (!Number.isInteger(ratedUserId) || ratedUserId <= 0) {
      return res.status(400).json({ error: 'ratedUserId invalide' });
    }
    if (!Number.isInteger(stars) || stars < 1 || stars > 5) {
      return res.status(400).json({ error: 'stars doit être entre 1 et 5' });
    }
    if (ratedUserId === authorUserId) {
      return res.status(400).json({ error: "Impossible de se noter soi-même" });
    }
    if (comment.length > 1000) {
      return res.status(400).json({ error: 'commentaire trop long (max 1000 caractères)' });
    }

    const saved = await createNote({
      ratedUserId,
      authorUserId,
      stars,
      comment: comment.length ? comment : null
    });

    return res.status(201).json({ message: 'Note enregistrée', note: saved });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
});

// GET /api/note/users/:id/summary
router.get('/users/:id/summary', async (req, res) => {
  try {
    const ratedUserId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(ratedUserId) || ratedUserId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const summary = await getRatingSummary(ratedUserId);
    return res.status(200).json(summary);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
});

// GET /api/note/users/:id/comments
router.get('/users/:id/comments', async (req, res) => {
  try {
    const ratedUserId = Number.parseInt(req.params.id, 10);
    if (!Number.isInteger(ratedUserId) || ratedUserId <= 0) {
      return res.status(400).json({ error: 'ID invalide' });
    }
    const comments = await getCommentsForUser(ratedUserId);
    return res.status(200).json({ comments });
  } catch (err) {
    return res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
});

router.get('/ratings/me/:ratedUserId', async (req, res) => {
  const token = req.cookies.token;
  if (!token) return res.status(403).send('Access denied');

  try {
    const decoded = verifyToken(token);
    const authorUserId = decoded.id;
    const ratedUserId = Number.parseInt(req.params.ratedUserId, 10);

    if (!Number.isInteger(ratedUserId)) {
      return res.status(400).json({ error: 'ID invalide' });
    }

    const note = await getNoteByAuthorAndRated(authorUserId, ratedUserId);
    // Renvoie la note si elle existe, sinon null (ce n'est pas une erreur)
    return res.status(200).json(note || null);
  } catch (err) {
    return res.status(500).json({ error: 'Erreur interne', details: err.message });
  }
});

module.exports = router;

