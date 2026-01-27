const express = require('express');
const cors = require('cors');
const storyRoutes = require('./src/api/story.routes'); 
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT_STORY;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

app.use(cors({ 
    origin: FRONTEND_ORIGIN, // Exemple en PROD
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.set('trust proxy', 1); 

app.use('/api/story', storyRoutes);

// Port d'écoute du Story Service
const port = PORT;

app.listen(port, () => {
    console.log(`Story-service running at http://localhost:${port}`);
});