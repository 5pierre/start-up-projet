const express = require('express');
const cors = require('cors');
const annonceRoutes = require('./src/api/annonce.routes'); 
const cookieParser = require('cookie-parser');
const helmet = require('helmet');
const app = express();

const PORT = process.env.PORT_ANNONCE || 3002;
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || 'http://localhost:3000';


app.use(cors({ 
  origin: FRONTEND_ORIGIN,
  methods: ['GET', 'POST', 'PUT', 'DELETE'],
  allowedHeaders: ['Content-Type', 'Authorization'],
  credentials: true,
}));

app.use(express.json());
app.use(cookieParser());
app.use(helmet());

app.set('trust proxy', 1); 

app.use('/api', annonceRoutes);

app.listen(PORT, () => {
  console.log(`Annonce-service running at http://localhost:${PORT}`);
});