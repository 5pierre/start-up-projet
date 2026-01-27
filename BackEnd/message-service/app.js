const express = require('express');
const cors = require('cors');
const messageRoutes = require('./src/api/message.routes'); 
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT_STORY; // a changer le nom avec le bon nom de service 
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN;

// app.use(cors({ 
//     origin: FRONTEND_ORIGIN, // Exemple en PROD
//     methods: ['GET', 'POST', 'PUT', 'DELETE'],
//     allowedHeaders: ['Content-Type', 'Authorization'],
//     credentials: true,
// }));

//test, allow all origins
app.use(cors({ 
    origin: FRONTEND_ORIGIN, // Utilisez la variable spécifique 'http://localhost:3000'
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true,
}));   


app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.set('trust proxy', 1); 

app.use('/api/message', messageRoutes);

// Port d'écoute du message Service
const port = PORT;

app.listen(port, () => {
    console.log(`message-service running at http://localhost:${port}`);
});