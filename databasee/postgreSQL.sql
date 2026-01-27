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


