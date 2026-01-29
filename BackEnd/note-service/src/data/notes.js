const { Pool } = require('pg');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

pool
  .connect()
  .then(() => console.log('Note-service: connecté à PostgreSQL'))
  .catch((err) => console.error('Note-service: erreur connexion PostgreSQL', err));

async function createNote({ ratedUserId, authorUserId, stars, comment }) {
  const result = await pool.query(
    `
    INSERT INTO notes (stars, comment, rated_user_id, author_user_id)
    VALUES ($1, $2, $3, $4)
    ON CONFLICT (rated_user_id, author_user_id) 
    DO UPDATE SET 
      stars = EXCLUDED.stars, 
      comment = EXCLUDED.comment,
      created_at = CURRENT_TIMESTAMP
    RETURNING id, stars, comment, rated_user_id, author_user_id, created_at
    `,
    [stars, comment ?? null, ratedUserId, authorUserId]
  );
  return result.rows[0];
}

async function getRatingSummary(ratedUserId) {
  const result = await pool.query(
    `
    SELECT
      COALESCE(AVG(stars), 0)::float AS average,
      COUNT(*)::int AS count
    FROM notes
    WHERE rated_user_id = $1
    `,
    [ratedUserId]
  );
  return result.rows[0];
}

async function getCommentsForUser(ratedUserId) {
  const result = await pool.query(
    `
    SELECT
      n.id,
      n.stars,
      n.comment,
      n.created_at,
      n.author_user_id,
      u.name AS author_name
    FROM notes n
    JOIN users u ON u.id_user = n.author_user_id
    WHERE n.rated_user_id = $1
    ORDER BY n.created_at DESC
    `,
    [ratedUserId]
  );
  return result.rows;
}

async function getNoteByAuthorAndRated(authorId, ratedId) {
  const result = await pool.query(
    `
    SELECT stars, comment
    FROM notes
    WHERE author_user_id = $1 AND rated_user_id = $2
    `,
    [authorId, ratedId]
  );
  return result.rows[0];
}

module.exports = {
  createNote,
  getRatingSummary,
  getCommentsForUser,
  getNoteByAuthorAndRated
};

