const { Pool } = require('pg');
const fs = require('node:fs');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

(async () => {
  try {
    await pool.connect();
    console.log('Connecté à PostgreSQL avec succès (Annonce Service)');
  } catch (err) {
    console.error('Erreur de connexion à PostgreSQL', err);
    process.exit(1);
  }
})();

export function buildAnnonce(data) {
  return {
    titre: data.titre ?? "",
    description: data.description ?? "",
    prix: typeof data.prix === "number" ? data.prix : null,
    date: data.date ?? null,
    createdAt: new Date().toISOString()
  };
}


/**
 * Get annonces with optional global search
 * @param {string} searchTerm - Optional search term for city, title, description, and user skills
 * @returns {Promise<Array>} Array of annonces
 */
async function getAnnonces(searchTerm = null) {
  try {
    let query = `
      SELECT 
        a.id,
        a.titre,
        a.description,
        a.lieu,
        a.prix,
        a.photo,
        a.date_publication,
        a.is_valide,
        a.id_user,
        u.name AS author_name,
        u.email AS author_email,
        u.profileData AS author_profile,
        u.ville AS author_ville
      FROM annonces a
      JOIN users u ON a.id_user = u.id_user
      WHERE a.is_valide = true
    `;

    const params = [];

    // Global search in ALL fields: city, title, description, and skills
    if (searchTerm && searchTerm.trim().length > 0) {
      query += ` AND (
        LOWER(a.titre) LIKE LOWER($1) 
        OR LOWER(a.description) LIKE LOWER($1)
        OR LOWER(a.lieu) LIKE LOWER($1)
        OR LOWER(u.ville) LIKE LOWER($1)
        OR LOWER(u.profileData) LIKE LOWER($1)
      )`;
      params.push(`%${searchTerm.trim()}%`);
    }

    query += ` ORDER BY a.date_publication DESC`;

    const result = await pool.query(query, params);
    return result.rows;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error fetching annonces: ' + err + '\n');
    throw err;
  }
}

/**
 * Get a single annonce by ID
 * @param {number} id - Annonce ID
 * @returns {Promise<Object|null>} Annonce object or null
 */
async function getAnnonceById(id) {
  try {
    const result = await pool.query(
      `SELECT 
        a.id,
        a.titre,
        a.description,
        a.lieu,
        a.prix,
        a.photo,
        a.date_publication,
        a.is_valide,
        a.id_user,
        u.name AS author_name,
        u.email AS author_email,
        u.profileData AS author_profile,
        u.ville AS author_ville
      FROM annonces a
      JOIN users u ON a.id_user = u.id_user
      WHERE a.id = $1`,
      [id]
    );
    return result.rows[0] || null;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error fetching annonce by ID: ' + err + '\n');
    throw err;
  }
}

/**
 * Update an annonce
 * @param {number} id - Annonce ID
 * @param {number} id_user - User ID (for verification)
 * @param {Object} annonceData - Updated annonce data
 * @returns {Promise<Object|null>} Updated annonce or null
 */
async function updateAnnonce(id, id_user, annonceData) {
  try {
    const { titre, description, lieu, prix, photo } = annonceData;
    const result = await pool.query(
      `UPDATE annonces 
       SET titre = $1, description = $2, lieu = $3, prix = $4, photo = $5
       WHERE id = $6 AND id_user = $7
       RETURNING *`,
      [titre, description, lieu, prix, photo, id, id_user]
    );
    return result.rows[0] || null;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error updating annonce: ' + err + '\n');
    throw err;
  }
}

/**
 * Delete an annonce
 * @param {number} id - Annonce ID
 * @param {number} id_user - User ID (for verification)
 * @returns {Promise<Object|null>} Deleted annonce or null
 */
async function deleteAnnonce(id, id_user) {
  try {
    const result = await pool.query(
      `DELETE FROM annonces 
       WHERE id = $1 AND id_user = $2
       RETURNING *`,
      [id, id_user]
    );
    return result.rows[0] || null;
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error deleting annonce: ' + err + '\n');
    throw err;
  }
}

module.exports = { 
  getAnnonces, 
  getAnnonceById,
  updateAnnonce, 
  deleteAnnonce
};