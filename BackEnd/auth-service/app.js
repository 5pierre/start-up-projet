const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/api/auth.routes');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const path = require('path');
const fs = require('fs');
const app = express();

// Création du dossier uploads/avatars s'il n'existe pas
const uploadsDir = path.join(__dirname, 'uploads/avatars');
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
    console.log('Dossier uploads/avatars créé');
}
app.use(helmet({
    crossOriginResourcePolicy: { policy: "cross-origin" }
}));

const PORT = process.env.PORT_AUTH;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(cors({ 
    origin: FRONTEND_ORIGIN,  //CHANGE IN PROD a rendre dynamique
    // origin: '*',
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Permet d'envoyer les cookies 
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

app.set('trust proxy', 1); // ?

app.use('/api/auth', authRoutes);
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

const port = PORT;
app.listen(port, () => {
    console.log(`Auth-service running at http://localhost:${port}`);
});


