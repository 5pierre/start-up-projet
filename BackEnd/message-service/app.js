const express = require('express');
const http = require('http');
const { Server } = require("socket.io");
const cors = require('cors');
const cookieParser = require('cookie-parser');
const cookie = require('cookie'); // Assure-toi d'avoir fait 'npm install cookie'
const helmet = require('helmet');
const jwt = require('jsonwebtoken');
const messageRoutes = require('./src/api/message.routes'); 
const { createMessage } = require('./src/data/message');

const app = express();
const PORT = process.env.PORT_STORY || 5000; 
const FRONTEND_ORIGIN = process.env.FRONTEND_ORIGIN || "http://localhost:3000";

// ==========================================
// 1. CONFIGURATION EXPRESS (Middlewares)
// ==========================================
// IMPORTANT : On met les middlewares AVANT de définir les routes ou le serveur
app.use(cors({ 
    origin: FRONTEND_ORIGIN,
    methods: ['GET', 'POST', 'PUT', 'DELETE'],
    allowedHeaders: ['Content-Type', 'Authorization'],
    credentials: true, // Indispensable pour les cookies
}));   

app.use(express.json());
app.use(cookieParser());
app.use(helmet());
app.set('trust proxy', 1); 

// Routes API classiques
app.use('/api/message', messageRoutes);


// ==========================================
// 2. CRÉATION DU SERVEUR HTTP + SOCKET
// ==========================================
const server = http.createServer(app);

const io = new Server(server, {
  cors: {
    origin: FRONTEND_ORIGIN,
    methods: ["GET", "POST"],
    credentials: true // Indispensable pour que Socket.io accepte les cookies
  }
});


// ==========================================
// 3. AUTHENTIFICATION SOCKET (CORRIGÉE)
// ==========================================
io.use((socket, next) => {
  // A. On récupère la chaîne brute des cookies envoyée par le navigateur
  const cookieHeader = socket.handshake.headers.cookie;
  
  if (!cookieHeader) {
      return next(new Error("Authentication error: No cookies found"));
  }

  // B. On transforme la chaîne en objet JS { token: "...", autre: "..." }
  const cookies = cookie.parse(cookieHeader);
  
  // C. ✅ CORRECTION CRITIQUE : On prend le token DANS le cookie
  // (Ton ancien code cherchait dans socket.handshake.auth.token, ce qui est vide)
  const token = cookies.token; 

  if (!token) return next(new Error("Authentication error: No token found in cookies"));

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    socket.user = decoded; // On attache l'utilisateur au socket
    next();
  } catch (err) {
    next(new Error("Authentication error: Invalid token"));
  }
});


// ==========================================
// 4. GESTION DES ÉVÉNEMENTS SOCKET
// ==========================================
io.on('connection', (socket) => {
  // Nom par défaut si "name" n'est pas dans le token
  const userName = socket.user.name || `User ${socket.user.id}`;
  console.log(`⚡ Client connecté : ${userName} (ID: ${socket.user.id})`);

  // Rejoindre la room privée
  socket.join(`user_${socket.user.id}`);

  // Écouter un message entrant
  socket.on('send_message', async (data) => {
    const { toUserId, content, annonceId } = data;
    const fromUserId = socket.user.id;

    // Petite sécurité anti-vide
    if (!content || !content.trim()) return;

    try {
      // A. Sauvegarde en BDD
      const annonceIdParsed = annonceId ? Number.parseInt(annonceId, 10) : null;
      const savedMessage = await createMessage(
        fromUserId,
        toUserId,
        content,
        Number.isInteger(annonceIdParsed) ? annonceIdParsed : null
      );
      
      const messageToSend = {
        ...savedMessage,
        content: savedMessage.contenu,
        sender_name: userName 
      };

      // B. Envoi au destinataire (Room privée)
      io.to(`user_${toUserId}`).emit('receive_message', messageToSend);
      
      // C. Envoi à l'expéditeur (Pour affichage immédiat)
      io.to(`user_${fromUserId}`).emit('receive_message', messageToSend);

    } catch (err) {
      console.error("Erreur socket save:", err);
      socket.emit('error', { message: "Message non sauvegardé" });
    }
  });

  socket.on('disconnect', () => {
    console.log(`Client déconnecté: ${socket.user.id}`);
  });
});


// ==========================================
// 5. DÉMARRAGE DU SERVEUR
// ==========================================
server.listen(PORT, () => {
  console.log(`message-service (HTTP+WS) running at http://localhost:${PORT}`);
});