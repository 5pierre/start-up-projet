CREATE TABLE utilisateur (
    id SERIAL PRIMARY KEY,
    email VARCHAR(255) UNIQUE NOT NULL,
    nom VARCHAR(100),
    prenom VARCHAR(100),
    ville VARCHAR(100),
    role VARCHAR(50),
    profile_description TEXT,
    password VARCHAR(255) NOT NULL,
    photo TEXT 
);

CREATE TABLE notes (
    id SERIAL PRIMARY KEY,
    note INT CHECK (note >= 0 AND note <= 5),
    commentaire TEXT,
    id_user INT REFERENCES utilisateur(id) ON DELETE CASCADE
);

CREATE TABLE annonces (
    id SERIAL PRIMARY KEY,
    titre VARCHAR(255) NOT NULL,
    description TEXT,
    id_user INT REFERENCES utilisateur(id) ON DELETE CASCADE,
    date_publication TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    lieu VARCHAR(255),
    prix DECIMAL(10, 2),
    photo TEXT,
    is_valide BOOLEAN DEFAULT FALSE 
);

CREATE TABLE messages (
    id SERIAL PRIMARY KEY,
    contenu TEXT NOT NULL,
    id_user_1 INT REFERENCES utilisateur(id), 
    id_user_2 INT REFERENCES utilisateur(id), 
    created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);
