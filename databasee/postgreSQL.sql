CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    profileData VARCHAR(400) NOT NULL,
    password VARCHAR(500) NOT NULL,  
    name VARCHAR(30) NOT NULL,
    ville VARCHAR(100),
    photo TEXT 
                 
);

-- Notes / avis: un user (author) note un autre user (rated)
-- NOTE: on drop/recreate pour avoir un schéma propre.
DROP TABLE IF EXISTS notes;

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    stars INT NOT NULL CHECK (stars >= 1 AND stars <= 5),
    comment TEXT,
    rated_user_id INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    author_user_id INT NOT NULL REFERENCES users(id_user) ON DELETE CASCADE,
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT unique_rating UNIQUE (rated_user_id, author_user_id)
);

CREATE TABLE IF NOT EXISTS annonces (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    date DATE,
    lieu VARCHAR(255),
    prix DECIMAL(10, 2),
    photo TEXT,
    is_valide BOOLEAN DEFAULT FALSE 
);

CREATE TABLE IF NOT EXISTS messages (
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    id_user_1 INT REFERENCES users(id_user), 
    id_user_2 INT REFERENCES users(id_user), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP

    --  CONSTRAINT fk_user
    --     FOREIGN KEY (id_user)
    --     REFERENCES users (id_user) 
    --     ON DELETE CASCADE 
);

-- Lier une discussion à une annonce (pour afficher "Valider l'annonce" dans le chat)
ALTER TABLE IF EXISTS messages
  ADD COLUMN IF NOT EXISTS annonce_id INT REFERENCES annonces(id) ON DELETE SET NULL;

-- ------------------------------------------------
-- DONNÉES PAR DÉFAUT POUR LES TESTS D'ANNONCES
-- ------------------------------------------------

-- Utilisateur de test (auteur des annonces)
INSERT INTO users (email, role, profileData, password, name, ville, photo)
VALUES (
  'annonce.tester@example.com',
  'user',
  'Profil test pour les annonces',
  'hashed-password-placeholder',
  'AnnonceTester',
  'Paris',
  NULL
)
ON CONFLICT (email) DO NOTHING;



-- =========================
-- Données de test (seed)
-- =========================
-- Password en clair (pour vous): TestUserPass!123
-- Hash bcrypt correspondant:
-- $2b$10$V4QzzKzZUBj1CnfdxmUK3u9IGLsMp5wTrWfiJsOjhB79/OuTQmm9W

INSERT INTO users (email, role, profileData, password, name, ville, photo)
VALUES
    ('notee@example.com', 'user', 'Profil user noté', '$2b$10$V4QzzKzZUBj1CnfdxmUK3u9IGLsMp5wTrWfiJsOjhB79/OuTQmm9W', 'User Notee', 'Paris', NULL),
    ('auteur@example.com', 'user', 'Profil auteur',    '$2b$10$V4QzzKzZUBj1CnfdxmUK3u9IGLsMp5wTrWfiJsOjhB79/OuTQmm9W', 'User Auteur', 'Lyon', NULL);

-- 1 avis de test: auteur -> noté
INSERT INTO notes (stars, comment, rated_user_id, author_user_id)
SELECT
    5,
    'Super prestation, très pro !',
    u_rated.id_user,
    u_author.id_user
FROM users u_rated
JOIN users u_author ON u_author.email = 'auteur@example.com'
WHERE u_rated.email = 'notee@example.com';

-- Annonces pour l'utilisateur auteur@example.com
WITH user_auteur AS (
  SELECT id_user FROM users WHERE email = 'auteur@example.com' LIMIT 1
)
INSERT INTO annonces (titre, description, id_user, lieu, prix, date, photo, is_valide)
SELECT
  'Réparation de vélo',
  'Je répare tous types de vélos : réglage des freins, changement de pneus, entretien général. Service rapide et professionnel.',
  id_user,
  'Lyon',
  25.00,
  CURRENT_DATE + INTERVAL '7 days',
  NULL,
  FALSE
FROM user_auteur
UNION ALL
SELECT
  'Cours de jardinage',
  'Apprenez les bases du jardinage : plantation, arrosage, taille. Cours adaptés aux débutants. Matériel fourni.',
  id_user,
  'Lyon',
  40.00,
  CURRENT_DATE + INTERVAL '14 days',
  NULL,
  FALSE
FROM user_auteur
UNION ALL
SELECT
  'Aide aux courses pour personnes âgées',
  'Service d''aide aux courses pour personnes à mobilité réduite. Respectueux et ponctuel. Disponible en semaine.',
  id_user,
  'Lyon',
  15.00,
  CURRENT_DATE + INTERVAL '3 days',
  NULL,
  FALSE
FROM user_auteur
UNION ALL
SELECT
  'Peinture de mur intérieur',
  'Peinture professionnelle de vos murs intérieurs. Préparation du support incluse. Devis gratuit.',
  id_user,
  'Lyon',
  200.00,
  CURRENT_DATE + INTERVAL '10 days',
  NULL,
  FALSE
FROM user_auteur
UNION ALL
SELECT
  'Garde d''animaux',
  'Garde de chiens et chats à domicile. Promenades, repas, jeux. Expérience de 5 ans.',
  id_user,
  'Lyon',
  30.00,
  CURRENT_DATE + INTERVAL '5 days',
  NULL,
  FALSE
FROM user_auteur;



