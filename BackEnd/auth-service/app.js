const express = require('express');
const cors = require('cors');
const authRoutes = require('./src/api/auth.routes');
const cookieParser = require('cookie-parser');
const helmet = require('helmet'); 
const app = express();
app.use(helmet());

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
app.use(cookieParser());

app.set('trust proxy', 1); // ?

app.use('/api/auth', authRoutes);

const port = PORT;
app.listen(port, () => {
    console.log(`Auth-service running at http://localhost:${port}`);
});


