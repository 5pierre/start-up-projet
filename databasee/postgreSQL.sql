CREATE TABLE IF NOT EXISTS users (
    id_user SERIAL PRIMARY KEY,
    email VARCHAR(50) UNIQUE NOT NULL,
    role VARCHAR(30) NOT NULL,
    profileData VARCHAR(400) NOT NULL,
    password VARCHAR(500) NOT NULL,  
    name VARCHAR(30) NOT NULL,
    -- firstname VARCHAR(30) NOT NULL,        
    ville VARCHAR(100),
    photo TEXT 
                 
);

CREATE TABLE IF NOT EXISTS notes (
    id SERIAL PRIMARY KEY,
    note INT CHECK (note >= 0 AND note <= 5),
    commentaire TEXT,
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE
);

CREATE TABLE IF NOT EXISTS annonces (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    id_user INT REFERENCES users(id_user) ON DELETE CASCADE,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
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

-- Récupère l'id_user de l'utilisateur de test
WITH user_cte AS (
  SELECT id_user FROM users WHERE email = 'annonce.tester@example.com' LIMIT 1
)
INSERT INTO annonces (titre, description, id_user, lieu, prix, photo, is_valide)
SELECT
  'Guitare électrique Fender Stratocaster',
  'Guitare en très bon état, idéale pour rock et blues. Vendue avec housse.',
  id_user,
  'Lyon',
  500.00,
  NULL,
  TRUE
FROM user_cte
UNION ALL
SELECT
  'Appartement T2 centre-ville',
  'Bel appartement T2 de 45m², proche transports et commerces.',
  id_user,
  'Paris',
  950.00,
  NULL,
  TRUE
FROM user_cte
UNION ALL
SELECT
  'PC portable développeur',
  'Laptop i7, 16Go RAM, SSD 512Go, parfait pour le dev.',
  id_user,
  'Marseille',
  800.00,
  NULL,
  TRUE
FROM user_cte;

