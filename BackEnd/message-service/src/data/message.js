const { Pool } = require('pg');
const fs = require('node:fs');

const pool = new Pool({
  connectionString: process.env.DB_URL
});

(async () => {
  try {
    await pool.connect();
    console.log('Connecté à PostgreSQL avec succès');
  } catch (err) {
    console.error('Erreur de connexion à PostgreSQL', err);
    process.exit(1);
  }
})();

async function getMessages(user1, user2) {
  try {
    const result = await pool.query(
    `SELECT m.id, m.contenu AS content, m.created_at, m.id_user_1, m.id_user_2, u.name AS sender_name
      FROM messages m
      JOIN users u ON m.id_user_1 = u.id_user
     WHERE 
      (m.id_user_1 = $1 AND m.id_user_2 = $2)
     OR
      (m.id_user_1 = $2 AND m.id_user_2 = $1)
     ORDER BY m.created_at ASC
    `, [user1, user2]);
  return result.rows;
} catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error fetching messages: ' + err + '\n');
    throw err;
  }
}

async function createMessage(id_user_1, id_user_2, content) {
  try {
    const result = await pool.query(
      `INSERT INTO messages(id_user_1, id_user_2, contenu, created_at) 
       VALUES($1, $2, $3, NOW()) 
       RETURNING id, id_user_1, id_user_2, contenu, created_at`,
      [id_user_1, id_user_2, content]
    );
    return result.rows[0];
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + ' Error inserting message: ' + err + '\n');
    throw err;
  }
}

module.exports = { getMessages, createMessage };