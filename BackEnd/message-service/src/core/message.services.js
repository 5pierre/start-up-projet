const { getMessages, createMessage, getConversations } = require('../data/message');
const fs = require('node:fs');
const jwt = require('jsonwebtoken');
const Key = process.env.JWT_SECRET;

const verifyToken = (token) => {
    if (!token) throw new Error("No token provided");
    return jwt.verify(token, Key);
};

// GET ALL MESSAGES
//on recupere les messages entre user1 et user2 et on envoie la discussion 
async function getAllMessages(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Non authentifié" });
    }

    const decodedToken = verifyToken(token);
    const user1 = decodedToken.id;  // utilisateur connecté
    const user2 = parseInt(req.params.user2Id);

    // const user2 = parseInt(req.params.user2Id); // utilisateur cible
    
    if (!user2 || isNaN(user2)) {
      return res.status(400).json({ error: "Valid user2Id is required" });
    }

    const messages = await getMessages(user1, user2);
    if (!messages || messages.length === 0) {
      return res.status(200).json({ message: "No messages found", messages: [] });
    }
    res.status(200).json({ messages });
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Messages fetched successfully\n");


  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching messages: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching messages" });
  }
}

// CREATE MESSAGE
async function createNewMessage(req, res) {
  try {
  const token = req.cookies.token;
  if (!token) {
        return res.status(401).json({ error: "Non authentifié" });
    }

    const decodedToken = verifyToken(token);
    const user1 = decodedToken.id; // utilisateur connecté
    const { content, id_user_2 } = req.body;
    const user2 = parseInt(id_user_2);

    if (!user2 || isNaN(user2)) {
        return res.status(400).json({ error: "Destinataire (id_user_2) manquant ou invalide" });
    }

    if (!content || typeof content !== 'string' || content.trim().length === 0) {
      return res.status(400).json({ error: "Messages content is required and must be a non-empty string" });
    }

    if (content.length > 5000) {
      return res.status(400).json({ error: "Message is too long (max 5000 characters)" });
    }

    if (content.length < 5) {
      return res.status(400).json({ error: "Message is too short (min 5 characters)" });
    }
    const newMessage = await createMessage(user1, user2, content)


      res.status(201).json({
        message: "Message created successfully",
        newMessage: newMessage
      });
      fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Message created successfully\n");

  } catch (err) {
    //fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error creating message: " + err + "\n");
    //res.status(500).json({ error: "Internal error while creating message" });
    console.error("CREATE MESSAGE ERROR:", err);
    fs.appendFileSync(
    '../../Log.txt',
    `${new Date().toISOString()} Error creating message: ${err.message}\n`
  );
  res.status(500).json({ error: err.message });
  }
}

// GET CONVERSATIONS LIST
async function getUserConversations(req, res) {
  try {
    const token = req.cookies.token;
    if (!token) {
        return res.status(401).json({ error: "Non authentifié" });
    }

    const decodedToken = verifyToken(token);
    const userId = decodedToken.id; // L'utilisateur connecté

    const conversations = await getConversations(userId);

    if (!conversations || conversations.length === 0) {
      // On renvoie un tableau vide plutôt qu'une erreur 404, c'est plus propre pour le frontend
      return res.status(200).json({ conversations: [] });
    }

    res.status(200).json({ conversations });
    
  } catch (err) {
    fs.appendFileSync('../../Log.txt', new Date().toISOString() + " Error fetching conversations list: " + err + "\n");
    res.status(500).json({ error: "Internal error while fetching conversations" });
  }
}

module.exports = { getAllMessages, createNewMessage, getUserConversations };